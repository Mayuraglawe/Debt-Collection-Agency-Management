# Atlas DCA - Updated Implementation Roadmap

## Project Overview
**Atlas Debt Collection Agency Management System** - An AI-powered, multi-agent platform designed to revolutionize debt collection operations through intelligent automation, predictive analytics, and seamless integration.

---

## 🏗️ Updated Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js)                    │
│  - Dashboard, Agents, Analytics, Cases pages            │
│  - API Routes for backend logic (/pages/api/*)          │
│  - TypeScript + TailwindCSS + Radix UI                  │
└───────────────────────────┬─────────────────────────────┘
                            │ REST/GraphQL
                            ↓
┌─────────────────────────────────────────────────────────┐
│              BACKEND (Node.js + Express)                 │
│  - Case Management APIs                                  │
│  - Agent Orchestration                                   │
│  - Database Operations (Prisma + PostgreSQL)            │
│  - RPA/Automation Services                              │
└───────────────────────────┬─────────────────────────────┘
                            │ HTTP/gRPC
                            ↓
┌─────────────────────────────────────────────────────────┐
│           ML SERVICE (Python + Flask/FastAPI)            │
│  - Predictive Model (Random Forest/XGBoost)             │
│  - Model Training Pipeline                               │
│  - Prediction API Endpoints                              │
│  - Feature Engineering                                   │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 Tech Stack Summary

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | Next.js 14+ | React framework with SSR/SSG |
| **Styling** | TailwindCSS + Radix UI | Component library & styling |
| **Backend** | Node.js + Express | REST API server |
| **Database** | PostgreSQL + Prisma | Data persistence & ORM |
| **ML Service** | Python + FastAPI | Machine learning predictions |
| **ML Models** | XGBoost/Random Forest | Recovery probability prediction |
| **Queue** | Bull/Redis | Background job processing |
| **Cache** | Redis | Performance optimization |

---

## 📁 Project Structure

```
atlas-dca/
├── frontend/                    # Next.js Application
│   ├── app/                     # App Router (Next.js 14+)
│   │   ├── (auth)/              # Auth group routes
│   │   ├── dashboard/           # Dashboard pages
│   │   ├── cases/               # Case management pages
│   │   ├── agents/              # Agent monitoring pages
│   │   ├── analytics/           # Analytics & reporting
│   │   ├── api/                 # API routes (BFF layer)
│   │   ├── layout.tsx           # Root layout
│   │   └── page.tsx             # Home page
│   ├── components/              # React components
│   │   ├── ui/                  # Base UI components (Radix)
│   │   ├── dashboard/           # Dashboard-specific components
│   │   ├── cases/               # Case management components
│   │   └── charts/              # Data visualization
│   ├── lib/                     # Utilities & helpers
│   ├── hooks/                   # Custom React hooks
│   ├── types/                   # TypeScript definitions
│   └── public/                  # Static assets
│
├── backend/                     # Node.js + Express API
│   ├── src/
│   │   ├── controllers/         # Request handlers
│   │   ├── routes/              # API route definitions
│   │   ├── services/            # Business logic
│   │   ├── agents/              # AI agent orchestration
│   │   │   ├── orchestrator.ts
│   │   │   ├── negotiation/
│   │   │   ├── compliance/
│   │   │   └── rpa/
│   │   ├── automation/          # RPA services
│   │   ├── middleware/          # Express middleware
│   │   ├── models/              # Prisma models
│   │   └── utils/               # Helper functions
│   ├── prisma/
│   │   ├── schema.prisma        # Database schema
│   │   └── migrations/          # DB migrations
│   └── tests/                   # Backend tests
│
├── ml-service/                  # Python ML Service
│   ├── app/
│   │   ├── main.py              # FastAPI entry point
│   │   ├── routers/             # API endpoints
│   │   ├── models/              # ML model classes
│   │   ├── training/            # Model training scripts
│   │   └── utils/               # Helper functions
│   ├── data/                    # Datasets & processed data
│   ├── notebooks/               # Jupyter notebooks (EDA)
│   ├── models/                  # Saved model artifacts
│   └── tests/                   # ML service tests
│
├── shared/                      # Shared types & configs
└── docker/                      # Docker configurations
```

---

## 🗓️ Implementation Phases

## **PHASE 1: Project Setup & Infrastructure** (Days 1-3)

### 1.1 Frontend Setup (Next.js)

#### Tasks:
- [ ] Initialize Next.js 14+ project with App Router
- [ ] Configure TypeScript, ESLint, Prettier
- [ ] Set up TailwindCSS with custom theme
- [ ] Install and configure Radix UI components
- [ ] Set up base layout and navigation
- [ ] Configure environment variables

#### Commands:
```bash
npx create-next-app@latest frontend --typescript --tailwind --eslint --app
cd frontend
npm install @radix-ui/themes @radix-ui/react-icons
npm install @tanstack/react-query recharts
```

#### Key Files:
```
frontend/
├── app/layout.tsx          # Root layout with providers
├── app/page.tsx            # Landing/home page
├── lib/utils.ts            # cn() utility function
├── tailwind.config.ts      # Theme configuration
└── .env.local              # API endpoints
```

---

### 1.2 Backend Setup (Node.js + Express)

#### Tasks:
- [ ] Initialize Node.js project with TypeScript
- [ ] Set up Express with middleware (CORS, helmet, morgan)
- [ ] Configure Prisma ORM with PostgreSQL
- [ ] Create database schema for core entities
- [ ] Set up Redis for caching and job queues
- [ ] Configure environment variables

#### Commands:
```bash
mkdir backend && cd backend
npm init -y
npm install express cors helmet morgan dotenv
npm install @prisma/client
npm install -D typescript @types/node @types/express prisma ts-node nodemon
npx prisma init
```

#### Database Schema:
```prisma
// backend/prisma/schema.prisma

model Debtor {
  id            String   @id @default(cuid())
  name          String
  email         String?
  phone         String?
  address       String?
  totalDebt     Float    @default(0)
  riskScore     Float?
  status        DebtorStatus @default(ACTIVE)
  cases         Case[]
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model Case {
  id              String   @id @default(cuid())
  debtorId        String
  debtor          Debtor   @relation(fields: [debtorId], references: [id])
  amount          Float
  originalAmount  Float
  dueDate         DateTime
  daysPastDue     Int      @default(0)
  status          CaseStatus @default(OPEN)
  priority        Priority @default(MEDIUM)
  recoveryProb    Float?
  assignedAgentId String?
  transactions    Transaction[]
  communications  Communication[]
  predictions     Prediction[]
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model Transaction {
  id        String   @id @default(cuid())
  caseId    String
  case      Case     @relation(fields: [caseId], references: [id])
  amount    Float
  type      TransactionType
  method    PaymentMethod?
  note      String?
  createdAt DateTime @default(now())
}

model Communication {
  id        String   @id @default(cuid())
  caseId    String
  case      Case     @relation(fields: [caseId], references: [id])
  channel   Channel
  template  String?
  content   String
  status    CommStatus @default(PENDING)
  sentAt    DateTime?
  createdAt DateTime @default(now())
}

model Prediction {
  id              String   @id @default(cuid())
  caseId          String
  case            Case     @relation(fields: [caseId], references: [id])
  recoveryProb    Float
  modelVersion    String
  features        Json?
  createdAt       DateTime @default(now())
}

model AgentLog {
  id        String   @id @default(cuid())
  agentType AgentType
  action    String
  caseId    String?
  result    Json?
  duration  Int?
  createdAt DateTime @default(now())
}

enum DebtorStatus { ACTIVE INACTIVE SETTLED DEFAULTED }
enum CaseStatus { OPEN IN_PROGRESS ESCALATED SETTLED CLOSED WRITTEN_OFF }
enum Priority { LOW MEDIUM HIGH CRITICAL }
enum TransactionType { PAYMENT ADJUSTMENT WRITE_OFF RECOVERY }
enum PaymentMethod { CASH CARD BANK_TRANSFER UPI CHEQUE }
enum Channel { EMAIL SMS CALL LETTER }
enum CommStatus { PENDING SENT DELIVERED FAILED }
enum AgentType { PREDICTIVE NEGOTIATION COMPLIANCE RPA }
```

---

### 1.3 ML Service Setup (Python + FastAPI)

#### Tasks:
- [ ] Initialize Python project with virtual environment
- [ ] Set up FastAPI with Uvicorn
- [ ] Install ML dependencies (scikit-learn, XGBoost, pandas)
- [ ] Create project structure
- [ ] Set up logging and configuration
- [ ] Create health check endpoint

#### Commands:
```bash
mkdir ml-service && cd ml-service
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install fastapi uvicorn pandas numpy scikit-learn xgboost joblib python-dotenv
pip install pytest httpx  # For testing
```

#### Key Files:
```python
# ml-service/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Atlas DCA ML Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "ml-service"}
```

---

## **PHASE 2: Backend API Development** (Days 4-7)

### 2.1 Core CRUD APIs

#### Case Management APIs:
```typescript
GET    /api/cases              // List cases with filters & pagination
GET    /api/cases/:id          // Get case details
POST   /api/cases              // Create new case
PUT    /api/cases/:id          // Update case
DELETE /api/cases/:id          // Delete case
POST   /api/cases/:id/escalate // Escalate case
POST   /api/cases/bulk         // Bulk operations
```

#### Debtor APIs:
```typescript
GET    /api/debtors            // List debtors
GET    /api/debtors/:id        // Get debtor profile
POST   /api/debtors            // Create debtor
PUT    /api/debtors/:id        // Update debtor
GET    /api/debtors/:id/cases  // Get debtor's cases
GET    /api/debtors/:id/history // Get payment history
```

#### Analytics APIs:
```typescript
GET    /api/analytics/dashboard     // Dashboard KPIs
GET    /api/analytics/recovery      // Recovery rate metrics
GET    /api/analytics/agents        // Agent performance
GET    /api/analytics/trends        // Time-series data
```

---

### 2.2 Agent Orchestration Service

#### Tasks:
- [ ] Create central orchestrator that coordinates all agents
- [ ] Implement event-driven architecture with Bull queues
- [ ] Build agent registry and lifecycle management
- [ ] Create logging and monitoring for agent actions

#### Agent Workflow:
```
New Case Created
    ↓
[1] PREDICTIVE AGENT → Calculate recovery probability (ML Service)
    ↓
[2] RISK SCORING → Assign priority based on prediction
    ↓
[3] COMPLIANCE AGENT → Validate case, check regulations
    ↓
[4] NEGOTIATION AGENT → Determine communication strategy
    ↓
[5] RPA AGENT → Schedule automated follow-ups
    ↓
[6] LOG & MONITOR → Record all actions for analytics
```

---

### 2.3 Compliance Rules Engine

#### Key Compliance Rules:
```json
{
  "communication": {
    "allowed_hours": { "start": "09:00", "end": "21:00" },
    "max_calls_per_day": 3,
    "max_emails_per_week": 2,
    "max_sms_per_week": 3,
    "cool_off_period_days": 2
  },
  "prohibited_phrases": [
    "arrest", "jail", "lawsuit", "seize property"
  ],
  "required_disclosures": [
    "This is an attempt to collect a debt",
    "Any information obtained will be used for that purpose"
  ],
  "data_retention_days": 730
}
```

---

## **PHASE 3: ML Service Development** (Days 8-12)

### 3.1 Data Processing Pipeline

#### Tasks:
- [ ] Download and prepare datasets:
  - UCI: Default of Credit Card Clients (30,000 records)
  - Lending Club Dataset (800,000+ records)
- [ ] Create feature engineering pipeline
- [ ] Build data validation and cleaning utilities
- [ ] Create unified data format

#### Feature Engineering:
```python
# Key features for recovery prediction
features = {
    'debtor_features': [
        'credit_score', 'income_level', 'employment_status',
        'debt_to_income_ratio', 'previous_defaults'
    ],
    'case_features': [
        'debt_amount', 'days_past_due', 'original_amount',
        'payment_attempts', 'communication_count'
    ],
    'behavioral_features': [
        'response_rate', 'promise_to_pay_count',
        'partial_payment_history', 'communication_preference'
    ]
}
```

---

### 3.2 Predictive Model Training

#### Tasks:
- [ ] Split data (80% train, 20% test)
- [ ] Train multiple models (Random Forest, XGBoost, Gradient Boosting)
- [ ] Perform hyperparameter tuning
- [ ] Evaluate models (Precision, Recall, F1, ROC-AUC)
- [ ] Select best model and save artifacts

#### Model Training Script:
```python
# ml-service/app/training/train_model.py
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from xgboost import XGBClassifier
from sklearn.metrics import classification_report, roc_auc_score
import joblib

def train_recovery_model(data_path: str):
    df = pd.read_csv(data_path)
    
    X = df.drop(['recovered', 'id'], axis=1)
    y = df['recovered']
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    # Train XGBoost model
    model = XGBClassifier(
        n_estimators=200,
        max_depth=6,
        learning_rate=0.1,
        objective='binary:logistic'
    )
    model.fit(X_train, y_train)
    
    # Evaluate
    y_pred = model.predict(X_test)
    y_prob = model.predict_proba(X_test)[:, 1]
    
    print(classification_report(y_test, y_pred))
    print(f"ROC-AUC: {roc_auc_score(y_test, y_prob):.4f}")
    
    # Save model
    joblib.dump(model, 'models/recovery_model.pkl')
    return model
```

---

### 3.3 Prediction API Endpoints

#### API Endpoints:
```python
# ml-service/app/routers/predictions.py
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import joblib

router = APIRouter(prefix="/predictions", tags=["predictions"])

class PredictionRequest(BaseModel):
    debt_amount: float
    days_past_due: int
    credit_score: float
    payment_attempts: int
    communication_count: int

class PredictionResponse(BaseModel):
    recovery_probability: float
    risk_category: str
    recommended_strategy: str

@router.post("/recovery", response_model=PredictionResponse)
async def predict_recovery(request: PredictionRequest):
    model = joblib.load("models/recovery_model.pkl")
    
    features = [[
        request.debt_amount,
        request.days_past_due,
        request.credit_score,
        request.payment_attempts,
        request.communication_count
    ]]
    
    probability = model.predict_proba(features)[0][1]
    
    # Determine risk category
    if probability >= 0.7:
        risk_category = "LOW_RISK"
        strategy = "STANDARD_FOLLOW_UP"
    elif probability >= 0.4:
        risk_category = "MEDIUM_RISK"
        strategy = "NEGOTIATION_OFFER"
    else:
        risk_category = "HIGH_RISK"
        strategy = "ESCALATION"
    
    return PredictionResponse(
        recovery_probability=round(probability, 4),
        risk_category=risk_category,
        recommended_strategy=strategy
    )
```

---

## **PHASE 4: Frontend Development** (Days 13-18)

### 4.1 Next.js Page Structure

#### App Router Pages:
```
app/
├── page.tsx                    # Landing page
├── (auth)/
│   ├── login/page.tsx          # Login
│   └── register/page.tsx       # Registration
├── dashboard/
│   ├── page.tsx                # Main dashboard
│   └── layout.tsx              # Dashboard layout
├── cases/
│   ├── page.tsx                # Case list
│   ├── [id]/page.tsx           # Case details
│   └── new/page.tsx            # Create case
├── agents/
│   └── page.tsx                # Agent monitoring
├── analytics/
│   └── page.tsx                # Analytics dashboard
└── settings/
    └── page.tsx                # Configuration
```

---

### 4.2 Key Dashboard Components

#### Tasks:
- [ ] Create KPI cards (Total Cases, Recovery Rate, Active Cases, Revenue)
- [ ] Build case status distribution chart (Pie/Donut)
- [ ] Implement recovery trends line chart
- [ ] Add agent activity feed
- [ ] Create recent cases table
- [ ] Build quick actions panel

#### Component Examples:
```tsx
// components/dashboard/KPICard.tsx
interface KPICardProps {
  title: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
}

// components/dashboard/RecoveryTrendsChart.tsx
// Using Recharts for data visualization

// components/dashboard/AgentActivityFeed.tsx
// Real-time agent action updates
```

---

### 4.3 Case Management UI

#### Tasks:
- [ ] Case list with filters (status, priority, date range)
- [ ] Case detail view with timeline
- [ ] Communication history panel
- [ ] Payment plan editor
- [ ] Document upload (invoices)
- [ ] Bulk actions (assign, escalate, close)

---

### 4.4 Agent Monitoring Dashboard

#### Tasks:
- [ ] Agent status cards (active, idle, error)
- [ ] Performance metrics per agent
- [ ] Activity logs with filtering
- [ ] Configuration toggles
- [ ] Test agent functionality

---

## **PHASE 5: Integration & Automation** (Days 19-22)

### 5.1 Service Integration

#### Tasks:
- [ ] Connect Next.js frontend to Express backend
- [ ] Integrate Express backend with ML service
- [ ] Set up API client with error handling
- [ ] Implement authentication flow
- [ ] Add real-time updates (WebSockets/SSE)

---

### 5.2 RPA & Automation

#### Tasks:
- [ ] Set up email service (Nodemailer/SendGrid)
- [ ] Configure SMS service (Twilio)
- [ ] Build Bull queue for scheduled jobs
- [ ] Create communication templates
- [ ] Implement delivery tracking

---

### 5.3 OCR Integration (Optional)

#### Tasks:
- [ ] Set up Tesseract.js or Google Cloud Vision
- [ ] Build invoice upload API
- [ ] Create invoice parsing logic
- [ ] Validate extracted data
- [ ] Auto-create cases from invoices

---

## **PHASE 6: Testing, Optimization & Deployment** (Days 23-28)

### 6.1 Testing Strategy

#### Unit Tests:
- Backend: Jest for API controllers and services
- ML Service: Pytest for model predictions
- Frontend: Vitest for React components

#### Integration Tests:
- API endpoint testing
- ML service integration
- Database operations

#### E2E Tests:
- Playwright/Cypress for critical user flows

---

### 6.2 Performance Optimization

#### Tasks:
- [ ] Implement Redis caching for analytics
- [ ] Optimize database queries with indexes
- [ ] Add pagination to all list APIs
- [ ] Enable Next.js static generation where possible
- [ ] Compress API responses

---

### 6.3 Deployment

#### Docker Setup:
```yaml
# docker-compose.yml
version: '3.8'
services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:5000
  
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/atlas_dca
      - ML_SERVICE_URL=http://ml-service:8000
    depends_on:
      - db
      - redis
  
  ml-service:
    build: ./ml-service
    ports:
      - "8000:8000"
  
  db:
    image: postgres:15
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
      - POSTGRES_DB=atlas_dca
    volumes:
      - postgres_data:/var/lib/postgresql/data
  
  redis:
    image: redis:alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```

---

## 📊 Dataset Integration

| Dataset | Size | Use Case | Integration Point |
|---------|------|----------|-------------------|
| **UCI Credit Card** | 30,000 | Training predictive model | ML Service |
| **Lending Club** | 800,000+ | Risk assessment model | ML Service |
| **Zenodo Invoices** | 800+ images | OCR testing | RPA Agent |
| **Indian Bank** | Market-specific | Localization | Compliance Agent |

---

## ✅ Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Recovery Rate Increase | 20% | (Recovered/Total) × 100 |
| Operational Cost Reduction | 30% | Time saved per case |
| Case Resolution Speed | 50% faster | Avg days to close |
| Model Accuracy | 85%+ | Precision/Recall/F1 |
| System Uptime | 99.5% | Monitoring metrics |

---

## 🚀 Quick Start Commands

```bash
# Clone and setup
git clone <repo>
cd atlas-dca

# Frontend
cd frontend && npm install && npm run dev

# Backend
cd backend && npm install && npx prisma migrate dev && npm run dev

# ML Service
cd ml-service && pip install -r requirements.txt && uvicorn app.main:app --reload

# Docker (all services)
docker-compose up --build
```

---

## 📝 Notes

- This roadmap assumes a team of 2-3 developers
- Phases can overlap based on team capacity
- Priority: Core functionality > ML predictions > RPA automation
- MVP should focus on Phases 1-4 with basic ML integration
