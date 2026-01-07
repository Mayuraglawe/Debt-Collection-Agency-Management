import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    OPEN: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    IN_PROGRESS: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    ESCALATED: "bg-red-500/20 text-red-400 border-red-500/30",
    SETTLED: "bg-green-500/20 text-green-400 border-green-500/30",
    CLOSED: "bg-slate-500/20 text-slate-400 border-slate-500/30",
    WRITTEN_OFF: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  };
  return colors[status] || colors.OPEN;
}

export function getPriorityColor(priority: string): string {
  const colors: Record<string, string> = {
    LOW: "bg-green-500/20 text-green-400",
    MEDIUM: "bg-yellow-500/20 text-yellow-400",
    HIGH: "bg-orange-500/20 text-orange-400",
    CRITICAL: "bg-red-500/20 text-red-400",
  };
  return colors[priority] || colors.MEDIUM;
}
