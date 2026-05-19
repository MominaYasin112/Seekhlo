# Seekh Lo

Gamified CS learning platform — Member A (backend/DB) + Member B (frontend/ML/code-runner).

## Run the full project (integrated)

### 1. Database + Redis
```bash
docker compose up postgres redis -d
```

### 2. Backend env
```bash
cd backend
copy .env.example .env
npm install
npm run dev
```
Runs on http://localhost:5000

### 3. ML + Code runner (Member B)
```bash
# Terminal 2
cd ml-service
pip install -r requirements.txt
uvicorn main:app --reload --port 8001

# Terminal 3
cd code-runner
pip install -r requirements.txt
uvicorn main:app --reload --port 8002
```

### 4. Frontend env
```bash
cd frontend
copy .env.example .env
npm install
npm run dev
```
Open http://localhost:5173

### 5. Sign up & test
- Sign up with your email (DEV_AUTO_VERIFY=true skips email)
- Complete onboarding → dashboard
- XP saves to PostgreSQL when backend is connected

## Member folders

| Folder | Owner |
|--------|--------|
| `backend/` | Member A |
| `frontend/` | Member B |
| `ml-service/` | Member B |
| `code-runner/` | Member B |
