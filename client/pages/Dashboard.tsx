import Layout from "@/components/layout/Layout";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Users, DollarSign, AlertCircle } from "lucide-react";

const mockCaseData = [
  { day: "Mon", count: 45, recovered: 32 },
  { day: "Tue", count: 52, recovered: 38 },
  { day: "Wed", count: 48, recovered: 35 },
  { day: "Thu", count: 61, recovered: 44 },
  { day: "Fri", count: 55, recovered: 41 },
  { day: "Sat", count: 42, recovered: 30 },
  { day: "Sun", count: 38, recovered: 28 },
];

const caseStatus = [
  { name: "Pending", value: 240, color: "#217DB2" },
  { name: "In Progress", value: 180, color: "#5FA4D3" },
  { name: "Recovered", value: 320, color: "#10B981" },
  { name: "Escalated", value: 85, color: "#F59E0B" },
];

const COLORS = ["#217DB2", "#5FA4D3", "#10B981", "#F59E0B"];

export default function Dashboard() {
  return (
    <Layout>
      <div className="min-h-screen bg-background pt-8 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-secondary mb-2">
              Dashboard
            </h1>
            <p className="text-foreground/60">
              Phase 1 Foundation & Centralization - Real-time KPI metrics and case management
            </p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Cases */}
            <div className="bg-card rounded-lg p-6 hover:shadow-md transition-all" style={{ boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)" }}>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users size={24} className="text-primary" />
                </div>
                <span className="text-sm text-green-600 font-semibold flex items-center gap-1">
                  <TrendingUp size={16} />
                  +12%
                </span>
              </div>
              <h3 className="text-foreground/60 text-sm font-medium mb-1">Total Cases</h3>
              <p className="text-3xl font-bold text-secondary">825</p>
              <p className="text-xs text-foreground/60 mt-2">Active debt collection accounts</p>
            </div>

            {/* Recovery Rate */}
            <div className="bg-card rounded-lg p-6 hover:shadow-md transition-all" style={{ boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)" }}>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                  <TrendingUp size={24} className="text-green-600" />
                </div>
                <span className="text-sm text-green-600 font-semibold flex items-center gap-1">
                  <TrendingUp size={16} />
                  +8%
                </span>
              </div>
              <h3 className="text-foreground/60 text-sm font-medium mb-1">Recovery Rate</h3>
              <p className="text-3xl font-bold text-secondary">38.7%</p>
              <p className="text-xs text-foreground/60 mt-2">Week-over-week improvement</p>
            </div>

            {/* Amount Recovered */}
            <div className="bg-card rounded-lg p-6 hover:shadow-md transition-all" style={{ boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)" }}>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <DollarSign size={24} className="text-emerald-600" />
                </div>
                <span className="text-sm text-green-600 font-semibold flex items-center gap-1">
                  <TrendingUp size={16} />
                  +15%
                </span>
              </div>
              <h3 className="text-foreground/60 text-sm font-medium mb-1">Amount Recovered</h3>
              <p className="text-3xl font-bold text-secondary">$547.2K</p>
              <p className="text-xs text-foreground/60 mt-2">This month</p>
            </div>

            {/* Avg Response Time */}
            <div className="bg-card rounded-lg p-6 hover:shadow-md transition-all" style={{ boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)" }}>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <AlertCircle size={24} className="text-blue-600" />
                </div>
                <span className="text-sm text-green-600 font-semibold flex items-center gap-1">
                  <TrendingUp size={16} />
                  -22%
                </span>
              </div>
              <h3 className="text-foreground/60 text-sm font-medium mb-1">Avg Response Time</h3>
              <p className="text-3xl font-bold text-secondary">4.2h</p>
              <p className="text-xs text-foreground/60 mt-2">Down from 5.4h last month</p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Cases Processed Chart */}
            <div className="lg:col-span-2 bg-card rounded-lg p-6 hover:shadow-md transition-all" style={{ boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)" }}>
              <h2 className="text-lg font-semibold text-secondary mb-6">Cases Processed & Recovered</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={mockCaseData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="day" stroke="#6B7280" />
                  <YAxis stroke="#6B7280" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#FFF", border: "1px solid #E5E7EB", borderRadius: "8px" }}
                    cursor={{ fill: "#F3F4F6" }}
                  />
                  <Bar dataKey="count" fill="#217DB2" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="recovered" fill="#10B981" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Case Status Pie Chart */}
            <div className="bg-card rounded-lg p-6 hover:shadow-md transition-all" style={{ boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)" }}>
              <h2 className="text-lg font-semibold text-secondary mb-6">Case Status Distribution</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={caseStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {caseStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {caseStatus.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                      />
                      <span className="text-foreground/60">{item.name}</span>
                    </div>
                    <span className="font-semibold text-secondary">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recovery Trend */}
          <div className="bg-card rounded-lg p-6 hover:shadow-md transition-all" style={{ boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)" }}>
            <h2 className="text-lg font-semibold text-secondary mb-6">Recovery Trend (30 Days)</h2>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={mockCaseData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="day" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#FFF", border: "1px solid #E5E7EB", borderRadius: "8px" }}
                  cursor={{ stroke: "#217DB2", strokeWidth: 2 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="recovered" 
                  stroke="#217DB2" 
                  strokeWidth={3}
                  dot={{ fill: "#217DB2", r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Phase 1 Status */}
          <div className="mt-8 bg-primary/5 rounded-lg p-6 border border-primary/20">
            <h3 className="font-semibold text-secondary mb-4">Phase 1 Status: Foundation & Centralization</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Data Ingestion", status: "Complete", value: 100 },
                { label: "SOP Integration", status: "In Progress", value: 75 },
                { label: "Pilot Agents", status: "In Progress", value: 60 },
                { label: "KPI Dashboard", status: "Complete", value: 100 },
              ].map((item, idx) => (
                <div key={idx}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-secondary">{item.label}</span>
                    <span className={`text-xs font-semibold ${item.status === "Complete" ? "text-green-600" : "text-amber-600"}`}>
                      {item.status}
                    </span>
                  </div>
                  <div className="w-full bg-primary/20 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all"
                      style={{ width: `${item.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
