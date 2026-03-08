import { useState } from "react";
import { motion } from "framer-motion";
import {
  Network,
  Clock,
  GitBranch,
  AlertTriangle,
  Play,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import RiskBadge from "@/components/dashboard/RiskBadge";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import type { PatternSummary } from "@/lib/api";

type Tab = "circular" | "delays" | "amendments" | "networks";

const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "circular", label: "Circular Trades", icon: Network },
  { id: "delays", label: "Payment Delays", icon: Clock },
  { id: "amendments", label: "Amendments", icon: GitBranch },
  { id: "networks", label: "Risk Networks", icon: AlertTriangle },
];

const Patterns = () => {
  const [activeTab, setActiveTab] = useState<Tab>("circular");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<PatternSummary | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const handleRun = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const result = await api.patterns.all();
      setData(result);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Detection failed — backend may be unavailable");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Pattern Detection</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Detect fraud patterns and anomalies across your GST network
          </p>
        </div>

        {/* Tab bar + Run button */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="flex items-center gap-1 p-1 glass-card">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-foreground text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
              >
                <tab.icon size={14} />
                {tab.label}
              </button>
            ))}
          </div>

          <Button
            size="sm"
            className="h-9 gap-1.5 font-semibold shadow-sm shadow-foreground/10 ml-auto"
            onClick={handleRun}
            disabled={loading}
          >
            <Play size={14} className={loading ? "animate-spin" : ""} />
            {loading ? "Running…" : "Run Detection"}
          </Button>
        </div>

        {errorMsg && (
          <div className="text-xs text-danger bg-danger/[0.08] border border-danger/20 rounded-lg px-4 py-2.5">
            {errorMsg}
          </div>
        )}

        {/* Results */}
        {!data ? (
          <div className="glass-card p-12 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 rounded-xl bg-surface-sunken flex items-center justify-center mb-4">
              <AlertTriangle size={24} className="text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground mb-1">No detection results yet</p>
            <p className="text-xs text-muted-foreground">Click "Run Detection" to analyze patterns</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card overflow-hidden"
          >
            {/* Circular Trades */}
            {activeTab === "circular" && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Cycle ID</th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">GSTINs</th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Period</th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Risk</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data.circular_trades ?? []).map((ct) => (
                      <tr key={ct.cycle_id} className="border-b border-border/50 hover:bg-accent/50 transition-colors">
                        <td className="px-5 py-3.5 font-mono text-foreground font-semibold text-xs">{ct.cycle_id}</td>
                        <td className="px-5 py-3.5 font-mono text-xs text-muted-foreground">
                          {(ct.gstins ?? []).map((g: string, i: number) => (
                            <span key={i}>
                              {g.slice(0, 10)}…{i < ct.gstins.length - 1 && " → "}
                            </span>
                          ))}
                        </td>
                        <td className="px-5 py-3.5 text-muted-foreground">{ct.period}</td>
                        <td className="px-5 py-3.5"><RiskBadge status={ct.risk_level ?? "Warning"} /></td>
                      </tr>
                    ))}
                    {(data.circular_trades ?? []).length === 0 && (
                      <tr><td colSpan={4} className="px-5 py-8 text-center text-muted-foreground">No circular trades detected</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Payment Delays */}
            {activeTab === "delays" && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">GSTIN</th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Avg Delay</th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Max Delay</th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Invoices</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data.payment_delays ?? []).map((pd) => (
                      <tr key={pd.gstin} className="border-b border-border/50 hover:bg-accent/50 transition-colors">
                        <td className="px-5 py-3.5 font-mono text-foreground font-medium text-xs">{pd.gstin}</td>
                        <td className="px-5 py-3.5">
                          <span className={`font-mono text-xs ${pd.avg_delay_days > 30 ? "text-danger font-semibold" : "text-muted-foreground"}`}>
                            {pd.avg_delay_days}d
                          </span>
                        </td>
                        <td className="px-5 py-3.5 font-mono text-xs text-muted-foreground">{pd.max_delay_days}d</td>
                        <td className="px-5 py-3.5 text-muted-foreground">{pd.affected_invoice_count}</td>
                      </tr>
                    ))}
                    {(data.payment_delays ?? []).length === 0 && (
                      <tr><td colSpan={4} className="px-5 py-8 text-center text-muted-foreground">No payment delays detected</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Amendments */}
            {activeTab === "amendments" && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">GSTIN</th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Amendment Chains</th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Max Depth</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data.amendment_chains ?? []).map((a) => (
                      <tr key={a.gstin} className="border-b border-border/50 hover:bg-accent/50 transition-colors">
                        <td className="px-5 py-3.5 font-mono text-foreground font-medium text-xs">{a.gstin}</td>
                        <td className="px-5 py-3.5">
                          <span className="text-foreground font-semibold">{a.amendment_chains}</span>
                        </td>
                        <td className="px-5 py-3.5 text-muted-foreground">{a.max_chain_depth}</td>
                      </tr>
                    ))}
                    {(data.amendment_chains ?? []).length === 0 && (
                      <tr><td colSpan={3} className="px-5 py-8 text-center text-muted-foreground">No amendment chains detected</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {/* Risk Networks */}
            {activeTab === "networks" && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">GSTIN</th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Partners</th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Risky Partners</th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider min-w-[160px]">Risky Ratio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(data.risk_networks ?? []).map((rn) => (
                      <tr key={rn.gstin} className="border-b border-border/50 hover:bg-accent/50 transition-colors">
                        <td className="px-5 py-3.5 font-mono text-foreground font-medium text-xs">{rn.gstin}</td>
                        <td className="px-5 py-3.5 text-muted-foreground">{rn.total_partners}</td>
                        <td className="px-5 py-3.5 text-danger font-semibold">{rn.risky_partners}</td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 rounded-full bg-foreground/[0.06] overflow-hidden">
                              <div
                                className="h-full rounded-full bg-danger transition-all"
                                style={{ width: `${(rn.risky_partner_ratio ?? 0) * 100}%` }}
                              />
                            </div>
                            <span className="text-xs font-mono text-danger font-semibold w-10 text-right">
                              {((rn.risky_partner_ratio ?? 0) * 100).toFixed(0)}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {(data.risk_networks ?? []).length === 0 && (
                      <tr><td colSpan={4} className="px-5 py-8 text-center text-muted-foreground">No risk networks detected</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        )}
      </motion.div>
    </DashboardLayout>
  );
};

export default Patterns;
