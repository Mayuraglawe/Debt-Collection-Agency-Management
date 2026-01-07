import * as React from "react";
import { cn } from "@/lib/utils";

const Badge = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & {
        variant?: "default" | "success" | "warning" | "destructive" | "outline";
    }
>(({ className, variant = "default", ...props }, ref) => {
    const variants = {
        default: "bg-blue-500/20 text-blue-400 border-blue-500/30",
        success: "bg-green-500/20 text-green-400 border-green-500/30",
        warning: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
        destructive: "bg-red-500/20 text-red-400 border-red-500/30",
        outline: "bg-transparent text-slate-400 border-slate-600",
    };

    return (
        <div
            ref={ref}
            className={cn(
                "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
                variants[variant],
                className
            )}
            {...props}
        />
    );
});
Badge.displayName = "Badge";

export { Badge };
