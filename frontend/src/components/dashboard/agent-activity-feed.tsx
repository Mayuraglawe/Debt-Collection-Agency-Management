"use client";

import { motion } from "framer-motion";
import { Bot, Brain, Shield, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const agents = [
    {
        id: "1",
        name: "Predictive Agent",
        type: "PREDICTIVE" as const,
        icon: Brain,
        status: "ACTIVE" as const,
        tasksCompleted: 1247,
        accuracy: 94.5,
        lastAction: "Predicted recovery for Case #1234",
        color: "from-blue-500 to-cyan-500",
    },
    {
        id: "2",
        name: "Negotiation Agent",
        type: "NEGOTIATION" as const,
        icon: Bot,
        status: "ACTIVE" as const,
        tasksCompleted: 856,
        accuracy: 88.2,
        lastAction: "Generated payment plan for Debtor #567",
        color: "from-purple-500 to-pink-500",
    },
    {
        id: "3",
        name: "Compliance Agent",
        type: "COMPLIANCE" as const,
        icon: Shield,
        status: "ACTIVE" as const,
        tasksCompleted: 2103,
        accuracy: 99.8,
        lastAction: "Validated communication for Case #890",
        color: "from-green-500 to-emerald-500",
    },
    {
        id: "4",
        name: "RPA Agent",
        type: "RPA" as const,
        icon: Zap,
        status: "IDLE" as const,
        tasksCompleted: 3421,
        accuracy: 97.1,
        lastAction: "Scheduled 15 follow-up emails",
        color: "from-orange-500 to-amber-500",
    },
];

export function AgentActivityFeed() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
        >
            <Card variant="glass">
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span>AI Agents</span>
                        <Badge variant="success" className="animate-pulse-glow">
                            4 Active
                        </Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {agents.map((agent, index) => {
                            const Icon = agent.icon;
                            return (
                                <motion.div
                                    key={agent.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
                                    className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-colors cursor-pointer group"
                                >
                                    <div
                                        className={cn(
                                            "p-3 rounded-xl bg-gradient-to-br transition-transform duration-300 group-hover:scale-110",
                                            agent.color
                                        )}
                                    >
                                        <Icon className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="font-medium text-slate-100">{agent.name}</p>
                                            <Badge
                                                variant={agent.status === "ACTIVE" ? "success" : "outline"}
                                            >
                                                {agent.status}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-slate-400 truncate">
                                            {agent.lastAction}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium text-slate-100">
                                            {agent.accuracy}%
                                        </p>
                                        <p className="text-xs text-slate-500">Accuracy</p>
                                    </div>
                                    <div className="w-24">
                                        <Progress value={agent.accuracy} className="h-1.5" />
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
