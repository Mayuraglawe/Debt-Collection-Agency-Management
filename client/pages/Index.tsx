import Layout from "@/components/layout/Layout";
import { ArrowRight, BarChart3, Bot, Brain, CheckCircle2, Zap, TrendingUp, Shield, Clock } from "lucide-react";
import { Link } from "react-router-dom";

export default function Index() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden bg-background">
        
        <div className="max-w-7xl mx-auto text-center animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Zap size={16} />
            <span>Introducing Atlas: The Future of Debt Collection</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-secondary mb-6 leading-tight">
            AI-Powered Debt Collection
            <span className="block text-primary">
              at Scale
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-muted mb-8 max-w-2xl mx-auto" style={{ color: "#475569" }}>
            Transform FedEx debt collection from manual spreadsheets to an intelligent, multi-agent platform. 
            Atlas automates recovery, predicts outcomes, and ensures compliance—24/7.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors"
            >
              Launch Dashboard
              <ArrowRight size={18} />
            </Link>
            <button className="inline-flex items-center justify-center px-6 py-3 border-2 border-primary text-primary font-semibold rounded-lg hover:bg-primary/5 transition-colors">
              View Documentation
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-12 border-t border-border">
            <div className="text-center">
              <p className="text-3xl font-bold text-primary mb-1">3 Phases</p>
              <p className="text-sm text-foreground/60">Strategic implementation roadmap</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary mb-1">6+ Agents</p>
              <p className="text-sm text-foreground/60">Specialized AI capabilities</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary mb-1">100%</p>
              <p className="text-sm text-foreground/60">Compliance auditable</p>
            </div>
          </div>
        </div>
      </section>

      {/* Three Phases Overview */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-secondary mb-4">
              Three-Phase Implementation
            </h2>
            <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
              A strategic roadmap from centralized data to fully autonomous recovery
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Phase 1 */}
            <div className="group relative bg-card rounded-lg overflow-hidden hover:shadow-md transition-all duration-300 animate-slide-in-up" style={{ boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)" }}>
              <div className="absolute top-0 left-0 w-1 h-12 bg-primary group-hover:h-full transition-all duration-300" />
              
              <div className="p-8">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary font-bold text-lg mb-4">
                  1
                </div>
                
                <h3 className="text-2xl font-bold text-secondary mb-3">
                  Foundation & Centralization
                </h3>
                <p className="text-sm text-foreground/60 mb-6">
                  Months 1–6: Eliminate manual tracking and establish a single source of truth
                </p>
                
                <ul className="space-y-3">
                  <li className="flex gap-3 text-sm">
                    <CheckCircle2 size={18} className="text-primary flex-shrink-0 mt-0.5" />
                    <span>Data Ingestion & RAG indexing</span>
                  </li>
                  <li className="flex gap-3 text-sm">
                    <CheckCircle2 size={18} className="text-primary flex-shrink-0 mt-0.5" />
                    <span>SOP & compliance integration</span>
                  </li>
                  <li className="flex gap-3 text-sm">
                    <CheckCircle2 size={18} className="text-primary flex-shrink-0 mt-0.5" />
                    <span>Low-risk pilot agents</span>
                  </li>
                  <li className="flex gap-3 text-sm">
                    <CheckCircle2 size={18} className="text-primary flex-shrink-0 mt-0.5" />
                    <span>KPI dashboarding</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Phase 2 */}
            <div className="group relative bg-card rounded-lg overflow-hidden hover:shadow-md transition-all duration-300 animate-slide-in-up" style={{ boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)" }}>
              <div className="absolute top-0 left-0 w-1 h-12 bg-primary group-hover:h-full transition-all duration-300" />
              
              <div className="p-8">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary font-bold text-lg mb-4">
                  2
                </div>
                
                <h3 className="text-2xl font-bold text-secondary mb-3">
                  Strategic Expansion
                </h3>
                <p className="text-sm text-foreground/60 mb-6">
                  Months 6–18: Move from communication to decision-making and analytics
                </p>
                
                <ul className="space-y-3">
                  <li className="flex gap-3 text-sm">
                    <CheckCircle2 size={18} className="text-primary flex-shrink-0 mt-0.5" />
                    <span>Predictive scoring & ML</span>
                  </li>
                  <li className="flex gap-3 text-sm">
                    <CheckCircle2 size={18} className="text-primary flex-shrink-0 mt-0.5" />
                    <span>Master Orchestrator Agent</span>
                  </li>
                  <li className="flex gap-3 text-sm">
                    <CheckCircle2 size={18} className="text-primary flex-shrink-0 mt-0.5" />
                    <span>Dynamic payment plans</span>
                  </li>
                  <li className="flex gap-3 text-sm">
                    <CheckCircle2 size={18} className="text-primary flex-shrink-0 mt-0.5" />
                    <span>Sentiment-based escalation</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Phase 3 */}
            <div className="group relative bg-card rounded-lg overflow-hidden hover:shadow-md transition-all duration-300 animate-slide-in-up" style={{ boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)" }}>
              <div className="absolute top-0 left-0 w-1 h-12 bg-primary group-hover:h-full transition-all duration-300" />
              
              <div className="p-8">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary font-bold text-lg mb-4">
                  3
                </div>
                
                <h3 className="text-2xl font-bold text-secondary mb-3">
                  Mature Blended Operations
                </h3>
                <p className="text-sm text-foreground/60 mb-6">
                  Months 18+: Fully optimized, proactive recovery ecosystem
                </p>
                
                <ul className="space-y-3">
                  <li className="flex gap-3 text-sm">
                    <CheckCircle2 size={18} className="text-primary flex-shrink-0 mt-0.5" />
                    <span>AI negotiation bots</span>
                  </li>
                  <li className="flex gap-3 text-sm">
                    <CheckCircle2 size={18} className="text-primary flex-shrink-0 mt-0.5" />
                    <span>Immutable audit logs</span>
                  </li>
                  <li className="flex gap-3 text-sm">
                    <CheckCircle2 size={18} className="text-primary flex-shrink-0 mt-0.5" />
                    <span>Multi-language support</span>
                  </li>
                  <li className="flex gap-3 text-sm">
                    <CheckCircle2 size={18} className="text-primary flex-shrink-0 mt-0.5" />
                    <span>Global scalability</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-secondary mb-4">
              Powerful Features & Capabilities
            </h2>
            <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
              Everything you need to automate and optimize debt collection operations
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-6 bg-card rounded-lg hover:shadow-md transition-all group" style={{ boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)" }}>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:opacity-80 transition-opacity">
                <Brain size={24} className="text-primary" />
              </div>
              <h3 className="font-semibold text-secondary mb-2">Intelligent Agents</h3>
              <p className="text-sm text-foreground/60">
                Specialized AI agents for communication, negotiation, compliance monitoring, and case routing
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 bg-card rounded-lg hover:shadow-md transition-all group" style={{ boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)" }}>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:opacity-80 transition-opacity">
                <BarChart3 size={24} className="text-primary" />
              </div>
              <h3 className="font-semibold text-secondary mb-2">Predictive Analytics</h3>
              <p className="text-sm text-foreground/60">
                ML-powered scoring to analyze customer behavior and predict recovery probability
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 bg-card rounded-lg hover:shadow-md transition-all group" style={{ boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)" }}>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:opacity-80 transition-opacity">
                <TrendingUp size={24} className="text-primary" />
              </div>
              <h3 className="font-semibold text-secondary mb-2">Real-time KPI Dashboards</h3>
              <p className="text-sm text-foreground/60">
                Live visibility into recovery rates, response times, and performance metrics
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 bg-card rounded-lg hover:shadow-md transition-all group" style={{ boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)" }}>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:opacity-80 transition-opacity">
                <Shield size={24} className="text-primary" />
              </div>
              <h3 className="font-semibold text-secondary mb-2">Compliance Auditing</h3>
              <p className="text-sm text-foreground/60">
                100% interaction auditing ensuring FDCPA compliance and regulatory adherence
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 bg-card rounded-lg hover:shadow-md transition-all group" style={{ boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)" }}>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:opacity-80 transition-opacity">
                <Bot size={24} className="text-primary" />
              </div>
              <h3 className="font-semibold text-secondary mb-2">24/7 Automation</h3>
              <p className="text-sm text-foreground/60">
                Continuous operation with voice and chat bots handling inbound/outbound recovery
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 bg-card rounded-lg hover:shadow-md transition-all group" style={{ boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)" }}>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:opacity-80 transition-opacity">
                <Clock size={24} className="text-primary" />
              </div>
              <h3 className="font-semibold text-secondary mb-2">Smart Case Routing</h3>
              <p className="text-sm text-foreground/60">
                Master Orchestrator automatically assigns high-priority cases based on success metrics
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* AI Agents Showcase */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-secondary mb-4">
              Core AI Agents
            </h2>
            <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
              Specialized agents working in harmony to automate the entire debt collection lifecycle
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                name: "Communication Agent",
                description: "Handles reminder notifications, balance inquiries, and initial customer outreach with personalized messaging"
              },
              {
                name: "Negotiation Agent",
                description: "Manages payment plan discussions with sentiment analysis and authority limits within FedEx parameters"
              },
              {
                name: "Compliance Agent",
                description: "Audits 100% of interactions ensuring FDCPA adherence and generating immutable compliance records"
              },
              {
                name: "Orchestrator Agent",
                description: "Master controller that routes cases, balances workloads, and optimizes resource allocation in real-time"
              },
              {
                name: "Predictive Agent",
                description: "Analyzes customer data to score recovery probability and recommend optimal engagement strategies"
              },
              {
                name: "Escalation Agent",
                description: "Identifies difficult cases and intelligently escalates to human agents with full context"
              }
            ].map((agent, idx) => (
              <div key={idx} className="flex gap-4 p-6 bg-card rounded-lg hover:shadow-md transition-all" style={{ boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)" }}>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Bot size={24} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-secondary mb-1">{agent.name}</h3>
                  <p className="text-sm text-foreground/60">{agent.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Implementation Checklist */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-secondary mb-4">
              Implementation Roadmap
            </h2>
            <p className="text-lg text-foreground/60">
              Track your progress toward full AI-powered debt collection
            </p>
          </div>

          <div className="space-y-4">
            {[
              { milestone: "Data Setup", action: "Map collection process & templates", tooling: "Vector Database" },
              { milestone: "Governance", action: "Establish AI oversight committee", tooling: "Compliance Monitoring" },
              { milestone: "Verification", action: "A/B test AI vs. manual recovery rates", tooling: "Analytics Engine" },
              { milestone: "Refinement", action: "Continuous model fine-tuning", tooling: "LLM Fine-tuning" }
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-4 p-6 bg-card rounded-lg hover:shadow-md transition-all" style={{ boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)" }}>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-secondary mb-1">{item.milestone}</h3>
                  <p className="text-sm text-foreground/60">{item.action}</p>
                </div>
                <div className="flex-shrink-0 px-4 py-2 bg-primary/10 rounded-lg text-primary text-sm font-medium">
                  {item.tooling}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-secondary text-secondary-foreground">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">
            Ready to Transform Debt Collection?
          </h2>
          <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
            Start with Phase 1 implementation. See measurable improvements in recovery rates and operational efficiency within months.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-secondary font-semibold rounded-lg hover:bg-secondary-foreground transition-colors"
            >
              Access Dashboard
              <ArrowRight size={18} />
            </Link>
            <button className="inline-flex items-center justify-center px-6 py-3 border-2 border-secondary-foreground text-secondary-foreground font-semibold rounded-lg hover:bg-secondary-foreground/10 transition-colors">
              Schedule Demo
            </button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
