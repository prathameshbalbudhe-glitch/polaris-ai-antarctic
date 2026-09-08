@echo off
cd /d "%~dp0"
if not exist node_modules npm install
if not exist .env copy .env.example .env
npm run dev
