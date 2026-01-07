// API Types for Atlas DCA

export type DebtorStatus = "ACTIVE" | "INACTIVE" | "SETTLED" | "DEFAULTED";
export type CaseStatus = "OPEN" | "IN_PROGRESS" | "ESCALATED" | "SETTLED" | "CLOSED" | "WRITTEN_OFF";
export type Priority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type Channel = "EMAIL" | "SMS" | "CALL" | "LETTER";
export type AgentType = "PREDICTIVE" | "NEGOTIATION" | "COMPLIANCE" | "RPA";
export type AgentStatus = "ACTIVE" | "IDLE" | "ERROR" | "DISABLED";

export interface Debtor {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    totalDebt: number;
    riskScore?: number;
    status: DebtorStatus;
    createdAt: string;
    updatedAt: string;
}

export interface Case {
    id: string;
    debtorId: string;
    debtor?: Debtor;
    amount: number;
    originalAmount: number;
    dueDate: string;
    daysPastDue: number;
    status: CaseStatus;
    priority: Priority;
    recoveryProb?: number;
    assignedAgentId?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Communication {
    id: string;
    caseId: string;
    channel: Channel;
    template?: string;
    content: string;
    status: "PENDING" | "SENT" | "DELIVERED" | "FAILED";
    sentAt?: string;
    createdAt: string;
}

export interface Prediction {
    id: string;
    caseId: string;
    recoveryProb: number;
    modelVersion: string;
    createdAt: string;
}

export interface Agent {
    id: string;
    name: string;
    type: AgentType;
    status: AgentStatus;
    tasksCompleted: number;
    accuracy: number;
    lastActive: string;
    config?: Record<string, unknown>;
}

export interface AgentLog {
    id: string;
    agentType: AgentType;
    action: string;
    caseId?: string;
    result?: Record<string, unknown>;
    duration?: number;
    createdAt: string;
}

// Dashboard KPIs
export interface DashboardKPIs {
    totalCases: number;
    activeCases: number;
    recoveredAmount: number;
    totalDebt: number;
    recoveryRate: number;
    avgResolutionDays: number;
    casesChange: number;
    recoveryChange: number;
}

// Chart Data Types
export interface RecoveryTrendData {
    date: string;
    recovered: number;
    target: number;
}

export interface CaseDistributionData {
    status: CaseStatus;
    count: number;
    percentage: number;
}

export interface AgentPerformanceData {
    name: string;
    type: AgentType;
    tasksCompleted: number;
    successRate: number;
}
