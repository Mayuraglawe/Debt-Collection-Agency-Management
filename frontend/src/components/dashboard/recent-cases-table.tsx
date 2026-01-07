"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, formatCurrency, getStatusColor, getPriorityColor } from "@/lib/utils";
import Link from "next/link";

const recentCases = [
    {
        id: "DCA-2024-1234",
        debtor: "Rahul Sharma",
        amount: 125000,
        status: "IN_PROGRESS",
        priority: "HIGH",
        recoveryProb: 78,
        dueDate: "2024-01-15",
    },
    {
        id: "DCA-2024-1235",
        debtor: "Priya Patel",
        amount: 89000,
        status: "OPEN",
        priority: "MEDIUM",
        recoveryProb: 65,
        dueDate: "2024-01-18",
    },
    {
        id: "DCA-2024-1236",
        debtor: "Amit Kumar",
        amount: 234000,
        status: "ESCALATED",
        priority: "CRITICAL",
        recoveryProb: 34,
        dueDate: "2024-01-10",
    },
    {
        id: "DCA-2024-1237",
        debtor: "Sunita Reddy",
        amount: 56000,
        status: "SETTLED",
        priority: "LOW",
        recoveryProb: 100,
        dueDate: "2024-01-20",
    },
    {
        id: "DCA-2024-1238",
        debtor: "Vikram Singh",
        amount: 178000,
        status: "IN_PROGRESS",
        priority: "HIGH",
        recoveryProb: 72,
        dueDate: "2024-01-12",
    },
];

export function RecentCasesTable() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
        >
            <Card variant="glass">
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span>Recent Cases</span>
                        <Link href="/cases">
                            <Button variant="ghost" size="sm" className="gap-1">
                                View All <ArrowUpRight className="w-4 h-4" />
                            </Button>
                        </Link>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-800">
                                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">
                                        Case ID
                                    </th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">
                                        Debtor
                                    </th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">
                                        Amount
                                    </th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">
                                        Status
                                    </th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">
                                        Priority
                                    </th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">
                                        Recovery %
                                    </th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-400"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentCases.map((caseItem, index) => (
                                    <motion.tr
                                        key={caseItem.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.2, delay: 0.7 + index * 0.05 }}
                                        className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors cursor-pointer"
                                    >
                                        <td className="py-4 px-4">
                                            <span className="font-mono text-sm text-blue-400">
                                                {caseItem.id}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className="text-slate-100">{caseItem.debtor}</span>
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className="font-medium text-slate-100">
                                                {formatCurrency(caseItem.amount)}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4">
                                            <Badge
                                                className={cn(
                                                    "text-xs",
                                                    getStatusColor(caseItem.status)
                                                )}
                                            >
                                                {caseItem.status.replace("_", " ")}
                                            </Badge>
                                        </td>
                                        <td className="py-4 px-4">
                                            <Badge
                                                className={cn(
                                                    "text-xs",
                                                    getPriorityColor(caseItem.priority)
                                                )}
                                            >
                                                {caseItem.priority}
                                            </Badge>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                                    <div
                                                        className={cn(
                                                            "h-full rounded-full transition-all duration-500",
                                                            caseItem.recoveryProb >= 70
                                                                ? "bg-green-500"
                                                                : caseItem.recoveryProb >= 40
                                                                    ? "bg-yellow-500"
                                                                    : "bg-red-500"
                                                        )}
                                                        style={{ width: `${caseItem.recoveryProb}%` }}
                                                    />
                                                </div>
                                                <span className="text-sm text-slate-400">
                                                    {caseItem.recoveryProb}%
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <ChevronRight className="w-4 h-4" />
                                            </Button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
