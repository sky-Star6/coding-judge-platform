import os
import glob
import re
import json

vault_path = r"C:\AI\ObsidianVault\AI 도구"
output_json = r"C:\AI_Project\coding-judge-platform\materials\ai-tools\data\tools.json"
matrix_json_path = r"C:\AI_Project\coding-judge-platform\materials\ai-tools\data\matrix.json"

# 1. 02_4대_에이전트_런타임별_AI도구_호환성_및_연동_매트릭스.md 로드 및 파싱
matrix_file = os.path.join(vault_path, "02_4대_에이전트_런타임별_AI도구_호환성_및_연동_매트릭스.md")
matrix_body = ""
specific_compat_map = {}

if os.path.exists(matrix_file):
    with open(matrix_file, "r", encoding="utf-8") as f:
        matrix_raw = f.read()
    
    # 프론트매터 분리
    if matrix_raw.startswith("---"):
        parts = matrix_raw.split("---", 2)
        if len(parts) >= 3:
            matrix_body = parts[2].strip()
    else:
        matrix_body = matrix_raw.strip()

    # 테이블에서 개별 도구 호환성 추출
    lines = matrix_body.splitlines()
    for line in lines:
        line = line.strip()
        if line.startswith("|") and not line.startswith("| 도구명") and not line.startswith("|---") and not line.startswith("| 도구 형태"):
            cols = [c.strip() for c in line.split("|")[1:-1]]
            if len(cols) >= 5:
                raw_name = cols[0]
                clean_name = re.sub(r'[*_`\[\]]', '', raw_name).strip()
                specific_compat_map[clean_name.lower()] = {
                    "claude_str": cols[1],
                    "agy_str": cols[2],
                    "codex_str": cols[3],
                    "hermes_str": cols[4],
                    "comment": cols[5] if len(cols) > 5 else ""
                }

print(f"Matrix guide loaded: {len(matrix_body)} chars, {len(specific_compat_map)} mapped tools.")

# 2. 순수 도구 파일 목록 수집 (00_, 01_, 02_ 및 허브 MOC 문서 제외)
files = glob.glob(os.path.join(vault_path, "*.md"))
tool_files = [
    f for f in files 
    if not os.path.basename(f).startswith(("00_", "01_", "02_"))
    and os.path.basename(f) not in ["에이전트.md", "MCP.md", "스킬.md", "플러그인.md", "프롬프트.md"]
]

# 파일명 가나다순/알파벳순 정렬로 일관성 유지
tool_files.sort(key=lambda x: os.path.basename(x).lower())

print(f"Total tool files found: {len(tool_files)}")

def parse_status_code(status_str):
    if "🟢" in status_str:
        return "native" if "네이티브" in status_str or "즉시" in status_str else "supported"
    elif "🟡" in status_str:
        return "manual"
    elif "🔴" in status_str:
        return "bridge"
    elif "⚠️" in status_str:
        return "api"
    return "supported"

tools = []

for idx, fpath in enumerate(tool_files):
    fname = os.path.basename(fpath)
    tool_id = re.sub(r'[^a-zA-Z0-9가-힣_-]', '_', os.path.splitext(fname)[0])
    
    with open(fpath, "r", encoding="utf-8", errors="replace") as fp:
        raw_content = fp.read()
    
    # 1. Frontmatter 분리
    frontmatter_str = ""
    markdown_body = raw_content
    if raw_content.startswith("---"):
        parts = raw_content.split("---", 2)
        if len(parts) >= 3:
            frontmatter_str = parts[1]
            markdown_body = parts[2].strip()
    
    # 2. 태그 추출
    tags_match = re.search(r'tags:\s*\[(.*?)\]', frontmatter_str)
    tags = []
    if tags_match:
        tags_raw = tags_match.group(1).split(',')
        tags = [t.strip().strip("'\"") for t in tags_raw if t.strip()]
    
    # 3. 요약 추출
    summary_match = re.search(r'summary:\s*["\']?(.*?)["\']?\s*$', frontmatter_str, re.MULTILINE)
    summary = summary_match.group(1).strip().strip("'\"") if summary_match else ""
    if not summary:
        sum_m = re.search(r'## 📌 핵심 요약.*?\n(.*?)\n', markdown_body, re.DOTALL)
        if sum_m:
            summary = sum_m.group(1).replace('- **', '').replace('**', '').replace('"', '').strip()
        else:
            summary = "최신 AI 도구 및 워크플로우 가이드"
    
    summary_short = summary
    if len(summary_short) > 90:
        summary_short = summary_short[:87] + "..."
    
    # 4. 비용 모델 및 라이선스
    cost_match = re.search(r'cost_model:\s*(.*?)\s*$', frontmatter_str, re.MULTILINE)
    cost = cost_match.group(1).strip() if cost_match else "무료 / 오픈소스"
    
    # 5. 허브 분류 정밀 판별
    hub_front = re.search(r'hub:\s*(.*?)\s*$', frontmatter_str, re.MULTILINE)
    type_front = re.search(r'type:\s*(.*?)\s*$', frontmatter_str, re.MULTILINE)
    hub_val = hub_front.group(1).strip() if hub_front else ""
    type_val = type_front.group(1).strip() if type_front else ""
    
    hub_body_match = re.search(r'소속 허브:\s*(.+)', markdown_body)
    hub_body_str = hub_body_match.group(1) if hub_body_match else ""
    
    tags_str = " ".join(tags)
    hub = "plugin"
    hub_name = "플러그인"
    badge_class = "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
    
    if "MCP" in hub_val or "[[MCP]]" in hub_body_str or type_val.startswith("MCP") or fname.endswith("MCP.md") or re.search(r'\bMCP\b', fname) or "MCP" in tags:
        hub = "mcp"
        hub_name = "MCP"
        badge_class = "bg-amber-500/15 text-amber-300 border-amber-500/30"
    elif "스킬" in hub_val or "skill" in hub_val.lower() or "[[스킬]]" in hub_body_str or "스킬" in type_val or fname.endswith("스킬.md") or "스킬" in tags or "skill" in [t.lower() for t in tags]:
        hub = "skill"
        hub_name = "스킬"
        badge_class = "bg-purple-500/15 text-purple-300 border-purple-500/30"
    elif "프롬프트" in hub_val or "prompt" in hub_val.lower() or "[[프롬프트]]" in hub_body_str or "프롬프트" in type_val or fname.endswith("프롬프트.md") or "프롬프트" in tags:
        hub = "prompt"
        hub_name = "프롬프트"
        badge_class = "bg-rose-500/15 text-rose-300 border-rose-500/30"
    elif "에이전트" in hub_val or "agent" in hub_val.lower() or "[[에이전트]]" in hub_body_str or "에이전트" in type_val or "에이전트" in fname or "ADE" in tags or "에이전트" in tags:
        hub = "agent"
        hub_name = "에이전트"
        badge_class = "bg-blue-500/15 text-blue-300 border-blue-500/30"
    elif "플러그인" in hub_val or "plugin" in hub_val.lower() or "[[플러그인]]" in hub_body_str or "플러그인" in type_val or "플러그인" in tags:
        hub = "plugin"
        hub_name = "플러그인"
        badge_class = "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
        
    # 6. 로컬 설치 / 자체호스팅 여부
    is_local = any(k in tags_str or k in markdown_body for k in ["로컬", "온디바이스", "자체호스팅", "셀프호스팅", "오프라인", "Local-First"])
    
    # 7. 공식 URL 추출 (마크다운 링크 포함)
    official_url = ""
    url_match = re.search(r'(?:공식 사이트|공식 웹사이트|홈페이지|GitHub|저장소|Official)[^\n]*?(https?://[^\s\)\>]+)', markdown_body, re.IGNORECASE)
    if url_match:
        official_url = url_match.group(1).rstrip('.,;)]')
    else:
        gh_match = re.search(r'(https?://github\.com/[a-zA-Z0-9_.-]+/[a-zA-Z0-9_.-]+)', markdown_body)
        if gh_match:
            official_url = gh_match.group(1).rstrip('.git')
        else:
            official_url = "https://github.com"
    
    # 8. 제목 다듬기
    title = os.path.splitext(fname)[0]
    h1_match = re.search(r'^#\s+(.+)$', markdown_body, re.MULTILINE)
    if h1_match:
        h1_text = h1_match.group(1).strip()
        if len(h1_text) < 50 and not h1_text.startswith("#"):
            title = h1_text

    # 9. 4대 에이전트 런타임 호환성 (Codex, Claude, Antigravity, Hermes) 정밀 산출
    fname_lower = fname.lower()
    title_lower = title.lower()
    
    # 매트릭스 문서에 특정 도구가 매핑되어 있는지 우선 확인
    matched_matrix = None
    for k, v in specific_compat_map.items():
        if k in fname_lower or k in title_lower:
            matched_matrix = v
            break
            
    if matched_matrix:
        compat = {
            "claude": {
                "status": parse_status_code(matched_matrix["claude_str"]),
                "label": matched_matrix["claude_str"].replace('<br/>', ' '),
                "detail": "Claude 공식 매트릭스 지정"
            },
            "antigravity": {
                "status": parse_status_code(matched_matrix["agy_str"]),
                "label": matched_matrix["agy_str"].replace('<br/>', ' '),
                "detail": "Antigravity 공식 매트릭스 지정"
            },
            "codex": {
                "status": parse_status_code(matched_matrix["codex_str"]),
                "label": matched_matrix["codex_str"].replace('<br/>', ' '),
                "detail": "Codex(GPT) 공식 매트릭스 지정"
            },
            "hermes": {
                "status": parse_status_code(matched_matrix["hermes_str"]),
                "label": matched_matrix["hermes_str"].replace('<br/>', ' '),
                "detail": "Hermes 공식 매트릭스 지정"
            },
            "note": matched_matrix["comment"]
        }
    else:
        # 특정 신규 도구 전용 고도화 매핑
        if "codex-plugin-cc" in fname_lower:
            compat = {
                "claude": {"status": "native", "label": "🟢 공식 플러그인", "detail": "Claude Code 공식 플러그인 마켓플레이스 연동"},
                "antigravity": {"status": "native", "label": "🟢 CLI/위임 지원", "detail": "AGY 터미널에서 codex cli 위임 파이프라인 구동"},
                "codex": {"status": "native", "label": "🟢 네이티브", "detail": "OpenAI 공식 Codex 백엔드 직결"},
                "hermes": {"status": "manual", "label": "🟡 수동 연동", "detail": "OpenAI API 프록시 설정 필요"}
            }
        elif "meetily" in fname_lower:
            compat = {
                "claude": {"status": "native", "label": "🟢 100% 로컬", "detail": "로컬 Whisper 오디오 전사 및 마크다운 생성"},
                "antigravity": {"status": "native", "label": "🟢 100% 로컬", "detail": "로컬 파일 연동 및 AGY 회의록 분석"},
                "codex": {"status": "native", "label": "🟢 100% 로컬", "detail": "독립 앱 실행 및 로컬 마크다운 추출"},
                "hermes": {"status": "native", "label": "🟢 100% 로컬", "detail": "완전 오프라인 환경 100% 구동"}
            }
        elif "herdr" in fname_lower:
            compat = {
                "claude": {"status": "native", "label": "🟢 독자 런타임", "detail": "Claude Code CLI 세션 멀티플렉싱 및 관제"},
                "antigravity": {"status": "native", "label": "🟢 독자 런타임", "detail": "AGY 터미널 백그라운드 태스크 병렬 지휘"},
                "codex": {"status": "native", "label": "🟢 독자 런타임", "detail": "Codex CLI 다중 세션 모니터링"},
                "hermes": {"status": "native", "label": "🟢 독자 런타임", "detail": "순수 Rust 기반 크로스 런타임 오케스트레이션"}
            }
        elif "cubesandbox" in fname_lower:
            compat = {
                "claude": {"status": "native", "label": "🟢 격리 인프라", "detail": "텐센트 RustVMM 100ms MicroVM 안전 격리"},
                "antigravity": {"status": "native", "label": "🟢 격리 인프라", "detail": "AGY 코드 실행 시 서브프로세스 보안 샌드박싱"},
                "codex": {"status": "native", "label": "🟢 격리 인프라", "detail": "Codex 생성 코드의 안전한 독립 격리 실행"},
                "hermes": {"status": "native", "label": "🟢 격리 인프라", "detail": "자율 에이전트 시스템 위험 명령 차단 및 방어"}
            }
        elif "craft anything" in fname_lower:
            compat = {
                "claude": {"status": "supported", "label": "🟢 터미널/Rust", "detail": "순수 Rust CLI로 소프트웨어 역공학 및 클론"},
                "antigravity": {"status": "supported", "label": "🟢 터미널/Rust", "detail": "run_command로 리버스 엔지니어링 실행"},
                "codex": {"status": "supported", "label": "🟢 터미널/Rust", "detail": "Codex Bash 터미널에서 바이너리 분석 실행"},
                "hermes": {"status": "supported", "label": "🟢 터미널/Rust", "detail": "로컬 빌드 환경에서 완전 자율 역공학"}
            }
        elif "awesome-llm-apps" in fname_lower:
            compat = {
                "claude": {"status": "native", "label": "🟢 즉시 활용", "detail": "100+ 실전 RAG/에이전트 소스코드 즉시 복사"},
                "antigravity": {"status": "native", "label": "🟢 즉시 활용", "detail": "AGY 프롬프트/파이썬 파이프라인 100% 실행"},
                "codex": {"status": "native", "label": "🟢 즉시 활용", "detail": "OpenAI SDK 및 LangChain 쿡북 즉시 실행"},
                "hermes": {"status": "native", "label": "🟢 즉시 활용", "detail": "로컬 LLM 연동 실전 앱 즉시 구현"}
            }
        elif "k-kitchen" in fname_lower:
            compat = {
                "claude": {"status": "supported", "label": "🟢 웹 아키텍처", "detail": "Astro SSG 및 마크다운 웹사이트 구축 가이드"},
                "antigravity": {"status": "native", "label": "🟢 MCP 풀스택", "detail": "Antigravity 내장 MCP(Vercel, DevTools, GitHub) 직결"},
                "codex": {"status": "supported", "label": "🟢 코드 생성", "detail": "Astro/shadcn 프론트엔드 코드 생성"},
                "hermes": {"status": "supported", "label": "🟢 로컬 개발", "detail": "마크다운 기반 정적 웹사이트 로컬 빌드"}
            }
        # 일반 규칙 기반 자동 부여
        elif hub == "skill":
            compat = {
                "claude": {"status": "native", "label": "🟢 즉시 사용", "detail": "~/.claude/skills/ 자동 인식 (100% 네이티브)"},
                "antigravity": {"status": "native", "label": "🟢 즉시 사용", "detail": "AGY 스킬 규격 100% 네이티브 호환"},
                "codex": {"status": "manual", "label": "🟡 수동 주입", "detail": "Instructions/규칙으로 프롬프트 주입"},
                "hermes": {"status": "manual", "label": "🟡 수동 주입", "detail": "시스템 프롬프트/함수 툴 주입"}
            }
        elif hub == "mcp":
            compat = {
                "claude": {"status": "native", "label": "🟢 즉시 사용", "detail": "Anthropic 표준 MCP 프로토콜 직결"},
                "antigravity": {"status": "native", "label": "🟢 즉시 사용", "detail": "AGY 내장 MCP 클라이언트 완벽 호환"},
                "codex": {"status": "bridge", "label": "🔴 브릿지 필요", "detail": "OpenAI Function Calling 변환 프록시 필요"},
                "hermes": {"status": "manual", "label": "🟡 래퍼 필요", "detail": "Python mcp 클라이언트 래핑 필요"}
            }
        elif hub == "agent":
            if "anthropic" in fname_lower or "claude" in fname_lower:
                compat = {
                    "claude": {"status": "native", "label": "🟢 즉시 사용", "detail": "Claude Code/Cowork 공식 에이전트 팩"},
                    "antigravity": {"status": "native", "label": "🟢 지원", "detail": "AGY 서브에이전트/스킬로 구동 가능"},
                    "codex": {"status": "manual", "label": "🟡 프롬프트 이식", "detail": "시스템 프롬프트/도구 재정의 필요"},
                    "hermes": {"status": "manual", "label": "🟡 프롬프트 이식", "detail": "Hermes 프롬프트/도구 재정의 필요"}
                }
            elif any(k in fname_lower or k in tags_str for k in ["deepseek", "paperclip", "trading", "langgraph", "crewai", "autogen"]):
                compat = {
                    "claude": {"status": "native", "label": "🟢 독자 실행", "detail": "독자 런타임 및 Claude API 백엔드 지원"},
                    "antigravity": {"status": "native", "label": "🟢 독자 실행", "detail": "독자 런타임 및 AGY 터미널 관제 지원"},
                    "codex": {"status": "native", "label": "🟢 독자 실행", "detail": "GPT-4o/Codex API 백엔드 지원"},
                    "hermes": {"status": "native", "label": "🟢 독자 실행", "detail": "Hermes/OpenClaw 모델 백엔드 지원"}
                }
            else:
                compat = {
                    "claude": {"status": "supported", "label": "🟢 지원", "detail": "Claude 환경 구동 지원"},
                    "antigravity": {"status": "supported", "label": "🟢 지원", "detail": "Antigravity 터미널/에이전트 구동"},
                    "codex": {"status": "supported", "label": "🟢 지원", "detail": "Codex 환경 실행 지원"},
                    "hermes": {"status": "supported", "label": "🟢 지원", "detail": "Hermes 런타임 구동"}
                }
        elif hub == "prompt":
            compat = {
                "claude": {"status": "native", "label": "🟢 즉시 복사", "detail": "프롬프트 즉시 주입 사용"},
                "antigravity": {"status": "native", "label": "🟢 즉시 복사", "detail": "프롬프트 즉시 주입 사용"},
                "codex": {"status": "native", "label": "🟢 즉시 복사", "detail": "프롬프트 즉시 주입 사용"},
                "hermes": {"status": "native", "label": "🟢 즉시 복사", "detail": "프롬프트 즉시 주입 사용"}
            }
        else: # plugin
            is_cli = any(k in tags_str or k in markdown_body.lower() for k in ["cli", "터미널", "명령줄", "스크립트", "파이썬"])
            if is_cli:
                compat = {
                    "claude": {"status": "supported", "label": "🟢 터미널 지원", "detail": "Bash 실행 권한으로 100% 동작"},
                    "antigravity": {"status": "supported", "label": "🟢 터미널 지원", "detail": "run_command 권한으로 100% 동작"},
                    "codex": {"status": "supported", "label": "🟢 터미널 지원", "detail": "Codex Bash 권한으로 100% 동작"},
                    "hermes": {"status": "supported", "label": "🟢 터미널 지원", "detail": "로컬 셸 권한으로 100% 동작"}
                }
            else:
                compat = {
                    "claude": {"status": "supported", "label": "🟢 외부 연동", "detail": "데스크톱/브라우저 연동"},
                    "antigravity": {"status": "supported", "label": "🟢 외부 연동", "detail": "웹/로컬 환경 연동"},
                    "codex": {"status": "manual", "label": "🟡 수동 연동", "detail": "외부 앱 수동 실행"},
                    "hermes": {"status": "manual", "label": "🟡 수동 연동", "detail": "외부 앱 수동 실행"}
                }

    # API / GPU 필수 여부
    if any(k in tags_str or k in markdown_body for k in ["API키", "유료 API", "GPU 필요", "ComfyUI", "클라우드 크레딧"]):
        compat["requires_infra"] = True
        compat["infra_note"] = "⚠️ API 키 또는 로컬 GPU 인프라 필요"

    tools.append({
        "id": f"tool_{idx}",
        "rawId": tool_id,
        "title": title,
        "filename": fname,
        "hub": hub,
        "hubName": hub_name,
        "badgeClass": badge_class,
        "cost": cost,
        "summary": summary,
        "summaryShort": summary_short,
        "tags": tags[:5],
        "allTags": tags,
        "isLocal": is_local,
        "officialUrl": official_url,
        "compat": compat,
        "content": markdown_body
    })

# JSON 저장
with open(output_json, "w", encoding="utf-8") as fp:
    json.dump(tools, fp, ensure_ascii=False, indent=2)

print(f"SUCCESS: Saved {len(tools)} tools to {output_json}")
print(f"File size: {os.path.getsize(output_json) / 1024:.1f} KB")

# 매트릭스 전체 가이드 JSON 저장
matrix_data = {
    "title": "4대 에이전트 런타임별 AI 도구 호환성 및 연동 매트릭스",
    "updated": "2026-11-09",
    "runtimes": ["Claude", "Antigravity", "Codex", "Hermes"],
    "content": matrix_body
}
with open(matrix_json_path, "w", encoding="utf-8") as fp:
    json.dump(matrix_data, fp, ensure_ascii=False, indent=2)

print(f"SUCCESS: Saved matrix guide to {matrix_json_path}")
print(f"File size: {os.path.getsize(matrix_json_path) / 1024:.1f} KB")

# 호환성 통계 출력
claude_native = sum(1 for t in tools if t["compat"]["claude"]["status"] in ["native", "supported"])
agy_native = sum(1 for t in tools if t["compat"]["antigravity"]["status"] in ["native", "supported"])
codex_native = sum(1 for t in tools if t["compat"]["codex"]["status"] in ["native", "supported"])
hermes_native = sum(1 for t in tools if t["compat"]["hermes"]["status"] in ["native", "supported"])

print(f"\n[4 Runtimes Compatibility Statistics (Total: {len(tools)})]")
print(f" - Claude (Anthropic): {claude_native} tools ({claude_native/len(tools)*100:.1f}%)")
print(f" - Antigravity (Google): {agy_native} tools ({agy_native/len(tools)*100:.1f}%)")
print(f" - Codex (OpenAI GPT): {codex_native} tools ({codex_native/len(tools)*100:.1f}%)")
print(f" - Hermes (Nous Research): {hermes_native} tools ({hermes_native/len(tools)*100:.1f}%)")
