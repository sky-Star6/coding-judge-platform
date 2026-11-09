import os
import glob
import re
import json

vault_path = r"C:\AI\ObsidianVault\AI 도구"
output_json = r"C:\AI_Project\coding-judge-platform\materials\ai-tools\data\tools.json"

files = glob.glob(os.path.join(vault_path, "*.md"))
tool_files = [
    f for f in files 
    if not os.path.basename(f).startswith("00_") and not os.path.basename(f).startswith("01_")
]

print(f"Total tool files found: {len(tool_files)}")

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
        # 본문에서 첫 문장 추출
        sum_m = re.search(r'## 📌 핵심 요약.*?\n(.*?)\n', markdown_body, re.DOTALL)
        if sum_m:
            summary = sum_m.group(1).replace('- **', '').replace('**', '').replace('"', '').strip()
        else:
            summary = "최신 AI 도구 및 워크플로우 가이드"
    
    # 요약 길이 적정선 자르기 (너무 길면 카드에서 지저분하므로)
    summary_short = summary
    if len(summary_short) > 90:
        summary_short = summary_short[:87] + "..."
    
    # 4. 비용 모델 및 라이선스
    cost_match = re.search(r'cost_model:\s*(.*?)\s*$', frontmatter_str, re.MULTILINE)
    cost = cost_match.group(1).strip() if cost_match else "무료 / 오픈소스"
    
    # 5. 허브 분류 정밀 판별 (Frontmatter hub, type, 소속 허브, 태그, 파일명 순)
    hub_front = re.search(r'hub:\s*(.*?)\s*$', frontmatter_str, re.MULTILINE)
    type_front = re.search(r'type:\s*(.*?)\s*$', frontmatter_str, re.MULTILINE)
    hub_val = hub_front.group(1).strip() if hub_front else ""
    type_val = type_front.group(1).strip() if type_front else ""
    
    hub_body_match = re.search(r'소속 허브:\s*(.+)', markdown_body)
    hub_body_str = hub_body_match.group(1) if hub_body_match else ""
    
    tags_str = " ".join(tags)
    f_and_t = f"{fname} {tags_str} {type_val} {hub_val} {hub_body_str}"
    
    hub = "plugin"
    hub_name = "플러그인"
    badge_class = "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
    
    # 우선순위 판별
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
        # 본문 내 첫 번째 github.com URL 탐색
        gh_match = re.search(r'(https?://github\.com/[a-zA-Z0-9_.-]+/[a-zA-Z0-9_.-]+)', markdown_body)
        if gh_match:
            official_url = gh_match.group(1).rstrip('.git')
        else:
            official_url = "https://github.com"
    
    # 8. 제목 다듬기
    title = os.path.splitext(fname)[0]
    # 본문 첫 번째 # 헤더가 있으면 참조
    h1_match = re.search(r'^#\s+(.+)$', markdown_body, re.MULTILINE)
    if h1_match:
        h1_text = h1_match.group(1).strip()
        if len(h1_text) < 50 and not h1_text.startswith("#"):
            title = h1_text
    
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
        "tags": tags[:5],  # 상위 5개 태그
        "allTags": tags,
        "isLocal": is_local,
        "officialUrl": official_url,
        "content": markdown_body  # 옵시디언 본문 전문 100%
    })

# JSON 저장
with open(output_json, "w", encoding="utf-8") as fp:
    json.dump(tools, fp, ensure_ascii=False, indent=2)

print(f"SUCCESS: Saved {len(tools)} tools to {output_json}")
print(f"File size: {os.path.getsize(output_json) / 1024:.1f} KB")

# 허브별 통계
hubs_count = {}
for t in tools:
    h = t["hub"]
    hubs_count[h] = hubs_count.get(h, 0) + 1
local_cnt = sum(1 for t in tools if t["isLocal"])
print(f"Hub breakdown: {hubs_count}")
print(f"Local tools: {local_cnt}")
