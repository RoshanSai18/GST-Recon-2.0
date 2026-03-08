# GST Reconciliation Knowledge Graph

An intelligent GST reconciliation platform that models taxpayer entities, invoices, and filing data as a **Neo4j knowledge graph**. The system detects anomalies, flags high-risk vendors, and surfaces suspicious patterns like circular trading and amendment chains — all through an interactive dashboard.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui |
| Backend | FastAPI (Python), Uvicorn |
| Database | Neo4j Aura (cloud-hosted graph database) |
| Auth | JWT (admin login) + Clerk (session tokens) |
| ML | Scikit-learn risk scoring model |

---

## Features

- **Knowledge Graph Explorer** — Interactive force-directed graph of taxpayers, invoices, GSTR filings, and payment nodes. High-risk nodes are highlighted in red.
- **GST Reconciliation Engine** — Matches GSTR-1, GSTR-2B, and GSTR-3B filings and flags mismatches with explainable results.
- **Pattern Detection** — Identifies circular trade networks, amendment chains, chronic payment delays, and risky supplier relationships.
- **Vendor Risk Scoring** — ML-based trust scores with risk badges (Low / Medium / High).
- **Bulk Data Upload** — Upload taxpayer and invoice data via CSV/JSON through the dashboard.

---

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+ and npm (or bun)
- A running Neo4j instance (local or Neo4j Aura)

### Backend

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Copy and configure environment variables
cp .env.example .env   # fill in NEO4J_URI, credentials, JWT_SECRET, etc.

# Start the API server
uvicorn main:app --reload --port 8000
```

API docs available at `http://localhost:8000/docs`

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

App runs at `http://localhost:5173`

---

## Environment Variables (Backend)

| Variable | Description |
|----------|-------------|
| `NEO4J_URI` | Neo4j connection URI |
| `NEO4J_USER` | Neo4j username |
| `NEO4J_PASSWORD` | Neo4j password |
| `JWT_SECRET` | Secret key for JWT signing |
| `ADMIN_USERNAME` | Dashboard admin login |
| `ADMIN_PASSWORD` | Dashboard admin password |
| `CORS_ORIGINS` | Comma-separated allowed frontend origins |

---

## Project Structure

```
├── backend/
│   ├── main.py                  # FastAPI app entry point
│   ├── config.py                # Environment config
│   ├── routers/                 # API route handlers
│   ├── services/
│   │   ├── reconciliation/      # GST reconciliation engine
│   │   ├── patterns/            # Pattern detection (circular trade, etc.)
│   │   ├── ml/                  # Risk scoring model
│   │   └── ingestion/           # Data parsing & graph building
│   └── database/                # Neo4j client & schema init
└── frontend/
    ├── src/
    │   ├── pages/               # Dashboard, Graph, Invoices, Vendors, etc.
    │   ├── components/          # UI components
    │   └── lib/                 # API client, utilities
    └── vite.config.ts
```
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
