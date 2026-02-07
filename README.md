# Revenue Intelligence Console

A dashboard that helps sales leaders understand revenue performance and take action.

## What It Does

- Shows current revenue vs target with % to goal
- Displays key metrics: pipeline value, win rate, avg deal size, sales cycle
- Highlights risks: stale deals, struggling reps, inactive accounts
- Gives actionable recommendations based on data

## Quick Start

### 1. Start the Backend

```bash
cd backend
npm install
npm run dev
```

This starts the API server at http://localhost:3001

### 2. Start the Frontend

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

This starts the dashboard at http://localhost:3000

### 3. Open the Dashboard

Go to http://localhost:3000 in your browser. That's it!

## Project Structure

```
├── backend/           # API server
│   └── src/
│       ├── db/        # Database setup
│       ├── routes/    # API endpoints
│       └── services/  # Business logic
├── frontend/          # React dashboard
│   └── src/
│       └── components/  # UI components
├── data/              # JSON data files
├── THINKING.md        # Design reflection
└── README.md          # You are here
```

## API Endpoints

| Endpoint | What It Returns |
|----------|-----------------|
| `/api/summary` | Revenue, target, gap %, QoQ change |
| `/api/drivers` | Pipeline, win rate, deal size, cycle time |
| `/api/risk-factors` | Stale deals, underperforming reps, low activity |
| `/api/recommendations` | Action items to improve performance |

## Tech Stack

- **Backend:** Node.js, Express, TypeScript, SQLite
- **Frontend:** React, TypeScript, Material UI, D3.js
- **Data:** JSON files loaded into SQLite at startup

## Screenshots

When running, the dashboard shows:
- Header with branding
- Summary banner with QTD revenue vs target
- Revenue Drivers with trend charts
- Risk Factors with warnings
- Recommendations with action items
- Revenue Trend chart over last 6 months

## Author

Built for SkyGeni assignment.
