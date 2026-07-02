# -*- coding: utf-8 -*-
"""
엔트리(EntryJS) 구동에 필요한 정적 자산(CSS, JS, 의존성 라이브러리 등)을
공식 CDN 주소에서 다운로드하여 프로젝트 static/entryjs 폴더에 구성하는 스크립트입니다.
이 스크립트를 최초 1회 실행하면, 오프라인 환경에서도 엔트리를 로컬로 구동할 수 있습니다.
"""

import os
import urllib.request

# 프로젝트 기준 디렉토리 경로 설정
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ENTRY_STATIC_DIR = os.path.join(BASE_DIR, 'static', 'entryjs')

# 필요한 다운로드 대상 정의 (로컬 경로와 CDN URL의 매핑)
DOWNLOAD_LIST = [
    # 1. 의존성 라이브러리 (jQuery, CreateJS, Lodash, Angular 등)
    {
        'local_path': 'lib/jquery.min.js',
        'url': 'https://entry-cdn.pstatic.net/assets/lib/jquery/jquery-1.9.1.min.js'
    },
    {
        'local_path': 'lib/easeljs.min.js',
        'url': 'https://entry-cdn.pstatic.net/assets/lib/createjs/easeljs-0.8.0.min.js'
    },
    {
        'local_path': 'lib/preloadjs.min.js',
        'url': 'https://entry-cdn.pstatic.net/assets/lib/createjs/preloadjs-0.6.0.min.js'
    },
    {
        'local_path': 'lib/soundjs.min.js',
        'url': 'https://entry-cdn.pstatic.net/assets/lib/createjs/soundjs-0.6.0.min.js'
    },
    {
        'local_path': 'lib/lodash.min.js',
        'url': 'https://entry-cdn.pstatic.net/assets/lib/lodash/dist/lodash.min.js'
    },
    {
        'local_path': 'lib/angular.min.js',
        'url': 'https://entry-cdn.pstatic.net/assets/lib/angular/angular.min.js'
    },
    {
        'local_path': 'lib/angular-route.min.js',
        'url': 'https://entry-cdn.pstatic.net/assets/lib/angular-route/angular-route.min.js'
    },
    # 2. 엔트리 코어 엔진 (EntryJS - 특정 안정 버전 4.0.20 권장)
    {
        'local_path': 'js/entry.js',
        'url': 'https://cdn.jsdelivr.net/npm/@entrylabs/entry@4.0.20/dist/entry.js'
    },
    {
        'local_path': 'css/entry.css',
        'url': 'https://cdn.jsdelivr.net/npm/@entrylabs/entry@4.0.20/dist/entry.css'
    },
    # 3. 추가 이미지 리소스 (스프라이트 등)
    {
        'local_path': 'images/sprite.png',
        'url': 'https://cdn.jsdelivr.net/npm/@entrylabs/entry@4.0.20/dist/sprite.png'
    }
]


def create_directories():
    """
    엔트리 리소스가 다운로드될 static/entryjs 안의 하위 폴더들을 생성합니다.
    """
    sub_dirs = ['js', 'css', 'lib', 'images']
    for folder in sub_dirs:
        target_path = os.path.join(ENTRY_STATIC_DIR, folder)
        if not os.path.exists(target_path):
            os.makedirs(target_path)
            print(f"[생성 완료] 디렉토리 생성: {target_path}")


def download_files():
    """
    지정된 CDN 리스트를 순회하며 파일을 다운로드하여 저장합니다.
    """
    print("▶ 엔트리(EntryJS) 라이브러리 파일 다운로드를 시작합니다.")
    
    # 웹 요청 시 브라우저인 것처럼 보이도록 User-Agent 설정
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
    
    for item in DOWNLOAD_LIST:
        local_file_path = os.path.join(ENTRY_STATIC_DIR, item['local_path'])
        
        # 파일이 이미 존재하는 경우 덮어쓰지 않고 넘어갑니다. (재다운로드 생략)
        if os.path.exists(local_file_path):
            print(f"[스킵] 이미 존재하는 파일입니다: {item['local_path']}")
            continue
            
        print(f"[다운로드 중] {item['url']} -> {item['local_path']}")
        
        try:
            # Request 객체를 생성하여 헤더 주입 후 다운로드 진행
            req = urllib.request.Request(item['url'], headers=headers)
            with urllib.request.urlopen(req) as response:
                with open(local_file_path, 'wb') as out_file:
                    out_file.write(response.read())
            print(f"[성공] 저장 완료: {item['local_path']}")
        except Exception as e:
            print(f"[에러 발생] {item['local_path']} 다운로드 실패: {e}")


if __name__ == '__main__':
    # 디렉토리 구조 먼저 만들기
    create_directories()
    # 파일 다운로드 실행
    download_files()
    print("▶ 모든 작업이 완료되었습니다.")
