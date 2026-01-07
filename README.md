# Atlas DCA - AI-Powered Debt Collection Agency Management System

![Atlas DCA](https://img.shields.io/badge/Atlas-DCA-blue?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?style=flat-square&logo=supabase)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)

> 🏆 Built for **FedEx SMART Hackathon 2025**

## 🎯 Overview

Atlas DCA is an AI-powered platform designed to revolutionize debt collection operations through:

- 🤖 **Multi-Agent AI System** - Specialized agents for predictions, negotiations, compliance, and automation
- 📊 **Predictive Analytics** - ML-based recovery probability predictions (85%+ accuracy)
- ⚡ **RPA Automation** - Automated follow-ups via email, SMS, and calls
- 🛡️ **Compliance Engine** - Built-in FDCPA, RBI, and local regulation compliance

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                 FRONTEND (Next.js 14+)                   │
│  Dashboard • Cases • Agents • Analytics • Settings       │
└───────────────────────────┬─────────────────────────────┘
                            │ REST API
                            ↓
┌─────────────────────────────────────────────────────────┐
│              BACKEND (Node.js + Express)                 │
│  Case Management • Agent Orchestration • RPA Services   │
└───────────────────────────┬─────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ↓                   ↓                   ↓
┌───────────────┐  ┌───────────────┐  ┌───────────────┐
│   Supabase    │  │  ML Service   │  │  Redis Queue  │
│  PostgreSQL   │  │    (Python)   │  │   (Bull.js)   │
└───────────────┘  └───────────────┘  └───────────────┘
```

## 📁 Project Structure

```
atlas-dca/
├── frontend/                    # Next.js 14+ Application
│   ├── src/
│   │   ├── app/                 # App Router pages
│   │   ├── components/          # React components
│   │   ├── lib/                 # Utilities & Supabase client
│   │   └── types/               # TypeScript definitions
│   └── public/                  # Static assets
│
├── backend/                     # Node.js + Express API
│   ├── src/
│   │   ├── routes/              # API route handlers
│   │   ├── middleware/          # Auth & error handlers
│   │   ├── services/            # Business logic
│   │   ├── agents/              # AI agent orchestration
│   │   └── utils/               # Supabase client & helpers
│   └── supabase/
│       └── migrations/          # Database migrations
│
└── ml-service/                  # Python ML Service (Coming Soon)
    ├── app/                     # FastAPI application
    ├── models/                  # Trained ML models
    └── training/                # Training scripts
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- pnpm or npm
- Supabase Account

### 1. Clone the repository

```bash
git clone https://github.com/your-repo/atlas-dca.git
cd atlas-dca
```

### 2. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the migration file:
   ```
   backend/supabase/migrations/001_initial_schema.sql
   ```
3. Copy your project URL and API keys

### 3. Configure Environment Variables

**Backend** (`backend/.env`):
```env
PORT=5000
NODE_ENV=development
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
ML_SERVICE_URL=http://localhost:8000
CORS_ORIGINS=http://localhost:3000
```

**Frontend** (`.env.local`):
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 4. Install Dependencies & Run

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

**Backend:**
```bash
cd backend
npm install
npm run dev
```

### 5. Access the Application

- 🌐 Frontend: http://localhost:3000
- 🔧 Backend API: http://localhost:5000
- 📊 Health Check: http://localhost:5000/health

## 🗄️ Database Schema

| Table | Description |
|-------|-------------|
| `profiles` | User profiles (extends Supabase auth) |
| `debtors` | Debtor/customer information |
| `cases` | Debt collection cases |
| `transactions` | Payment & adjustment records |
| `communications` | Email, SMS, call logs |
| `predictions` | ML model predictions |
| `agent_logs` | AI agent activity logs |
| `compliance_rules` | Regulatory rules configuration |
| `communication_templates` | Reusable message templates |
| `analytics_snapshots` | Daily analytics data |

## 🔌 API Endpoints

### Cases
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cases` | List cases with filters |
| GET | `/api/cases/:id` | Get case details |
| POST | `/api/cases` | Create new case |
| PUT | `/api/cases/:id` | Update case |
| POST | `/api/cases/:id/escalate` | Escalate case |
| POST | `/api/cases/:id/settle` | Mark case as settled |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/dashboard` | Dashboard KPIs |
| GET | `/api/analytics/recovery` | Recovery trends |
| GET | `/api/analytics/agents` | Agent performance |
| GET | `/api/analytics/distribution` | Case distribution |

### Predictions
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/predictions/recovery` | Get recovery prediction |
| GET | `/api/predictions/case/:id` | Get case predictions |
| POST | `/api/predictions/batch` | Batch predictions |

## 🤖 AI Agents

| Agent | Purpose | Status |
|-------|---------|--------|
| **Predictive Agent** | ML-based recovery probability | ✅ Active |
| **Negotiation Agent** | Payment plan generation | ✅ Active |
| **Compliance Agent** | Regulatory compliance | ✅ Active |
| **RPA Agent** | Automated follow-ups | ✅ Active |

## 📊 Success Metrics

| Metric | Target | Current |
|--------|--------|---------|
| Recovery Rate Increase | 20%+ | - |
| Cost Reduction | 30%+ | - |
| Resolution Speed | 50% faster | - |
| Model Accuracy | 85%+ | - |

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TailwindCSS, Framer Motion
- **Backend**: Node.js, Express, TypeScript
- **Database**: Supabase (PostgreSQL)
- **ML**: Python, FastAPI, XGBoost/scikit-learn (Coming Soon)
- **UI**: Radix UI, Lucide Icons, Recharts

## 📝 License

MIT License - Built for FedEx SMART Hackathon 2025

## 👥 Team

Atlas DCA Team - FedEx SMART Hackathon 2025
