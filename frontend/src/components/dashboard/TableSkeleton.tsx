import { cn } from "@/lib/utils";

interface TableSkeletonProps {
  rows?: number;
  cols?: number;
  className?: string;
}

const TableSkeleton = ({ rows = 5, cols = 6, className }: TableSkeletonProps) => {
  return (
    <div className={cn("space-y-3 p-6", className)}>
      {/* Header */}
      <div className="flex gap-4 pb-3 border-b border-border">
        {Array.from({ length: cols }).map((_, i) => (
          <div
            key={`h-${i}`}
            className="h-3 rounded-md bg-foreground/[0.06] animate-pulse"
            style={{ width: `${Math.random() * 60 + 60}px` }}
          />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, r) => (
        <div key={`r-${r}`} className="flex gap-4 py-2">
          {Array.from({ length: cols }).map((_, c) => (
            <div
              key={`r-${r}-c-${c}`}
              className="h-3 rounded-md bg-foreground/[0.04] animate-pulse"
              style={{
                width: `${Math.random() * 80 + 40}px`,
                animationDelay: `${(r * cols + c) * 0.05}s`,
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default TableSkeleton;
