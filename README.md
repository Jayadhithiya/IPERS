# IPERS — Intelligent Placement Eligibility & Recommendation System

**IPERS** is a full-stack university placement management and AI recommendation platform connecting **Students**, **Faculty Evaluators**, and **Training & Placement Coordinators (TPC)**. It evaluates student eligibility using transparent decision-tree rules, clusters recruiters into tiers with K-Means, and matches students with historical placed alumni using K-Nearest Neighbors (KNN).

---

## Key Features

- **Student Portal**
  - Manage academic profile (CGPA, internships, active arrears, key skills) with faculty verification status badges
  - Secure **Resume Vault** storing PDF resumes directly as binary BLOBs in the database
  - **AI Career Guidance Center** featuring:
    - **K-Means Company Tier Clustering** (*Dream / Tier-1*, *Technical Skill Focused*, *Service Sector*)
    - **Decision Tree Eligibility Breakdown** with step-by-step pass/fail criteria
    - **Alumni Career Blueprints (KNN)** comparing profiles against placed historical alumni
    - **Personalized Improvement Plan** with priority-ranked recommendations
  - Live campus placement announcements and company hiring updates

- **Faculty Evaluator Portal**
  - Search and filter student records by roll number or full name
  - Verify self-reported CGPA and internship counts
  - Record benchmark assessment scores (Aptitude, Technical, Communication)
  - Download and inspect student PDF resumes

- **TPC Coordinator Admin Console**
  - Add, edit, delete, and toggle hiring status (`Open` / `Closed`) for recruiting companies
  - Export real-time **Eligibility Reports (CSV)** across all students and open drives
  - Broadcast placement cell announcements and company-specific hiring updates

---

## Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite 8, Tailwind CSS 3, Lucide React, IBM Plex Sans & Mono |
| **Backend** | Python, Flask 3, Flask-CORS, Flask-SQLAlchemy, `itsdangerous`, `python-dotenv`, Gunicorn |
| **Database** | SQLite (default out-of-the-box) or PostgreSQL (`psycopg2-binary`) |
| **ML / Data Mining** | `scikit-learn` (K-Means, NearestNeighbors, StandardScaler), `pandas`, `numpy`, `scipy` |

---

## Project Structure

```text
IPERS/
├── backend/
│   ├── app.py                # Flask application factory & blueprints
│   ├── database.py           # SQLAlchemy instance
│   ├── models.py             # User, Student, Faculty, TPC, Company & News models
│   ├── data_mining.py        # K-Means, Decision Tree & KNN recommendation engine
│   ├── seed.py               # Database initializer & demo data seeder
│   ├── requirements.txt      # Python dependencies
│   ├── Procfile              # Production WSGI start command (Render / Railway)
│   ├── .env.example          # Environment variable template
│   └── routes/               # auth, student, faculty, tpc, common API blueprints
├── frontend/
│   ├── src/
│   │   ├── context/          # AuthContext & API base configuration
│   │   └── pages/            # Login, Student, Faculty & TPC dashboards
│   ├── package.json
│   └── vite.config.ts
└── .github/workflows/
    └── deploy-pages.yml      # GitHub Actions workflow for GitHub Pages
```

---

## Prerequisites

Install the following before setting up the project:

1. **Python 3.10+** — https://www.python.org/downloads/
   *(On Windows, check **"Add python.exe to PATH"** during installation.)*
2. **Node.js 18+ (LTS)** — https://nodejs.org/
3. **Git** — https://git-scm.com/downloads

---

## Local Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Jayadhithiya/IPERS.git
cd IPERS
```

### 2. Backend Setup (Terminal 1)

```bash
cd backend

# Create a virtual environment
python -m venv .venv
```

Activate the virtual environment:

- **Windows (PowerShell):**
  ```powershell
  .\.venv\Scripts\Activate.ps1
  ```
- **Windows (CMD):**
  ```cmd
  .\.venv\Scripts\activate.bat
  ```
- **macOS / Linux:**
  ```bash
  source .venv/bin/activate
  ```

Install Python dependencies:

```bash
# Recommended for Python 3.13 / 3.14+
pip install Flask flask-cors Flask-SQLAlchemy python-dotenv numpy pandas scikit-learn scipy

# Or use pinned versions on Python 3.10–3.12:
# pip install -r requirements.txt
```

Create a `.env` file inside `backend/` (uses SQLite automatically when `DATABASE_URL` is commented out):

```env
# Uncomment to use PostgreSQL instead of SQLite:
# DATABASE_URL=postgresql://postgres:your_password@localhost:5432/ipers

SECRET_KEY=ipers-dev-jwt-super-secret-key-129381
```

Seed the database with demo users, companies, and notices (first time only):

```bash
python seed.py
```

Start the Flask backend server:

```bash
python app.py
```

The backend API runs at `http://localhost:5000` (health check: `http://localhost:5000/health`).

---

### 3. Frontend Setup (Terminal 2)

Open a second terminal window:

```bash
cd frontend
npm install
npm run dev
```

Open the application in your browser at **http://localhost:5173/**.

---

## Default Demo Accounts

After running `python seed.py`, you can sign in with these demo accounts (or use the **Quick Demo Fill** buttons on the login screen):

| Role | Username | Password |
| :--- | :--- | :--- |
| **Student** | `student` *(also `high_performer`, `avg_student`)* | `student123` |
| **Faculty** | `faculty` *(also `faculty_ece`)* | `faculty123` |
| **TPC Coordinator** | `tpc` | `tpc123` |

---

## Switching to PostgreSQL (Optional)

IPERS works with PostgreSQL out of the box:

1. Create a PostgreSQL database named `ipers` (locally via pgAdmin/`psql`, or on Neon / Supabase).
2. Install the PostgreSQL driver inside `backend/.venv`:
   ```bash
   pip install psycopg2-binary
   ```
3. Set `DATABASE_URL` in `backend/.env`:
   ```env
   DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/ipers
   ```
4. Initialize tables and restart the backend:
   ```bash
   python seed.py
   python app.py
   ```
5. Confirm `http://localhost:5000/health` returns `"database": "postgresql"`.

---

## Deployment

### Frontend (GitHub Pages)
This repository includes `.github/workflows/deploy-pages.yml` for automatic deployment:
1. Go to **Settings → Pages → Build and deployment → Source** and choose **GitHub Actions**.
2. Go to **Settings → Secrets and variables → Actions → Variables** and add:
   - `VITE_API_URL` = `https://<your-deployed-backend-url>/api`
3. Push to `main` (or re-run the workflow in the **Actions** tab).

### Backend (Render / Railway)
Deploy the `backend/` folder as a Python web service:
- **Root Directory:** `backend`
- **Build Command:** `pip install -r requirements.txt`
- **Start Command:** `gunicorn --bind 0.0.0.0:$PORT "app:create_app()"`
- **Environment Variables:** `SECRET_KEY` and `DATABASE_URL` (PostgreSQL recommended for persistent cloud storage)
