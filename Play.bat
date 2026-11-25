@echo off
cd /d "%~dp0"
set "PATH=%LOCALAPPDATA%\node-portable\node-v26.13.0-win-x64;%PATH%"
where node >nul 2>nul || (echo Node.js is required: https://nodejs.org & pause & exit /b)
if not exist node_modules call npm install
call npx vite build && call npx vite preview --port 5213 --open
