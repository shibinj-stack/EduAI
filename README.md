# AI Study Buddy

Full-stack app: React + Vite + Tailwind frontend, Python Flask backend, Firebase Auth + Firestore, Google Gemini AI.

## Setup

### 1. Firebase
1. Create project at https://console.firebase.google.com
2. Enable **Authentication → Email/Password**
3. Create **Firestore Database** (test mode)
4. Project Settings → General → Add Web App → copy config into `frontend/.env`
5. Project Settings → Service Accounts → Generate new private key → save as `backend/serviceAccountKey.json`

### 2. Gemini API
Get key at https://aistudio.google.com/apikey

### 3. Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env       # fill in GEMINI_API_KEY
python app.py
```
Runs at http://localhost:5000

### 4. Frontend
```bash
cd frontend
npm install
cp .env.example .env       # fill in VITE_FIREBASE_* and VITE_API_URL=http://localhost:5000
npm run dev
```
Runs at http://localhost:5173

## Deployment
- **Frontend → Vercel**: `vercel deploy` in `frontend/`
- **Backend → Render**: new Web Service, root `backend/`, build `pip install -r requirements.txt`, start `gunicorn app:app`. Add `serviceAccountKey.json` content as `FIREBASE_SERVICE_ACCOUNT` env var (JSON string), plus `GEMINI_API_KEY`.
