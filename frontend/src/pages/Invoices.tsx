import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  Search,
  RefreshCw,
  Zap,
  ChevronLeft,
  ChevronRight,
  X,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import RiskBadge from "@/components/dashboard/RiskBadge";
import TableSkeleton from "@/components/dashboard/TableSkeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import type { InvoiceListItem, InvoiceDetail, InvoiceStatus } from "@/lib/api";

const PAGE_SIZE = 8;
const STATUS_OPTIONS: (InvoiceStatus | "All")[] = ["All", "Valid", "Warning", "High-Risk", "Pending"];

const Invoices = () => {
  const [gstinFilter, setGstinFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | "All">("All");
  const [page, setPage] = useState(1);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceListItem | null>(null);
  const [reconciling, setReconciling] = useState(false);

  // Debounce GSTIN filter
  const [debouncedGstin, setDebouncedGstin] = useState("");
  const handleGstinChange = (val: string) => {
    setGstinFilter(val);
    clearTimeout((window as unknown as Record<string, ReturnType<typeof setTimeout>>)["_gstinTimer"]);
    (window as unknown as Record<string, ReturnType<typeof setTimeout>>)["_gstinTimer"] = setTimeout(
      () => { setDebouncedGstin(val); setPage(1); },
      350
    );
  };

  // ── API Queries ─────────────────────────────────────────────────────────
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["invoices", page, debouncedGstin, statusFilter],
    queryFn: () =>
      api.invoices.list({
        page,
        per_page: PAGE_SIZE,
        gstin: debouncedGstin || null,
        status: statusFilter !== "All" ? statusFilter : null,
      }),
    staleTime: 15_000,
    placeholderData: (prev) => prev,
  });

  // Detail fetch when a row is selected
  const { data: detailData, isLoading: detailLoading } = useQuery({
    queryKey: ["invoice-detail", selectedInvoice?.invoice_id],
    queryFn: () =>
      selectedInvoice ? api.invoices.detail(selectedInvoice.invoice_id) : null,
    enabled: !!selectedInvoice,
    staleTime: 30_000,
  });

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const handleRefresh = () => refetch();

  const handleReconcile = () => {
    setReconciling(true);
    setTimeout(() => setReconciling(false), 2000);
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Invoices</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage and reconcile your invoice ledger
          </p>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="relative flex-1 max-w-sm">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by GSTIN or Invoice ID…"
              value={gstinFilter}
              onChange={(e) => handleGstinChange(e.target.value)}
              className="pl-9 h-10 text-sm bg-background"
            />
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-surface-sunken rounded-lg border border-border">
            {STATUS_OPTIONS.map((s) => (
              <button
                key={s}
                onClick={() => { setStatusFilter(s); setPage(1); }}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  statusFilter === s
                    ? "bg-foreground text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-background"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="flex gap-2 ml-auto">
            <Button variant="outline" size="sm" onClick={handleRefresh} className="h-9 gap-1.5">
              <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
              Refresh
            </Button>
            <Button size="sm" onClick={handleReconcile} disabled={reconciling} className="h-9 gap-1.5 font-semibold shadow-sm shadow-foreground/10">
              <Zap size={14} />
              {reconciling ? "Running…" : "Run Reconciliation"}
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="glass-card overflow-hidden">
          {isLoading ? (
            <TableSkeleton rows={PAGE_SIZE} cols={6} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Invoice ID</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Seller GSTIN</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Buyer GSTIN</th>
                    <th className="text-right px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Value</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((inv) => (
                    <tr
                      key={inv.invoice_id}
                      onClick={() => setSelectedInvoice(inv)}
                      className="border-b border-border/50 hover:bg-accent/50 transition-colors cursor-pointer group"
                    >
                      <td className="px-5 py-3.5 font-mono text-foreground font-medium text-xs">{inv.invoice_id}</td>
                      <td className="px-5 py-3.5 text-muted-foreground">{inv.invoice_date ?? inv.invoice_id}</td>
                      <td className="px-5 py-3.5 font-mono text-xs text-muted-foreground">{inv.supplier_gstin}</td>
                      <td className="px-5 py-3.5 font-mono text-xs text-muted-foreground">{inv.buyer_gstin}</td>
                      <td className="px-5 py-3.5 text-right font-medium text-foreground">{formatCurrency(inv.total_value)}</td>
                      <td className="px-5 py-3.5"><RiskBadge status={inv.status} /></td>
                    </tr>
                  ))}
                  {items.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-5 py-12 text-center text-muted-foreground">
                        No invoices found matching your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-border">
              <p className="text-xs text-muted-foreground">
                Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total}
              </p>
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  <ChevronLeft size={14} />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  <ChevronRight size={14} />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Detail Modal */}
        <AnimatePresence>
          {selectedInvoice && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-[2px] flex items-center justify-center p-4"
              onClick={() => setSelectedInvoice(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 20 }}
                transition={{ duration: 0.2 }}
                className="bg-background rounded-2xl border border-border shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between p-6 border-b border-border">
                  <div>
                    <h3 className="font-display font-bold text-foreground text-lg">{selectedInvoice.invoice_id}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{selectedInvoice.invoice_date ?? ""}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <RiskBadge status={selectedInvoice.status} />
                    <button onClick={() => setSelectedInvoice(null)} className="text-muted-foreground hover:text-foreground transition-colors">
                      <X size={18} />
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-5">
                  {/* Core fields */}
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Seller GSTIN", value: selectedInvoice.supplier_gstin },
                      { label: "Buyer GSTIN", value: selectedInvoice.buyer_gstin },
                      { label: "Invoice Value", value: formatCurrency(selectedInvoice.total_value) },
                      { label: "Risk Level", value: selectedInvoice.risk_level ?? selectedInvoice.status },
                    ].map((f) => (
                      <div key={f.label} className="bg-surface-sunken rounded-xl p-3.5 border border-border/50">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">{f.label}</p>
                        <p className="text-sm font-medium text-foreground font-mono">{f.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* AI Explanation from detail */}
                  {detailLoading && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <RefreshCw size={14} className="animate-spin" /> Loading details…
                    </div>
                  )}
                  {detailData?.explanation && (
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-warning/[0.06] border border-warning/20">
                      <AlertTriangle size={16} className="text-warning mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-foreground mb-1">AI Explanation</p>
                        <p className="text-sm text-muted-foreground">{detailData.explanation}</p>
                      </div>
                    </div>
                  )}

                  {/* Compliance Path */}
                  {detailData?.path_hops && detailData.path_hops.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">Compliance Path</p>
                      <div className="flex flex-wrap gap-2">
                        {detailData.path_hops.map((hop, i) => (
                          <div
                            key={i}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium ${
                              hop.present
                                ? "border-success/20 bg-success/[0.06] text-success"
                                : "border-danger/20 bg-danger/[0.06] text-danger"
                            }`}
                          >
                            {hop.present ? (
                              <CheckCircle size={13} className="text-success" />
                            ) : (
                              <XCircle size={13} className="text-danger" />
                            )}
                            {hop.hop}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </DashboardLayout>
  );
};

export default Invoices;
