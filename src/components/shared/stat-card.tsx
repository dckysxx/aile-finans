"use client";

import { motion } from "framer-motion";
import { type LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  delay?: number;
  accent?: "primary" | "success" | "danger" | "muted";
}

const accentMap = {
  primary: "text-primary bg-primary/10",
  success: "text-success bg-success/10",
  danger: "text-danger bg-danger/10",
  muted: "text-muted-foreground bg-muted",
};

export function StatCard({
  label, value, icon: Icon, trend, trendUp, delay = 0, accent = "primary",
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: "easeOut" }}
    >
      <Card className="p-5">
        <div className="flex items-start justify-between">
          <span className="text-sm text-muted-foreground">{label}</span>
          <span className={cn("grid h-9 w-9 place-items-center rounded-xl", accentMap[accent])}>
            <Icon className="h-[18px] w-[18px]" />
          </span>
        </div>
        <p className="mt-3 text-2xl font-semibold tracking-tight tabular-nums">{value}</p>
        {trend && (
          <p className={cn("mt-1 text-xs font-medium", trendUp ? "text-success" : "text-danger")}>
            {trend}
          </p>
        )}
      </Card>
    </motion.div>
  );
}
