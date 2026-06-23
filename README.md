# Vote.ng — Secure Web-Based Diaspora Voting System

> Official INEC Diaspora Voting Portal — 2027 Nigerian Presidential Election  
> Final Year University Project | Simulating INEC's proposed diaspora voting portal

---

## Overview

Vote.ng is a full-stack, secure, web-based voting system that simulates Nigeria's INEC diaspora voting portal. It enables eligible Nigerian diaspora voters to register, authenticate via OTP, and cast anonymous votes from overseas consulate polling units.

**Tech Stack:**
- **Frontend:** React 18 + Vite + Tailwind CSS
- **Backend:** Node.js + Express.js REST API
- **Database:** PostgreSQL + Sequelize ORM
- **Auth:** JWT (access + refresh tokens) + bcrypt
- **Email:** Nodemailer (OTP delivery)
- **Charts:** Recharts

---

## Prerequisites

- Node.js v18+
- PostgreSQL v14+
- npm v8+
- (Optional) Redis — app falls back to stateless if not available

---

## Setup Instructions

### 1. Clone & Install

```bash
git clone <repo-url>
cd Diaspora_Voting_System

# Install server deps
cd server && npm install

# Install client deps
cd ../client && npm install
```

### 2. Configure Environment

Copy and edit the `.env` file at the project root:

```bash
# Required
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/voteng
JWT_SECRET=your_very_long_secret_key_here
JWT_REFRESH_SECRET=another_very_long_refresh_secret_key
CLIENT_URL=http://localhost:5173

# Email (optional in dev — OTP printed to console)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=your_app_password
```

### 3. Create the Database

```bash
# In PostgreSQL
createdb voteng
```

### 4. Seed the Database

```bash
cd server && npm run seed
```

This creates all tables and populates:
- 1 INEC Admin
- 3 Polling Officers (London, New York, Dubai)
- 10 Sample Voters
- 1 Active Presidential Election (2027)
- 5 Candidates (APC, PDP, LP, NNPP, ADC)
- 3 Polling Units

### 5. Start the Application

In two separate terminals:

```bash
# Terminal 1 — Backend API
cd server && npm run dev

# Terminal 2 — Frontend
cd client && npm run dev
```

- **Frontend:** http://localhost:5173
- **API:** http://localhost:5000
- **Health check:** http://localhost:5000/api/health

---

## Seed Credentials

> **Important:** In development, OTP codes are printed to the server console (look for `[OTP] Code for...`). You do not need a real email server.

| Role     | Email                          | Password       |
|----------|--------------------------------|----------------|
| Admin    | admin@vote.ng                  | Admin@2027!    |
| Officer  | officer.london@vote.ng         | Officer@2027!  |
| Officer  | officer.ny@vote.ng             | Officer@2027!  |
| Officer  | officer.dubai@vote.ng          | Officer@2027!  |
| Voter    | emeka.okafor@gmail.com         | Voter@2027!    |
| Voter    | ngozi.adeyemi@gmail.com        | Voter@2027!    |
| Voter    | tunde.fashola@yahoo.com        | Voter@2027!    |
| Voter    | *(all 10 voters)*              | Voter@2027!    |

---

## System Portals

| Portal       | URL                     | Access          |
|--------------|-------------------------|-----------------|
| Landing Page | /                       | Public          |
| Live Results | /results                | Public          |
| Voter Portal | /voter/login            | Registered Voters |
| Officer Portal | /officer/login        | Polling Officers  |
| Admin Portal | /admin/login            | INEC Admins     |

---

## Typical Voting Flow

1. **Voter registers** at `/voter/register` with NIN + PVC
2. **Voter logs in** → receives OTP email → enters OTP
3. **Officer accredits voter** at `/officer/dashboard` (enter PVC number)
4. **Voter casts ballot** at `/voter/ballot` (select candidate → confirm)
5. **Voter receives receipt** at `/voter/receipt` (anonymous vote token)
6. **Results visible** at `/results` (auto-refreshes every 30s)

---

## API Reference

```
POST /api/auth/register         Register new voter
POST /api/auth/login            Login (triggers OTP)
POST /api/auth/verify-otp       Verify OTP → returns JWT
POST /api/auth/refresh          Refresh access token
POST /api/auth/logout           Logout

GET  /api/voter/me              Voter profile
GET  /api/voter/election        Active election + candidates
POST /api/voter/vote            Cast vote
GET  /api/voter/receipt         Vote confirmation

POST /api/officer/accredit      Accredit voter by PVC
GET  /api/officer/stats         Unit stats + incidents
POST /api/officer/incident      Report incident

GET  /api/admin/dashboard       System metrics
GET/POST /api/admin/elections   Election management
GET/POST/DELETE /api/admin/candidates
GET/PATCH /api/admin/voters
GET  /api/admin/results         Vote results
GET  /api/admin/export-results  Download CSV
GET  /api/admin/audit-log       Paginated audit trail
GET  /api/admin/incidents       All incidents

GET  /api/results               Public live results
```

---

## Security Features

- **JWT Auth:** 15-min access tokens + 7-day httpOnly cookie refresh tokens
- **OTP 2FA:** 6-digit, 10-min expiry, 3-attempt lockout, 15-min cooldown
- **Rate Limiting:** 5 req/min on auth endpoints, 100 req/min general
- **Password Hashing:** bcrypt with 12 salt rounds
- **Vote Anonymity:** Ballots table has no voter_id — votes cannot be traced
- **One-Vote Enforcement:** DB status flag (REGISTERED → ACCREDITED → VOTED)
- **NIN + PVC Uniqueness:** DB constraints prevent duplicate registrations
- **Input Validation:** express-validator on all API endpoints
- **SQL Injection Prevention:** Sequelize parameterized queries
- **Security Headers:** Helmet.js on all responses
- **CORS:** Restricted to frontend origin only
- **Audit Log:** Every system action timestamped and immutably logged

---

## Database Schema

```
voters         — nin (unique), pvc_number (unique), full_name, email, status
users          — voter_id (FK), email (unique), password_hash, role, otp
elections      — title, start_date, end_date, status
candidates     — election_id (FK), full_name, party, party_acronym
polling_units  — name, country, city, officer_id (FK)
ballots        — election_id, candidate_id, polling_unit_id, vote_token (unique)
audit_logs     — actor_id, action, metadata (JSONB), ip_address, timestamp
incidents      — officer_id, description, incident_type, status
```

---

## Project Structure

```
Diaspora_Voting_System/
├── .env                    # Environment variables
├── client/                 # React frontend (Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/     # VoterLayout, AdminLayout, OfficerLayout
│   │   │   ├── logos/      # SVG logo components (INEC, CoatOfArms, NIN, PVC)
│   │   │   └── ui/         # Shared UI (ErrorBoundary, LoadingSpinner, etc.)
│   │   ├── context/        # AuthContext (global user state)
│   │   ├── lib/            # Axios instance with JWT interceptors
│   │   └── pages/
│   │       ├── voter/      # Register, Login, Dashboard, Ballot, Receipt
│   │       ├── officer/    # Login, Dashboard
│   │       ├── admin/      # Login, Dashboard, Elections, Candidates, Voters, Results, AuditLog
│   │       ├── Landing.jsx
│   │       ├── PublicResults.jsx
│   │       └── NotFound.jsx
└── server/                 # Express API
    ├── config/             # Database config
    ├── db/                 # seed.js
    ├── middleware/         # auth, validate
    ├── models/             # Sequelize models
    ├── routes/             # auth, voter, officer, admin, results
    └── utils/              # jwt, otp, mailer, audit
```

---

*Built for the 2027 Nigerian General Elections | INEC Diaspora Digital Services*  
*© 2027 Federal Republic of Nigeria — All rights reserved*
