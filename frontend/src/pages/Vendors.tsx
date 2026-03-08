import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Cpu, TrendingUp, RefreshCw, CheckCircle, XCircle } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import RiskBadge from "@/components/dashboard/RiskBadge";
import TrustGauge from "@/components/dashboard/TrustGauge";
import TableSkeleton from "@/components/dashboard/TableSkeleton";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import type { VendorListItem } from "@/lib/api";

const Vendors = () => {
  const [selectedGstin, setSelectedGstin] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState("");

  // ── Vendor List ────────────────────────────────────────────────────────
  const {
    data: vendorList,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["vendors"],
    queryFn: () => api.vendors.list({}),
    staleTime: 30_000,
  });

  const vendors: VendorListItem[] = vendorList?.items ?? vendorList ?? [];

  // ── Vendor Profile ─────────────────────────────────────────────────────
  const { data: vendorProfile, isLoading: profileLoading } = useQuery({
    queryKey: ["vendor-profile", selectedGstin],
    queryFn: () => (selectedGstin ? api.vendors.profile(selectedGstin) : null),
    enabled: !!selectedGstin,
    staleTime: 30_000,
  });

  // ── ML Actions ─────────────────────────────────────────────────────────
  const trainMutation = useMutation({
    mutationFn: () => api.vendors.train(),
    onMutate: () => setStatusMsg("Training ML model…"),
    onSuccess: () => setStatusMsg("Model trained successfully"),
    onError: () => setStatusMsg("Training failed — backend may be unavailable"),
  });

  const scoreMutation = useMutation({
    mutationFn: () => api.vendors.scoreAll(),
    onMutate: () => setStatusMsg("Scoring all vendors…"),
    onSuccess: () => setStatusMsg("All vendors scored successfully"),
    onError: () => setStatusMsg("Scoring failed — backend may be unavailable"),
  });

  const getScoreBarColor = (score: number) => {
    if (score >= 75) return "bg-success";
    if (score >= 50) return "bg-warning";
    return "bg-danger";
  };

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Vendors</h1>
          <p className="text-sm text-muted-foreground mt-1">Vendor risk management with ML scoring</p>
        </div>

        {/* Action Bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-1.5"
            onClick={() => trainMutation.mutate()}
            disabled={trainMutation.isPending}
          >
            <Cpu size={14} />
            {trainMutation.isPending ? "Training…" : "Train ML Model"}
          </Button>
          <Button
            size="sm"
            className="h-9 gap-1.5 font-semibold shadow-sm shadow-foreground/10"
            onClick={() => scoreMutation.mutate()}
            disabled={scoreMutation.isPending}
          >
            <TrendingUp size={14} />
            {scoreMutation.isPending ? "Scoring…" : "Score All Vendors"}
          </Button>
          <Button variant="outline" size="sm" className="h-9 gap-1.5" onClick={() => refetch()}>
            <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
          </Button>
          {statusMsg && (
            <span className="text-xs text-muted-foreground ml-2">{statusMsg}</span>
          )}
        </div>

        {/* Split layout */}
        <div className="grid xl:grid-cols-[1fr_360px] gap-5">
          {/* Left - Table */}
          <div className="glass-card overflow-hidden">
            {isLoading ? (
              <TableSkeleton rows={7} cols={7} />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">GSTIN</th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">State</th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider min-w-[140px]">Compliance</th>
                      <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Risk</th>
                      <th className="text-center px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Invoices</th>
                      <th className="text-center px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">High-Risk</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vendors.map((v) => (
                      <tr
                        key={v.gstin}
                        onClick={() => setSelectedGstin(v.gstin)}
                        className={`border-b border-border/50 hover:bg-accent/50 transition-colors cursor-pointer ${
                          selectedGstin === v.gstin ? "bg-accent/40" : ""
                        }`}
                      >
                        <td className="px-5 py-3.5 font-mono text-foreground font-medium text-xs">{v.gstin}</td>
                        <td className="px-5 py-3.5 text-muted-foreground text-xs">{v.state_code}</td>
                        <td className="px-5 py-3.5">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${
                            v.registration_status === "Active"
                              ? "bg-success/10 text-success"
                              : v.registration_status === "Suspended"
                              ? "bg-danger/10 text-danger font-semibold"
                              : "bg-foreground/[0.08] text-muted-foreground"
                          }`}>
                            {v.registration_status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 rounded-full bg-foreground/[0.06] overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${getScoreBarColor(v.compliance_score ?? 0)}`}
                                style={{ width: `${v.compliance_score ?? 0}%` }}
                              />
                            </div>
                            <span className="text-xs font-mono text-muted-foreground w-7 text-right">{v.compliance_score ?? "—"}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5"><RiskBadge status={v.risk_level ?? "Pending"} /></td>
                        <td className="px-5 py-3.5 text-center text-muted-foreground">{v.total_invoices ?? "—"}</td>
                        <td className="px-5 py-3.5 text-center">
                          <span className={v.high_risk_count > 0 ? "font-semibold text-danger" : "text-muted-foreground"}>
                            {v.high_risk_count ?? 0}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {vendors.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-5 py-12 text-center text-muted-foreground">
                          No vendors found. Upload taxpayer data to get started.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Right - Vendor Profile */}
          <AnimatePresence mode="wait">
            {selectedGstin && vendorProfile ? (
              <motion.div
                key={selectedGstin}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.25 }}
                className="glass-card p-6 h-fit sticky top-8 space-y-5"
              >
                <div>
                  <p className="text-xs font-mono text-muted-foreground">{vendorProfile.taxpayer?.gstin ?? selectedGstin}</p>
                  <h3 className="font-display font-bold text-foreground mt-1">
                    {vendorProfile.taxpayer?.legal_name ?? selectedGstin}
                  </h3>
                </div>

                <TrustGauge score={vendorProfile.compliance_score ?? 0} size={120} />

                {/* Score breakdown */}
                <div>
                  <p className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">Score Breakdown</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: "Filing Consistency", value: `${vendorProfile.score_breakdown?.filing_consistency ?? "—"}%` },
                      { label: "Avg Delay Days", value: `${vendorProfile.score_breakdown?.avg_payment_delay_days ?? "—"}d` },
                      { label: "Amendment Rate", value: `${vendorProfile.score_breakdown?.amendment_rate ?? "—"}%` },
                      { label: "Value Mismatch", value: `${vendorProfile.score_breakdown?.value_mismatch_rate ?? "—"}%` },
                    ].map((item) => (
                      <div key={item.label} className="bg-surface-sunken rounded-xl p-3 border border-border/50">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{item.label}</p>
                        <p className="text-sm font-display font-bold text-foreground mt-1">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pattern flags */}
                {vendorProfile.pattern_flags && vendorProfile.pattern_flags.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">Pattern Flags</p>
                    <div className="flex flex-wrap gap-1.5">
                      {vendorProfile.pattern_flags.map((flag: string) => (
                        <span key={flag} className="px-2 py-1 rounded-md bg-danger/[0.08] text-danger font-mono text-[10px] font-semibold border border-danger/15">
                          {flag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Filing history */}
                {vendorProfile.filing_history && vendorProfile.filing_history.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">Filing History</p>
                    <div className="space-y-2">
                      {vendorProfile.filing_history.slice(0, 6).map((fh: Record<string, unknown>, i: number) => (
                        <div key={i} className="flex items-center gap-3 text-xs">
                          <span className="text-muted-foreground w-20 flex-shrink-0">{String(fh.tax_period ?? fh.period ?? "")}</span>
                          <span className="flex items-center gap-1">
                            {fh.gstr1_filed ? <CheckCircle size={12} className="text-success" /> : <XCircle size={12} className="text-danger" />}
                            <span className="text-muted-foreground">1</span>
                          </span>
                          <span className="flex items-center gap-1">
                            {fh.gstr3b_filed ? <CheckCircle size={12} className="text-success" /> : <XCircle size={12} className="text-danger" />}
                            <span className="text-muted-foreground">3B</span>
                          </span>
                          <span className={`font-mono ${Number(fh.delay_days ?? 0) > 15 ? "text-danger font-semibold" : "text-muted-foreground"}`}>
                            {String(fh.delay_days ?? 0)}d
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ) : profileLoading && selectedGstin ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-card p-8 flex flex-col items-center justify-center text-center h-fit"
              >
                <RefreshCw size={20} className="animate-spin text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">Loading vendor profile…</p>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-card p-8 flex flex-col items-center justify-center text-center h-fit"
              >
                <div className="w-12 h-12 rounded-xl bg-surface-sunken flex items-center justify-center mb-3">
                  <TrendingUp size={20} className="text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">Select a vendor to view their risk profile</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default Vendors;
