import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  trend?: string;
  icon: LucideIcon;
  accent?: "default" | "success" | "warning" | "danger";
  glow?: boolean;
}

const accentMap = {
  default: {
    iconBg: "bg-foreground",
    iconText: "text-primary-foreground",
    trend: "text-muted-foreground",
  },
  success: {
    iconBg: "bg-success",
    iconText: "text-success-foreground",
    trend: "text-success",
  },
  warning: {
    iconBg: "bg-warning",
    iconText: "text-warning-foreground",
    trend: "text-warning",
  },
  danger: {
    iconBg: "bg-danger",
    iconText: "text-danger-foreground",
    trend: "text-danger",
  },
};

const StatCard = ({ title, value, trend, icon: Icon, accent = "default", glow }: StatCardProps) => {
  const colors = accentMap[accent];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "glass-card p-6 group cursor-default transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5",
        glow && "ring-1 ring-foreground/10"
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", colors.iconBg)}>
          <Icon size={18} className={colors.iconText} strokeWidth={1.5} />
        </div>
        {trend && (
          <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-md bg-foreground/[0.05]", colors.trend)}>
            {trend}
          </span>
        )}
      </div>
      <p className="text-2xl font-display font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground mt-1 font-medium">{title}</p>
    </motion.div>
  );
};

export default StatCard;
