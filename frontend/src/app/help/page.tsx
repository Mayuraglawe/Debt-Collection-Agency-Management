"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    HelpCircle,
    Book,
    MessageSquare,
    Video,
    FileText,
    ExternalLink,
    Search,
    ChevronRight,
    ChevronDown,
    Mail,
    Phone,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/lib/theme-context";

const helpCategories = [
    { icon: Book, title: "Getting Started", description: "Learn the basics of Atlas DCA", articles: 12, color: "#3b82f6" },
    { icon: MessageSquare, title: "Case Management", description: "Managing and tracking debt cases", articles: 18, color: "#a855f7" },
    { icon: HelpCircle, title: "AI Agents", description: "Understanding and configuring agents", articles: 8, color: "#22c55e" },
    { icon: Video, title: "Video Tutorials", description: "Step-by-step video guides", articles: 6, color: "#f59e0b" },
];

const popularArticles = [
    { id: 1, title: "How to create a new case", category: "Getting Started", content: "Learn step by step how to create and manage new debt collection cases in Atlas DCA." },
    { id: 2, title: "Understanding recovery probability scores", category: "AI Agents", content: "Our ML models analyze multiple factors to predict the likelihood of successful debt recovery." },
    { id: 3, title: "Configuring automated follow-ups", category: "Case Management", content: "Set up the RPA Agent to automatically send follow-up communications via email, SMS, or scheduled calls." },
    { id: 4, title: "Setting up compliance rules", category: "AI Agents", content: "Configure the Compliance Agent to ensure all communications adhere to FDCPA, RBI, and local regulations." },
    { id: 5, title: "Exporting analytics reports", category: "Analytics", content: "Generate and export comprehensive reports in CSV or JSON format for stakeholder review." },
];

const faqs = [
    { q: "How does the AI predict recovery probability?", a: "Our Predictive Agent uses machine learning models trained on historical data including payment history, debtor demographics, communication patterns, and economic indicators to provide accuracy rates of 85%+." },
    { q: "Can I integrate with my existing CRM?", a: "Yes! Atlas DCA provides REST APIs and webhooks for seamless integration with popular CRMs like Salesforce, HubSpot, and custom systems." },
    { q: "Is the data secure and compliant?", a: "Absolutely. We use end-to-end encryption, SOC 2 Type II compliance, and our Compliance Agent ensures all actions follow regulatory guidelines." },
    { q: "How do I escalate a case manually?", a: "Navigate to the case details, click the 'Escalate' button, and select the escalation reason. The case will be flagged for priority handling." },
];

export default function HelpPage() {
    const { theme } = useTheme();
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedArticle, setSelectedArticle] = useState<number | null>(null);
    const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
    const [showContactModal, setShowContactModal] = useState(false);

    const filteredArticles = popularArticles.filter(
        article => article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            article.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const bgColor = theme === "light" ? "#f8fafc" : "transparent";
    const cardBg = theme === "light" ? "rgba(255, 255, 255, 0.8)" : "rgba(15, 23, 42, 0.6)";
    const borderColor = theme === "light" ? "rgba(148, 163, 184, 0.3)" : "rgba(51, 65, 85, 0.5)";
    const textColor = theme === "light" ? "#1e293b" : "#f1f5f9";
    const mutedColor = theme === "light" ? "#64748b" : "#94a3b8";
    const inputBg = theme === "light" ? "rgba(241, 245, 249, 0.8)" : "rgba(30, 41, 59, 0.5)";

    return (
        <div style={{ minHeight: '100vh', background: bgColor }}>
            <Header title="Help Center" subtitle="Find answers and learn how to use Atlas DCA" />

            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '32px' }}>
                {/* Search */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center', width: '100%' }}
                >
                    <h2 style={{ fontSize: '24px', fontWeight: 700, color: textColor, marginBottom: '16px' }}>
                        How can we help you?
                    </h2>
                    <div style={{ position: 'relative' }}>
                        <Search style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', color: mutedColor }} />
                        <input
                            placeholder="Search for help articles..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                width: '100%',
                                height: '48px',
                                paddingLeft: '48px',
                                paddingRight: '16px',
                                borderRadius: '12px',
                                border: `1px solid ${borderColor}`,
                                background: inputBg,
                                color: textColor,
                                fontSize: '16px',
                                outline: 'none'
                            }}
                        />
                    </div>
                </motion.div>

                {/* Categories */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
                    {helpCategories.map((category, index) => {
                        const Icon = category.icon;
                        return (
                            <motion.div
                                key={category.title}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ y: -4 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setSearchQuery(category.title)}
                                style={{
                                    padding: '24px',
                                    borderRadius: '16px',
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    background: cardBg,
                                    backdropFilter: 'blur(12px)',
                                    border: `1px solid ${borderColor}`,
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                <div style={{
                                    width: '56px',
                                    height: '56px',
                                    borderRadius: '14px',
                                    background: category.color,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 16px'
                                }}>
                                    <Icon style={{ width: '28px', height: '28px', color: 'white' }} />
                                </div>
                                <h3 style={{ fontSize: '16px', fontWeight: 600, color: textColor, marginBottom: '8px' }}>
                                    {category.title}
                                </h3>
                                <p style={{ fontSize: '13px', color: mutedColor, marginBottom: '12px' }}>
                                    {category.description}
                                </p>
                                <p style={{ fontSize: '12px', color: '#60a5fa' }}>
                                    {category.articles} articles
                                </p>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Popular Articles */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    style={{
                        padding: '24px',
                        borderRadius: '16px',
                        background: cardBg,
                        backdropFilter: 'blur(12px)',
                        border: `1px solid ${borderColor}`
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                        <FileText style={{ width: '20px', height: '20px', color: '#60a5fa' }} />
                        <h3 style={{ fontSize: '18px', fontWeight: 600, color: textColor }}>
                            {searchQuery ? `Search Results for "${searchQuery}"` : 'Popular Articles'}
                        </h3>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {filteredArticles.map((article) => (
                            <motion.div
                                key={article.id}
                                whileHover={{ x: 4 }}
                                onClick={() => setSelectedArticle(selectedArticle === article.id ? null : article.id)}
                                style={{
                                    padding: '16px',
                                    borderRadius: '10px',
                                    background: inputBg,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div>
                                        <p style={{ fontSize: '14px', fontWeight: 500, color: textColor }}>{article.title}</p>
                                        <p style={{ fontSize: '12px', color: mutedColor }}>{article.category}</p>
                                    </div>
                                    <motion.div animate={{ rotate: selectedArticle === article.id ? 90 : 0 }}>
                                        <ChevronRight style={{ width: '20px', height: '20px', color: mutedColor }} />
                                    </motion.div>
                                </div>
                                <AnimatePresence>
                                    {selectedArticle === article.id && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            style={{ overflow: 'hidden' }}
                                        >
                                            <p style={{ fontSize: '13px', color: mutedColor, marginTop: '12px', paddingTop: '12px', borderTop: `1px solid ${borderColor}` }}>
                                                {article.content}
                                            </p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}
                        {filteredArticles.length === 0 && (
                            <p style={{ textAlign: 'center', color: mutedColor, padding: '24px' }}>
                                No articles found matching your search.
                            </p>
                        )}
                    </div>
                </motion.div>

                {/* FAQs */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    style={{
                        padding: '24px',
                        borderRadius: '16px',
                        background: cardBg,
                        backdropFilter: 'blur(12px)',
                        border: `1px solid ${borderColor}`
                    }}
                >
                    <h3 style={{ fontSize: '18px', fontWeight: 600, color: textColor, marginBottom: '20px' }}>
                        Frequently Asked Questions
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {faqs.map((faq, index) => (
                            <motion.div
                                key={index}
                                onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                                style={{
                                    padding: '16px',
                                    borderRadius: '10px',
                                    background: inputBg,
                                    cursor: 'pointer'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <p style={{ fontSize: '14px', fontWeight: 500, color: textColor }}>{faq.q}</p>
                                    <motion.div animate={{ rotate: expandedFaq === index ? 180 : 0 }}>
                                        <ChevronDown style={{ width: '20px', height: '20px', color: mutedColor }} />
                                    </motion.div>
                                </div>
                                <AnimatePresence>
                                    {expandedFaq === index && (
                                        <motion.p
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            style={{ fontSize: '13px', color: mutedColor, marginTop: '12px', overflow: 'hidden' }}
                                        >
                                            {faq.a}
                                        </motion.p>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Contact Support */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    style={{ textAlign: 'center' }}
                >
                    <div style={{
                        maxWidth: '500px',
                        margin: '0 auto',
                        padding: '40px',
                        borderRadius: '16px',
                        background: cardBg,
                        backdropFilter: 'blur(12px)',
                        border: `1px solid ${borderColor}`
                    }}>
                        <MessageSquare style={{ width: '48px', height: '48px', color: '#60a5fa', margin: '0 auto 16px' }} />
                        <h3 style={{ fontSize: '20px', fontWeight: 700, color: textColor, marginBottom: '8px' }}>
                            Still need help?
                        </h3>
                        <p style={{ fontSize: '14px', color: mutedColor, marginBottom: '24px' }}>
                            Our support team is available 24/7 to assist you.
                        </p>
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                            <Button onClick={() => setShowContactModal(true)}>Contact Support</Button>
                            <Button variant="outline" onClick={() => window.open('https://docs.atlas-dca.com', '_blank')} style={{ gap: '8px' }}>
                                <ExternalLink style={{ width: '16px', height: '16px' }} />
                                Documentation
                            </Button>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Contact Modal */}
            <AnimatePresence>
                {showContactModal && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowContactModal(false)}
                            style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.6)', zIndex: 100 }}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            style={{
                                position: 'fixed',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                width: '100%',
                                maxWidth: '450px',
                                padding: '32px',
                                borderRadius: '16px',
                                background: theme === 'light' ? '#f8fafc' : '#0f172a',
                                border: `1px solid ${borderColor}`,
                                zIndex: 101,
                                textAlign: 'center'
                            }}
                        >
                            <h3 style={{ fontSize: '20px', fontWeight: 700, color: textColor, marginBottom: '24px' }}>
                                Contact Support
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <motion.a
                                    whileHover={{ x: 4 }}
                                    href="mailto:support@atlas-dca.com"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '16px',
                                        padding: '16px',
                                        borderRadius: '12px',
                                        background: inputBg,
                                        textDecoration: 'none'
                                    }}
                                >
                                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Mail style={{ width: '20px', height: '20px', color: '#60a5fa' }} />
                                    </div>
                                    <div style={{ textAlign: 'left' }}>
                                        <p style={{ fontSize: '14px', fontWeight: 500, color: textColor }}>Email Support</p>
                                        <p style={{ fontSize: '12px', color: mutedColor }}>support@atlas-dca.com</p>
                                    </div>
                                </motion.a>
                                <motion.a
                                    whileHover={{ x: 4 }}
                                    href="tel:+918001234567"
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '16px',
                                        padding: '16px',
                                        borderRadius: '12px',
                                        background: inputBg,
                                        textDecoration: 'none'
                                    }}
                                >
                                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(34, 197, 94, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Phone style={{ width: '20px', height: '20px', color: '#22c55e' }} />
                                    </div>
                                    <div style={{ textAlign: 'left' }}>
                                        <p style={{ fontSize: '14px', fontWeight: 500, color: textColor }}>Phone Support</p>
                                        <p style={{ fontSize: '12px', color: mutedColor }}>+91 800 123 4567</p>
                                    </div>
                                </motion.a>
                            </div>
                            <Button variant="outline" onClick={() => setShowContactModal(false)} style={{ marginTop: '24px', width: '100%' }}>
                                Close
                            </Button>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
