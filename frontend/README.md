# Atlas DCA - Frontend

AI-Powered Debt Collection Agency Management System - Frontend Application

## Tech Stack

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **Styling**: TailwindCSS 4
- **UI Components**: Radix UI
- **Charts**: Recharts
- **Animations**: Framer Motion
- **State Management**: React Query

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Environment Variables

Create a `.env.local` file with the following variables:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_ML_SERVICE_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME=Atlas DCA
```

## Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Landing page
│   ├── dashboard/                # Dashboard pages
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── cases/                    # Case management
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── agents/                   # AI Agents monitoring
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── analytics/                # Analytics & reports
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── settings/                 # Settings page
│   │   ├── layout.tsx
│   │   └── page.tsx
│   └── help/                     # Help center
│       ├── layout.tsx
│       └── page.tsx
├── components/
│   ├── ui/                       # Base UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── badge.tsx
│   │   ├── progress.tsx
│   │   ├── avatar.tsx
│   │   ├── tabs.tsx
│   │   ├── select.tsx
│   │   └── separator.tsx
│   ├── layout/                   # Layout components
│   │   ├── sidebar.tsx
│   │   └── header.tsx
│   └── dashboard/                # Dashboard components
│       ├── kpi-card.tsx
│       ├── recovery-trends-chart.tsx
│       ├── case-distribution-chart.tsx
│       ├── agent-activity-feed.tsx
│       └── recent-cases-table.tsx
├── lib/
│   └── utils.ts                  # Utility functions
└── types/
    └── index.ts                  # TypeScript definitions
```

## Pages Overview

### Landing Page (`/`)
- Hero section with animated gradients
- Feature highlights
- Stats overview
- CTA to dashboard

### Dashboard (`/dashboard`)
- KPI cards (Total Cases, Recovered Amount, Recovery Rate, Avg Resolution)
- Recovery trends chart
- Case distribution pie chart
- AI agent activity feed
- Recent cases table

### Cases (`/cases`)
- Case status filters
- Search and advanced filters
- Case cards with debtor info, amounts, status, priority
- Recovery probability indicators
- Quick actions (call, email, SMS, view)

### Agents (`/agents`)
- Agent fleet overview
- Individual agent details
- Metrics: uptime, tasks, accuracy, response time
- Activity logs
- Configuration panel

### Analytics (`/analytics`)
- Time range selector
- Recovery vs target charts
- Case status distribution
- Agent performance comparison
- Collection by channel analysis
- Efficiency trends

### Settings (`/settings`)
- Profile management
- Notification preferences
- Security settings
- Theme customization
- API integrations

### Help (`/help`)
- Search functionality
- Help categories
- Popular articles
- Contact support

## Design System

### Colors
- **Primary**: Blue (#3b82f6) to Purple (#a855f7) gradient
- **Success**: Green (#22c55e)
- **Warning**: Orange/Yellow (#f59e0b)
- **Destructive**: Red (#ef4444)
- **Background**: Dark slate (#0f1218)

### Effects
- Glass morphism (backdrop blur)
- Gradient borders
- Glow effects
- Smooth animations

## Integration with Backend

The frontend is designed to work with:
- **Backend API** (Node.js + Express): `http://localhost:5000`
- **ML Service** (Python + FastAPI): `http://localhost:8000`

API client functions are prepared in `src/lib/api.ts` (to be implemented).

## Development Notes

- Mock data is currently used for all pages
- Replace mock data with API calls once backend is ready
- All components are responsive and mobile-friendly
- Dark theme is the default and primary theme

## FedEx SMART Hackathon 2025

This frontend is part of the Atlas DCA project for the FedEx SMART Hackathon, demonstrating:
- AI-powered debt collection management
- Multi-agent orchestration
- Predictive analytics
- Automated follow-ups
- Compliance-first approach
