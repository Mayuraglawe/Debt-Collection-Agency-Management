"use client";

import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const data = [
    { name: "Open", value: 245, color: "#3b82f6" },
    { name: "In Progress", value: 189, color: "#f59e0b" },
    { name: "Escalated", value: 67, color: "#ef4444" },
    { name: "Settled", value: 423, color: "#22c55e" },
    { name: "Closed", value: 312, color: "#64748b" },
];

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: { color: string } }> }) => {
    if (active && payload && payload.length) {
        return (
            <div className="glass rounded-lg p-3 shadow-xl border border-slate-700">
                <p className="text-slate-100 font-medium">
                    {payload[0].name}: {payload[0].value}
                </p>
            </div>
        );
    }
    return null;
};

export function CaseDistributionChart() {
    const total = data.reduce((sum, item) => sum + item.value, 0);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
        >
            <Card variant="glass" className="h-[400px]">
                <CardHeader>
                    <CardTitle>Case Distribution</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                    <div className="flex h-full">
                        <div className="flex-1">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={3}
                                        dataKey="value"
                                    >
                                        {data.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={entry.color}
                                                stroke="transparent"
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex flex-col justify-center space-y-3 ml-4">
                            {data.map((item, index) => (
                                <motion.div
                                    key={item.name}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                                    className="flex items-center gap-3"
                                >
                                    <div
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: item.color }}
                                    />
                                    <span className="text-sm text-slate-400">{item.name}</span>
                                    <span className="text-sm font-medium text-slate-100">
                                        {((item.value / total) * 100).toFixed(1)}%
                                    </span>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
