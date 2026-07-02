from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
import time

options = Options()
options.add_argument('--headless')
options.set_capability('goog:loggingPrefs', {'browser': 'ALL'})

try:
    driver = webdriver.Chrome(options=options)
    # 로그인 정보 주입 (LocalStorage 우회)
    driver.get('http://myrobotgumi.pythonanywhere.com/auth.html')
    driver.execute_script("localStorage.setItem('user_id', '1'); localStorage.setItem('nickname', 'TestUser');")
    
    # 141번 문제로 접속
    driver.get('http://myrobotgumi.pythonanywhere.com/judge.html?id=141')
    time.sleep(3)  # 로딩 대기
    
    print('--- BEFORE CLICK LOGS ---')
    for entry in driver.get_log('browser'):
        print(f"[{entry['level']}] {entry['message']}")
        
    # 강제로 코드 쓰고 제출버튼 클릭
    driver.execute_script("if (typeof editor !== 'undefined') { editor.setValue('print(\"abs\")'); }")
    driver.execute_script("document.getElementById('submit-btn').click();")
    time.sleep(2)  # 통신/에러 대기
    
    print('--- AFTER CLICK LOGS ---')
    for entry in driver.get_log('browser'):
        print(f"[{entry['level']}] {entry['message']}")
        
    driver.quit()
except Exception as e:
    print('Selenium Error:', e)
