# -*- coding: utf-8 -*-
"""
엔트리(EntryJS) 자동 채점 엔진 모듈입니다.
사용자가 제출한 엔트리 프로젝트 JSON 데이터를 파싱(Parsing)하고 분석하여,
문제에 설정된 채점 규칙(grading_rules)에 부합하는지 정적 분석(Static Analysis)을 수행합니다.
"""

import json


class EntryJudge:
    """
    엔트리 프로젝트 코드를 파싱하고 채점 규칙에 맞춰 검증을 수행하는 채점 클래스입니다.
    """

    def __init__(self, project_data_str):
        """
        초기화 메서드입니다.
        :param project_data_str: 사용자가 제출한 엔트리 프로젝트 JSON 문자열
        """
        self.raw_data = project_data_str
        self.project = {}
        self.parse_success = False

        # JSON 문자열 파싱 시도
        try:
            if project_data_str:
                self.project = json.loads(project_data_str)
                self.parse_success = True
        except Exception as e:
            print(f"[채점 에러] JSON 파싱 실패: {e}")
            self.parse_success = False

    def get_object_by_name(self, object_name):
        """
        오브젝트 이름을 기반으로 프로젝트 내의 오브젝트 정보를 가져옵니다.
        :param object_name: 찾고자 하는 오브젝트 이름 (예: "구름")
        :return: 오브젝트 딕셔너리 또는 None
        """
        if not self.parse_success or 'objects' not in self.project:
            return None

        for obj in self.project['objects']:
            if obj.get('name') == object_name:
                return obj
        return None

    def _traverse_blocks(self, block_data, callback):
        """
        블록 데이터 트리를 깊이 우선 탐색(DFS) 방식으로 재귀 순회하며 콜백 함수를 실행합니다.
        엔트리 블록은 리스트 내에 딕셔너리 형태로 들어있고, 하위 블록은 'statements'나 'result' 등에 중첩됩니다.
        :param block_data: 순회할 블록 데이터 (리스트 또는 딕셔너리)
        :param callback: 각 블록 딕셔너리를 인자로 받아 처리하는 함수
        """
        if isinstance(block_data, list):
            for item in block_data:
                self._traverse_blocks(item, callback)
        elif isinstance(block_data, dict):
            # 현재 블록 처리
            callback(block_data)

            # 1. 다음 연결된 블록 순회 (next)
            if 'next' in block_data and block_data['next']:
                self._traverse_blocks(block_data['next'], callback)

            # 2. 내부 구문 순회 (statements - 루프나 조건문 내부 블록들)
            if 'statements' in block_data and block_data['statements']:
                self._traverse_blocks(block_data['statements'], callback)

            # 3. 매개변수나 계산식 내의 블록 순회 (params)
            if 'params' in block_data and block_data['params']:
                self._traverse_blocks(block_data['params'], callback)

    def has_block_type(self, object_name, target_block_type):
        """
        특정 오브젝트에 특정 타입의 블록이 하나라도 존재하는지 확인합니다.
        :param object_name: 대상 오브젝트 이름
        :param target_block_type: 찾을 블록 타입 (예: "send_signal")
        :return: 존재 여부 (Boolean)
        """
        obj = self.get_object_by_name(object_name)
        if not obj:
            return False

        found = False

        def check_type(block):
            nonlocal found
            if block.get('type') == target_block_type:
                found = True

        # 오브젝트의 스크립트(블록 묶음) 전체 순회
        script_str = obj.get('script', '[]')
        try:
            script_data = json.loads(script_str)
            self._traverse_blocks(script_data, check_type)
        except Exception as e:
            print(f"[채점 에러] 스크립트 파싱 실패: {e}")

        return found

    def check_sequence(self, object_name, required_sequence):
        """
        특정 오브젝트 내의 특정 블록 체인이 지정된 순서대로 조립되어 있는지 확인합니다.
        :param object_name: 대상 오브젝트 이름
        :param required_sequence: 반드시 지켜야 하는 블록 타입 순서 리스트 (예: ["when_clicked_object", "change_shape", "send_signal"])
        :return: 순서 준수 여부 (Boolean)
        """
        obj = self.get_object_by_name(object_name)
        if not obj or not required_sequence:
            return False

        script_str = obj.get('script', '[]')
        try:
            script_data = json.loads(script_str)
        except Exception:
            return False

        match_found = False

        def search_sequence_in_tree(block):
            nonlocal match_found
            if match_found:
                return

            # 현재 블록부터 시작해서 아래로(next 링크를 따라) 순서대로 매칭되는지 확인
            current = block
            seq_index = 0
            
            while current and seq_index < len(required_sequence):
                # 블록의 타입 매칭 검사
                if current.get('type') == required_sequence[seq_index]:
                    seq_index += 1
                    current = current.get('next')
                else:
                    break

            # 순서 리스트의 모든 조건이 끝까지 매칭된 경우 성공
            if seq_index == len(required_sequence):
                match_found = True

        # 모든 블록 노드를 루트로 잡고 시퀀스 일치 여부 탐색
        self._traverse_blocks(script_data, search_sequence_in_tree)
        return match_found

    def judge_by_rules(self, grading_rules_str):
        """
        지정된 채점 규칙 문자열(JSON)에 따라 총점을 채점합니다.
        :param grading_rules_str: 채점 규칙 정의 JSON 문자열
        :return: (score, total_points, details_list) - 획득 점수, 총점, 상세 채점 결과 목록
        """
        # 규칙 파싱
        try:
            rules = json.loads(grading_rules_str) if grading_rules_str else []
        except Exception as e:
            print(f"[채점 에러] grading_rules 파싱 실패: {e}")
            return 0, 0, [{"error": "채점 규칙 파싱 실패"}]

        total_points = 0
        earned_score = 0
        details = []

        if not self.parse_success:
            # 제출한 코드 파싱이 아예 실패한 경우 모든 채점 항목 0점 처리
            for rule in rules:
                points = rule.get('points', 10)
                total_points += points
                details.append({
                    "rule_name": rule.get("name", "미지정 규칙"),
                    "passed": False,
                    "score": 0,
                    "max_score": points,
                    "reason": "제출 코드의 JSON 구조가 깨져 파싱할 수 없습니다."
                })
            return 0, total_points, details

        # 각 규칙 항목을 채점
        for rule in rules:
            rule_name = rule.get('name', '블록 검증')
            rule_type = rule.get('type')  # 'has_block' or 'sequence'
            object_name = rule.get('object_name')
            points = rule.get('points', 10)
            total_points += points

            passed = False
            reason = ""

            if rule_type == 'has_block':
                target_block = rule.get('target_block')
                passed = self.has_block_type(object_name, target_block)
                if passed:
                    reason = f"오브젝트 '{object_name}'에 '{target_block}' 블록이 존재합니다."
                else:
                    reason = f"오브젝트 '{object_name}'에 '{target_block}' 블록이 누락되었습니다."

            elif rule_type == 'sequence':
                sequence = rule.get('sequence', [])
                passed = self.check_sequence(object_name, sequence)
                if passed:
                    reason = f"오브젝트 '{object_name}'에 지정된 블록 순서 {sequence}가 올바르게 구성되었습니다."
                else:
                    reason = f"오브젝트 '{object_name}'에 지정된 블록 순서 {sequence}가 유실되었거나 올바르지 않습니다."
            else:
                reason = "알 수 없는 채점 규칙 형식입니다."

            earned_points = points if passed else 0
            earned_score += earned_points

            details.append({
                "rule_name": rule_name,
                "passed": passed,
                "score": earned_points,
                "max_score": points,
                "reason": reason
            })

        return earned_score, total_points, details
