"use client";

import { motion } from "framer-motion";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const data = [
    { month: "Jan", recovered: 4200000, target: 5000000 },
    { month: "Feb", recovered: 4800000, target: 5200000 },
    { month: "Mar", recovered: 5100000, target: 5500000 },
    { month: "Apr", recovered: 4700000, target: 5300000 },
    { month: "May", recovered: 5500000, target: 5800000 },
    { month: "Jun", recovered: 6200000, target: 6000000 },
    { month: "Jul", recovered: 5800000, target: 6200000 },
    { month: "Aug", recovered: 6500000, target: 6500000 },
    { month: "Sep", recovered: 7100000, target: 6800000 },
    { month: "Oct", recovered: 6800000, target: 7000000 },
    { month: "Nov", recovered: 7500000, target: 7200000 },
    { month: "Dec", recovered: 8200000, target: 7500000 },
];

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; dataKey: string }>; label?: string }) => {
    if (active && payload && payload.length) {
        return (
            <div className="glass rounded-lg p-3 shadow-xl border border-slate-700">
                <p className="text-slate-300 font-medium mb-2">{label}</p>
                {payload.map((entry, index) => (
                    <p key={index} className="text-sm">
                        <span
                            className={
                                entry.dataKey === "recovered"
                                    ? "text-blue-400"
                                    : "text-purple-400"
                            }
                        >
                            {entry.dataKey === "recovered" ? "Recovered" : "Target"}:
                        </span>{" "}
                        <span className="text-slate-100 font-medium">
                            ₹{(entry.value / 100000).toFixed(1)}L
                        </span>
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

export function RecoveryTrendsChart() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
        >
            <Card variant="glass" className="h-[400px]">
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span>Recovery Trends</span>
                        <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-600" />
                                <span className="text-slate-400">Recovered</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 to-purple-600" />
                                <span className="text-slate-400">Target</span>
                            </div>
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={data}
                            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                        >
                            <defs>
                                <linearGradient id="colorRecovered" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                            <XAxis
                                dataKey="month"
                                stroke="#64748b"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="#64748b"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `₹${value / 100000}L`}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Area
                                type="monotone"
                                dataKey="recovered"
                                stroke="#3b82f6"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorRecovered)"
                            />
                            <Area
                                type="monotone"
                                dataKey="target"
                                stroke="#a855f7"
                                strokeWidth={2}
                                strokeDasharray="5 5"
                                fillOpacity={1}
                                fill="url(#colorTarget)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </motion.div>
    );
}
