@echo off
chcp 65001 > nul
echo ========================================================
echo  [구미 마이로봇 코딩학원] 오라클 서버 원클릭 자동 배포
echo ========================================================
echo.

echo [1/2] 로컬 깃허브(GitHub) 푸시 확인...
git push origin master

echo.
echo [2/2] 오라클 서버 최신 배포 실행 중...
ssh -i "C:\AI\오라클\ssh-key-2026-11-19 (3).key" ubuntu@138.2.44.110 "bash /home/ubuntu/coding-judge-platform/deploy.sh"

echo.
echo ========================================================
echo  ★ 배포 완료: https://gumi-mycoding.duckdns.org
echo ========================================================
pause
