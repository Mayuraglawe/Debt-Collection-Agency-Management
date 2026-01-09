"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { AuthGuard } from '@/components/auth-guard';
import { FileText, Download, Calendar, TrendingUp, BarChart3, PieChart } from 'lucide-react';
import { Button } from '@/components/ui/button';

type ReportType = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'AUDIT' | 'REGULATORY';

export default function ComplianceReportsPage() {
    const { user } = useAuth();
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [reportType, setReportType] = useState<ReportType>('MONTHLY');
    const [dateFrom, setDateFrom] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('compliance_reports')
                .select('*')
                .order('generated_at', { ascending: false })
                .limit(20);

            if (error) throw error;
            setReports(data || []);
        } catch (error) {
            console.error('Error fetching reports:', error);
        } finally {
            setLoading(false);
        }
    };

    const generateReport = async () => {
        setGenerating(true);
        try {
            // Fetch data for report period
            const { data: violations } = await supabase
                .from('compliance_violations')
                .select('*')
                .gte('occurred_at', dateFrom)
                .lte('occurred_at', dateTo);

            const { data: actions } = await supabase
                .from('agent_actions')
                .select('*')
                .gte('created_at', dateFrom)
                .lte('created_at', dateTo);

            const { data: cases } = await supabase
                .from('workflow_cases')
                .select('*')
                .gte('created_at', dateFrom)
                .lte('created_at', dateTo);

            // Calculate metrics
            const metrics = {
                totalActions: actions?.length || 0,
                compliantActions: actions?.filter(a => a.compliant).length || 0,
                complianceRate: actions?.length ? ((actions.filter(a => a.compliant).length / actions.length) * 100).toFixed(2) : '100.00',
                totalViolations: violations?.length || 0,
                criticalViolations: violations?.filter(v => v.severity === 'CRITICAL').length || 0,
                resolvedViolations: violations?.filter(v => v.status === 'RESOLVED').length || 0,
                totalCases: cases?.length || 0,
                resolvedCases: cases?.filter(c => c.status === 'RESOLVED').length || 0,
                totalRecovered: cases?.reduce((sum, c) => sum + (c.recovered_amount || 0), 0) || 0,
                avgRecoveryRate: cases?.length ? ((cases.reduce((sum, c) => sum + (c.recovered_amount || 0) / c.amount, 0) / cases.length) * 100).toFixed(2) : '0.00'
            };

            // Violation breakdown
            const violationsSummary = {
                byType: violations?.reduce((acc: any, v) => {
                    acc[v.violation_type] = (acc[v.violation_type] || 0) + 1;
                    return acc;
                }, {}) || {},
                bySeverity: violations?.reduce((acc: any, v) => {
                    acc[v.severity] = (acc[v.severity] || 0) + 1;
                    return acc;
                }, {}) || {},
                byAgent: violations?.reduce((acc: any, v) => {
                    acc[v.agent_id] = (acc[v.agent_id] || 0) + 1;
                    return acc;
                }, {}) || {}
            };

            const recommendations = generateRecommendations(metrics, violations || []);

            // Insert report
            const { error } = await supabase
                .from('compliance_reports')
                .insert({
                    report_type: reportType,
                    report_name: `${reportType} Report - ${dateFrom} to ${dateTo}`,
                    date_from: dateFrom,
                    date_to: dateTo,
                    metrics: metrics,
                    violations_summary: violationsSummary,
                    recommendations: recommendations,
                    generated_by: user?.id
                });

            if (error) throw error;

            alert('Report generated successfully!');
            fetchReports();
        } catch (error) {
            console.error('Error generating report:', error);
            alert('Failed to generate report');
        } finally {
            setGenerating(false);
        }
    };

    const generateRecommendations = (metrics: any, violations: any[]) => {
        const recommendations = [];

        if (parseFloat(metrics.complianceRate) < 95) {
            recommendations.push({
                priority: 'HIGH',
                category: 'Compliance',
                recommendation: 'Compliance rate below 95% target. Implement additional agent training on regulatory requirements.'
            });
        }

        if (metrics.criticalViolations > 0) {
            recommendations.push({
                priority: 'CRITICAL',
                category: 'Violations',
                recommendation: `${metrics.criticalViolations} critical violations detected. Immediate review and corrective action required.`
            });
        }

        const excessiveCalls = violations.filter(v => v.violation_type === 'EXCESSIVE_CALLS').length;
        if (excessiveCalls > 5) {
            recommendations.push({
                priority: 'MEDIUM',
                category: 'Process',
                recommendation: 'High number of excessive call violations. Review call frequency policies with agents.'
            });
        }

        if (parseFloat(metrics.avgRecoveryRate) < 30) {
            recommendations.push({
                priority: 'MEDIUM',
                category: 'Performance',
                recommendation: 'Recovery rate below benchmark. Consider optimizing allocation rules or agent training.'
            });
        }

        return recommendations;
    };

    const downloadReport = (report: any) => {
        // Generate CSV export
        const csv = generateCSV(report);
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${report.report_name.replace(/\s+/g, '_')}.csv`;
        a.click();
    };

    const generateCSV = (report: any) => {
        const lines = [
            `Report: ${report.report_name}`,
            `Period: ${report.date_from} to ${report.date_to}`,
            `Generated: ${new Date(report.generated_at).toLocaleString()}`,
            '',
            'METRICS',
            'Metric,Value',
            ...Object.entries(report.metrics).map(([key, value]) => `${key},${value}`),
            '',
            'COMPLIANCE RATE',
            `${report.metrics.complianceRate}%`,
            '',
            'VIOLATIONS BY TYPE',
            'Type,Count',
            ...Object.entries(report.violations_summary?.byType || {}).map(([type, count]) => `${type},${count}`),
            '',
            'RECOMMENDATIONS',
            'Priority,Category,Recommendation',
            ...(report.recommendations || []).map((r: any) => `${r.priority},${r.category},"${r.recommendation}"`)
        ];
        return lines.join('\n');
    };

    return (
        <AuthGuard allowedRoles={['ADMIN', 'COMPLIANCE_OFFICER']}>
            <div className="min-h-screen p-8" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)' }}>
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                            <FileText className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">Compliance Reports</h1>
                            <p className="text-slate-400">Generate and export regulatory compliance reports</p>
                        </div>
                    </div>
                </div>

                {/* Report Generator */}
                <div className="mb-8 p-6 rounded-xl" style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(148, 163, 184, 0.2)' }}>
                    <h2 className="text-xl font-bold text-white mb-6">Generate New Report</h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Report Type</label>
                            <select
                                value={reportType}
                                onChange={(e) => setReportType(e.target.value as ReportType)}
                                className="w-full px-4 py-3 rounded-xl text-white"
                                style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(148, 163, 184, 0.2)' }}
                            >
                                <option value="DAILY">Daily Report</option>
                                <option value="WEEKLY">Weekly Report</option>
                                <option value="MONTHLY">Monthly Report</option>
                                <option value="AUDIT">Audit Report</option>
                                <option value="REGULATORY">Regulatory Export</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">From Date</label>
                            <input
                                type="date"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl text-white"
                                style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(148, 163, 184, 0.2)' }}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">To Date</label>
                            <input
                                type="date"
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl text-white"
                                style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(148, 163, 184, 0.2)' }}
                            />
                        </div>
                        <div className="flex items-end">
                            <Button
                                onClick={generateReport}
                                disabled={generating}
                                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold"
                                style={{
                                    background: generating
                                        ? 'rgba(59, 130, 246, 0.3)'
                                        : 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)',
                                    boxShadow: '0 10px 30px -10px rgba(59, 130, 246, 0.5)'
                                }}
                            >
                                {generating ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <BarChart3 className="w-5 h-5" />
                                        Generate
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Reports List */}
                <div>
                    <h2 className="text-xl font-bold text-white mb-4">Generated Reports</h2>
                    {loading ? (
                        <div className="p-20 text-center rounded-xl" style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(148, 163, 184, 0.2)' }}>
                            <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
                            <p className="text-slate-400">Loading reports...</p>
                        </div>
                    ) : reports.length === 0 ? (
                        <div className="p-20 text-center rounded-xl" style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(148, 163, 184, 0.2)' }}>
                            <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-white mb-2">No Reports Generated</h3>
                            <p className="text-slate-400">Generate your first compliance report to get started</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {reports.map(report => (
                                <div
                                    key={report.id}
                                    className="p-5 rounded-xl"
                                    style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid rgba(148, 163, 184, 0.2)' }}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-white mb-2">{report.report_name}</h3>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                                                <div>
                                                    <p className="text-xs text-slate-500">Compliance Rate</p>
                                                    <p className={`text-lg font-bold ${parseFloat(report.metrics.complianceRate) >= 95 ? 'text-green-400' : 'text-yellow-400'}`}>
                                                        {report.metrics.complianceRate}%
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500">Total Violations</p>
                                                    <p className="text-lg font-bold text-orange-400">{report.metrics.totalViolations}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500">Critical</p>
                                                    <p className="text-lg font-bold text-red-400">{report.metrics.criticalViolations}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-slate-500">Recovery Rate</p>
                                                    <p className="text-lg font-bold text-blue-400">{report.metrics.avgRecoveryRate}%</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2 text-xs text-slate-400">
                                                <span><Calendar className="w-3 h-3 inline mr-1" />{report.date_from} to {report.date_to}</span>
                                                <span>•</span>
                                                <span>Generated {new Date(report.generated_at).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        <Button
                                            onClick={() => downloadReport(report)}
                                            className="flex items-center gap-2 px-4 py-2 rounded-lg"
                                            style={{ background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)' }}
                                        >
                                            <Download className="w-4 h-4" />
                                            Download CSV
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AuthGuard>
    );
}
