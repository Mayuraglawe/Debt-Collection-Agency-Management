"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Brain,
  Shield,
  Zap,
  BarChart3,
  Bot,
  LineChart,
  Moon,
  Sun,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/lib/theme-context";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Predictions",
    description:
      "Machine learning models predict recovery probability with 85%+ accuracy using real-world datasets.",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: Bot,
    title: "Multi-Agent System",
    description:
      "Specialized AI agents for negotiation, compliance, and automation work together seamlessly.",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    icon: Shield,
    title: "Compliance First",
    description:
      "Built-in compliance engine ensures all communications follow FDCPA, RBI, and local regulations.",
    gradient: "from-green-500 to-emerald-500",
  },
  {
    icon: Zap,
    title: "RPA Automation",
    description:
      "Automated follow-ups via email, SMS, and calls with intelligent scheduling.",
    gradient: "from-orange-500 to-amber-500",
  },
  {
    icon: BarChart3,
    title: "Real-Time Analytics",
    description:
      "Live dashboards with KPIs, recovery trends, and agent performance metrics.",
    gradient: "from-red-500 to-rose-500",
  },
  {
    icon: LineChart,
    title: "Predictive Insights",
    description:
      "Data-driven insights to optimize collection strategies and maximize recovery rates.",
    gradient: "from-indigo-500 to-violet-500",
  },
];

const stats = [
  { label: "Recovery Rate Increase", value: "20%", suffix: "+" },
  { label: "Cost Reduction", value: "30%", suffix: "+" },
  { label: "Faster Resolution", value: "50%", suffix: "+" },
  { label: "Model Accuracy", value: "85%", suffix: "+" },
];

export default function LandingPage() {
  const { theme, toggleTheme } = useTheme();

  // Theme-aware colors
  const bgColor = theme === "light" ? "#f8fafc" : "transparent";
  const cardBg = theme === "light" ? "rgba(255, 255, 255, 0.9)" : "rgba(15, 23, 42, 0.6)";
  const borderColor = theme === "light" ? "rgba(148, 163, 184, 0.4)" : "rgba(51, 65, 85, 0.5)";
  const textColor = theme === "light" ? "#1e293b" : "#f1f5f9";
  const mutedColor = theme === "light" ? "#64748b" : "#94a3b8";
  const subtitleColor = theme === "light" ? "#475569" : "#94a3b8";

  return (
    <div style={{ minHeight: '100vh', background: bgColor }}>
      {/* Theme Toggle Button - Fixed Position */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggleTheme}
        style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          width: '48px',
          height: '48px',
          borderRadius: '14px',
          border: `1px solid ${borderColor}`,
          background: cardBg,
          backdropFilter: 'blur(12px)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          boxShadow: theme === 'light' ? '0 4px 20px rgba(0,0,0,0.1)' : '0 4px 20px rgba(0,0,0,0.3)'
        }}
        title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
      >
        {theme === 'dark' ? (
          <Moon style={{ width: '22px', height: '22px', color: mutedColor }} />
        ) : (
          <Sun style={{ width: '22px', height: '22px', color: '#f59e0b' }} />
        )}
      </motion.button>

      {/* Hero Section */}
      <section style={{
        position: 'relative',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        padding: '2rem'
      }}>
        {/* Animated Background */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
          <div style={{
            position: 'absolute',
            top: '-50%',
            left: '-50%',
            width: '100%',
            height: '100%',
            background: theme === 'light'
              ? 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%)',
            filter: 'blur(60px)'
          }} />
          <div style={{
            position: 'absolute',
            bottom: '-50%',
            right: '-50%',
            width: '100%',
            height: '100%',
            background: theme === 'light'
              ? 'radial-gradient(circle, rgba(168, 85, 247, 0.1) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, transparent 70%)',
            filter: 'blur(60px)'
          }} />
        </div>

        <div style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          maxWidth: '1200px',
          margin: '0 auto',
          textAlign: 'center'
        }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '9999px',
                backgroundColor: theme === 'light' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                border: `1px solid ${theme === 'light' ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`,
                marginBottom: '32px'
              }}
            >
              <span style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#22c55e',
                animation: 'pulse 2s infinite'
              }} />
              <span style={{ fontSize: '14px', color: mutedColor }}>
                FedEx SMART Hackathon 2025
              </span>
            </motion.div>

            {/* Main Heading */}
            <h1 style={{
              fontSize: 'clamp(48px, 10vw, 80px)',
              fontWeight: 800,
              marginBottom: '24px',
              lineHeight: 1.1
            }}>
              <span className="gradient-text">Atlas DCA</span>
            </h1>

            <p style={{
              fontSize: 'clamp(18px, 3vw, 24px)',
              color: subtitleColor,
              marginBottom: '16px',
              fontWeight: 500
            }}>
              AI-Powered Debt Collection Agency Management System
            </p>

            <p style={{
              fontSize: '16px',
              color: mutedColor,
              marginBottom: '40px',
              maxWidth: '600px',
              marginLeft: 'auto',
              marginRight: 'auto',
              lineHeight: 1.6
            }}>
              Revolutionize debt collection with intelligent automation,
              predictive analytics, and multi-agent orchestration.
            </p>

            {/* CTA Buttons */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '16px',
              justifyContent: 'center',
              marginBottom: '80px'
            }}>
              <Link href="/dashboard">
                <Button size="lg" style={{ fontSize: '16px', padding: '12px 32px', height: 'auto' }}>
                  Enter Dashboard <ArrowRight style={{ marginLeft: '8px', width: '20px', height: '20px' }} />
                </Button>
              </Link>
              <Button variant="outline" size="lg" style={{ fontSize: '16px', padding: '12px 32px', height: 'auto' }}>
                View Demo
              </Button>
            </div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '24px',
                maxWidth: '900px',
                margin: '0 auto'
              }}
            >
              {stats.map((stat) => (
                <motion.div
                  key={stat.label}
                  whileHover={{ y: -4 }}
                  style={{
                    padding: '24px 16px',
                    borderRadius: '16px',
                    textAlign: 'center',
                    background: cardBg,
                    backdropFilter: 'blur(12px)',
                    border: `1px solid ${borderColor}`,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <p className="gradient-text" style={{
                    fontSize: '32px',
                    fontWeight: 700,
                    marginBottom: '8px'
                  }}>
                    {stat.value}
                    <span style={{ color: '#4ade80' }}>{stat.suffix}</span>
                  </p>
                  <p style={{ fontSize: '13px', color: mutedColor }}>{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          style={{
            position: 'absolute',
            bottom: '32px',
            left: '50%',
            transform: 'translateX(-50%)'
          }}
        >
          <div style={{
            width: '24px',
            height: '40px',
            borderRadius: '12px',
            border: `2px solid ${borderColor}`,
            display: 'flex',
            justifyContent: 'center',
            paddingTop: '8px'
          }}>
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: '#3b82f6'
              }}
            />
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section style={{ padding: '100px 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{ textAlign: 'center', marginBottom: '64px' }}
          >
            <h2 style={{ fontSize: '36px', fontWeight: 700, marginBottom: '16px', color: textColor }}>
              Powerful <span className="gradient-text">Features</span>
            </h2>
            <p style={{ color: mutedColor, maxWidth: '600px', margin: '0 auto' }}>
              Built with cutting-edge technology to transform debt collection operations
            </p>
          </motion.div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '24px'
          }}>
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -4 }}
                  style={{
                    padding: '32px',
                    borderRadius: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    background: cardBg,
                    backdropFilter: 'blur(12px)',
                    border: `1px solid ${borderColor}`
                  }}
                >
                  <div
                    className={`bg-gradient-to-br ${feature.gradient}`}
                    style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '20px'
                    }}
                  >
                    <Icon style={{ width: '28px', height: '28px', color: 'white' }} />
                  </div>
                  <h3 style={{
                    fontSize: '18px',
                    fontWeight: 600,
                    color: textColor,
                    marginBottom: '12px'
                  }}>
                    {feature.title}
                  </h3>
                  <p style={{
                    fontSize: '14px',
                    color: mutedColor,
                    lineHeight: 1.6
                  }}>
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            style={{
              position: 'relative',
              borderRadius: '24px',
              overflow: 'hidden',
              padding: '64px 32px',
              textAlign: 'center',
              background: theme === 'light'
                ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)'
                : 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%)',
              border: `1px solid ${borderColor}`
            }}
          >
            <div style={{ position: 'relative', zIndex: 10 }}>
              <h2 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '16px', color: textColor }}>
                Ready to Transform Your Debt Collection?
              </h2>
              <p style={{
                color: mutedColor,
                marginBottom: '32px',
                maxWidth: '500px',
                margin: '0 auto 32px'
              }}>
                Experience the power of AI-driven debt collection management with Atlas DCA.
              </p>
              <Link href="/dashboard">
                <Button size="lg" style={{ fontSize: '16px', padding: '14px 40px', height: 'auto' }}>
                  Get Started <ArrowRight style={{ marginLeft: '8px', width: '20px', height: '20px' }} />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '24px',
        borderTop: `1px solid ${borderColor}`,
        textAlign: 'center'
      }}>
        <p style={{ fontSize: '14px', color: mutedColor }}>
          © 2025 Atlas DCA. Built for FedEx SMART Hackathon.
        </p>
      </footer>

      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
