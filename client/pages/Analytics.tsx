import Layout from "@/components/layout/Layout";
import { BarChart3 } from "lucide-react";

export default function Analytics() {
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-blue-50/30 to-white pt-8 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
              <BarChart3 size={32} className="text-primary" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-secondary mb-4">
              Advanced Analytics
            </h1>
            <p className="text-lg text-foreground/60 max-w-2xl mx-auto mb-8">
              Deep dive into performance metrics, predictive analytics, and comprehensive recovery insights.
            </p>
            <div className="bg-white rounded-lg border border-border p-8 inline-block">
              <p className="text-foreground/60">
                This page is being configured. Visit the <a href="/dashboard" className="text-primary hover:underline">Dashboard</a> to view current KPIs and metrics.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
