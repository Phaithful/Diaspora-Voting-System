---
name: project-voteng
description: Vote.ng diaspora voting system — full-stack build completed. Tech stack, structure, seed credentials, and current state.
metadata:
  type: project
---

Vote.ng is a complete full-stack diaspora voting system for Nigeria (Final year university project simulating INEC's portal).

**Why:** Final year university project, Nigeria-branded, representing INEC diaspora voting portal for 2027 elections.

**How to apply:** When resuming work on this project, the full system is built and the next step is running it against a real PostgreSQL database.

## Stack
- Frontend: React 18 + Vite + Tailwind CSS 3 (custom Nigeria green #008751)
- Backend: Node.js + Express.js REST API (port 5000)
- Database: PostgreSQL + Sequelize ORM
- Auth: JWT (15min access + 7day refresh httpOnly cookie) + bcrypt (12 rounds)
- Email: Nodemailer (OTP prints to console in dev mode)
- Charts: Recharts

## Run Commands
```
cd server && npm run dev        # Backend API on :5000
cd client && npm run dev        # Frontend on :5173
cd server && npm run seed       # Seed DB (drops + recreates all tables)
```

## Seed Credentials
- Admin: admin@vote.ng / Admin@2027!
- Officers: officer.london@vote.ng, officer.ny@vote.ng, officer.dubai@vote.ng / Officer@2027!
- Voters (10): emeka.okafor@gmail.com etc / Voter@2027!

## OTP Dev Mode
In development, OTP codes are printed directly to server console — no real email needed.
Look for: `[OTP] Code for email@example.com: 123456`

## Key Security Facts
- Ballot table has NO voter_id — votes are completely anonymous
- One-vote enforcement via voter status: REGISTERED → ACCREDITED → VOTED
- NIN + PVC uniqueness enforced at DB level
- Rate limit: 5 req/min on auth endpoints

## Status (built 2026-06-03)
Complete full build — 59 source files, production build tested successfully.
Requires PostgreSQL to be set up and seeded before use.
