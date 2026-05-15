# Seekh Lo

Gamified CS learning platform with ML personalized paths, coding challenges, and leaderboards.

## Member B (your part) — folder map

| Folder | Your responsibility |
|--------|---------------------|
| `frontend/` | React app: auth UI, dashboard, modules, quiz, coding challenge, leaderboard, progress, gamification |
| `ml-service/` | FastAPI ML recommender (60% collaborative + 40% content-based) |
| `code-runner/` | FastAPI + Docker sandbox for running student code |

Member A handles: Node backend, PostgreSQL, Redis, admin panel.

## Quick start (Member B)

### 1. Prerequisites
- Node.js 18+
- Python 3.11+
- Docker Desktop (optional but required for sandbox demo)

### 2. Docker sandbox image (coding challenges)
```bash
docker build -t seekhlo-code-runner ./code-runner
```

### 3. Start services (3 terminals)

**Terminal A — ML service (port 8001):**
```bash
cd ml-service
pip install -r requirements.txt
uvicorn main:app --reload --port 8001
```

**Terminal B — Code runner (port 8002):**
```bash
cd code-runner
pip install -r requirements.txt
uvicorn main:app --reload --port 8002
```

**Terminal C — Frontend:**
```bash
cd frontend
npm install
npm run dev
```

Or on Windows: `.\scripts\start-member-b.ps1`

### 4. Open app
http://localhost:5173

**Demo login:** `test@test.com` / `123456`  
**New user flow:** Sign up → onboarding quiz → dashboard

## Test checklist (Member B SRS items)

- [ ] **Sign up / Login / Forgot password** — `/signup`, `/login`, `/forgot-password`
- [ ] **Onboarding quiz** — after signup, sets ML starter path scores
- [ ] **Dashboard** — XP, level, streak, badges, ML learning path
- [ ] **Skip recommendation** — Skip button on path item
- [ ] **ML path** — path shows "Recommended by AI" when `ml-service` is running
- [ ] **ML fallback** — stop ML service; path shows default difficulty order
- [ ] **Text module** — open Recursion Basics, read lesson, take quiz
- [ ] **Video module** — Linked Lists shows video placeholder
- [ ] **Quiz module** — Binary Search opens quiz directly
- [ ] **Coding challenge** — Factorial Challenge: editor, Run Tests, hints, 5 retries then cooldown, Save draft
- [ ] **XP toast + level up** — complete quiz/challenge, see notifications
- [ ] **Leaderboard** — Daily / Weekly / All Time tabs, your row highlighted
- [ ] **Progress history** — `/progress` shows activity log

## API health checks

```bash
curl http://localhost:8001/health
curl http://localhost:8002/health
```

## Factorial challenge solution (for testing)

```python
def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)
```
