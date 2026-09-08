@echo off
cd /d "%~dp0backend"
if not exist .venv py -m venv .venv
call .venv\Scripts\activate
py -m pip install -r requirements.txt
if not exist .env copy .env.example .env
uvicorn app:app --reload --port 8000
