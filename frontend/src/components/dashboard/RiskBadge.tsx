import { cn } from "@/lib/utils";
import type { InvoiceStatus } from "@/lib/mockData";

interface RiskBadgeProps {
  status: InvoiceStatus;
  className?: string;
}

const statusStyles: Record<InvoiceStatus, string> = {
  Valid: "bg-success/10 text-success border-success/20",
  Warning: "bg-warning/10 text-warning border-warning/25",
  "High-Risk": "bg-danger/10 text-danger border-danger/20 font-semibold",
  Pending: "bg-foreground/[0.04] text-muted-foreground border-foreground/8",
};

const dotStyles: Record<InvoiceStatus, string> = {
  Valid: "bg-success",
  Warning: "bg-warning",
  "High-Risk": "bg-danger",
  Pending: "bg-foreground/25",
};

const RiskBadge = ({ status, className }: RiskBadgeProps) => {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium border",
        statusStyles[status],
        className
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", dotStyles[status])} />
      {status}
    </span>
  );
};

export default RiskBadge;
