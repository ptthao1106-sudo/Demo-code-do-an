@echo off
cd /d "%~dp0"
echo ========================================
echo  He thong tim kiem tien ich cong cong
echo ========================================
echo.
where node >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Chua cai Node.js.
  echo Hay cai Node.js LTS roi chay lai file nay.
  pause
  exit /b 1
)
if not exist package.json (
  echo [ERROR] Khong tim thay package.json.
  pause
  exit /b 1
)
if not exist node_modules (
  echo [1/2] Dang cai dependencies...
  call npm install
  if errorlevel 1 (
    echo.
    echo [ERROR] npm install that bai.
    pause
    exit /b 1
  )
)
echo.
echo [2/2] Build frontend + khoi dong he thong cung mot cong...
call npm run dev
pause
