import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  TrendingUp,
  IndianRupee,
  AlertTriangle,
  ShieldAlert,
  CheckCircle,
  XCircle,
  RefreshCw,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import DashboardLayout from "@/components/layout/DashboardLayout";
import StatCard from "@/components/dashboard/StatCard";
import TrustGauge from "@/components/dashboard/TrustGauge";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import type { GraphNode as ApiGraphNode, GraphEdge as ApiGraphEdge } from "@/lib/api";
import {
  monthlyReconciliation,
  riskProfiles,
  supplyChainNodes,
  supplyChainEdges,
} from "@/lib/mockData";

const PIE_COLORS = [
  "hsl(0 0% 8%)",
  "hsl(0 0% 25%)",
  "hsl(0 0% 40%)",
  "hsl(0 0% 55%)",
  "hsl(0 0% 68%)",
  "hsl(0 0% 80%)",
];

const TYPE_COLORS: Record<string, string> = {
  Taxpayer:   "hsl(0 0% 8%)",
  Invoice:    "hsl(0 0% 35%)",
  GSTR1:      "hsl(0 0% 20%)",
  GSTR2B:     "hsl(0 0% 45%)",
  GSTR3B:     "hsl(0 0% 55%)",
  TaxPayment: "hsl(0 0% 65%)",
  HighRisk:   "hsl(8 90% 60%)",
};

// Mini force-layout for the real graph overview
function layoutNodes(
  nodes: ApiGraphNode[],
  edges: ApiGraphEdge[],
  width: number,
  height: number
): Record<string, { x: number; y: number }> {
  const positions: Record<string, { x: number; y: number; vx: number; vy: number }> = {};
  nodes.forEach((n, i) => {
    const angle = (i / nodes.length) * Math.PI * 2;
    positions[n.id] = {
      x: width / 2 + Math.cos(angle) * 120,
      y: height / 2 + Math.sin(angle) * 100,
      vx: 0, vy: 0,
    };
  });
  for (let iter = 0; iter < 60; iter++) {
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = positions[nodes[i].id], b = positions[nodes[j].id];
        const dx = b.x - a.x, dy = b.y - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const f = 1800 / (dist * dist);
        a.vx -= (dx / dist) * f; a.vy -= (dy / dist) * f;
        b.vx += (dx / dist) * f; b.vy += (dy / dist) * f;
      }
    }
    edges.forEach((e) => {
      const a = positions[e.source], b = positions[e.target];
      if (!a || !b) return;
      const dx = b.x - a.x, dy = b.y - a.y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const f = dist * 0.01;
      a.vx += (dx / dist) * f; a.vy += (dy / dist) * f;
      b.vx -= (dx / dist) * f; b.vy -= (dy / dist) * f;
    });
    nodes.forEach((n) => {
      const p = positions[n.id];
      p.vx = (p.vx + (width / 2 - p.x) * 0.008) * 0.85;
      p.vy = (p.vy + (height / 2 - p.y) * 0.008) * 0.85;
      p.x = Math.max(35, Math.min(width - 35, p.x + p.vx));
      p.y = Math.max(35, Math.min(height - 35, p.y + p.vy));
    });
  }
  return positions;
}

// Static node positions (mock fallback)
const nodePositions: Record<string, { x: number; y: number }> = {
  n1: { x: 280, y: 160 },
  n2: { x: 80,  y: 60  },
  n3: { x: 80,  y: 260 },
  n4: { x: 480, y: 60  },
  n5: { x: 500, y: 180 },
  n6: { x: 480, y: 260 },
};

const Dashboard = () => {
  const [selectedNode, setSelectedNode] = useState<string>("n1");
  const [resolved, setResolved] = useState(false);
  const [resolving, setResolving] = useState(false);

  // â”€â”€ API Queries â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const { data: reconcileStats, isLoading: statsLoading, refetch: refetchStats } =
    useQuery({
      queryKey: ["reconcile-stats"],
      queryFn: () => api.reconcile.stats(),
      staleTime: 30_000,
    });

  const { data: graphStats } =
    useQuery({
      queryKey: ["graph-stats"],
      queryFn: () => api.graph.stats(),
      staleTime: 60_000,
    });

  const { data: graphOverview, isLoading: graphLoading } =
    useQuery({
      queryKey: ["graph-overview"],
      queryFn: () => api.graph.overview(30),
      staleTime: 60_000,
    });

  // â”€â”€ Node distribution from graph stats â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const nodeDistribution = graphStats
    ? Object.entries(graphStats.nodes)
        .filter(([, v]) => v > 0)
        .sort((a, b) => b[1] - a[1])
        .map(([name, value]) => ({ name, value }))
    : [
        { name: "Taxpayers", value: 156 },
        { name: "Invoices",  value: 892 },
        { name: "GSTR-1",    value: 312 },
        { name: "GSTR-2B",   value: 298 },
        { name: "GSTR-3B",   value: 245 },
        { name: "Payments",  value: 178 },
      ];

  // â”€â”€ Graph layout â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const useRealGraph = !!graphOverview && graphOverview.nodes.length > 0;
  const realPositions = useRealGraph
    ? layoutNodes(graphOverview!.nodes, graphOverview!.edges, 580, 320)
    : null;

  // â”€â”€ Risk profile â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const mockProfile = riskProfiles[selectedNode] ?? riskProfiles["n1"];
  const selectedRealNode = useRealGraph
    ? graphOverview!.nodes.find((n) => n.id === selectedNode)
    : null;
  const realScore = selectedRealNode
    ? typeof selectedRealNode.properties.risk_score === "number"
      ? Math.round((1 - (selectedRealNode.properties.risk_score as number)) * 100)
      : 50
    : 50;

  const handleResolve = () => {
    setResolving(true);
    setTimeout(() => { setResolving(false); setResolved(true); }, 1800);
  };

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {reconcileStats
                ? `${reconcileStats.total.toLocaleString()} invoices Â· reconciled ${
                    reconcileStats.run_at
                      ? new Date(reconcileStats.run_at).toLocaleString()
                      : "â€”"
                  }`
                : "Overview of your GST reconciliation status"}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetchStats()} className="h-8 gap-1.5">
            <RefreshCw size={13} className={statsLoading ? "animate-spin" : ""} />
            Refresh
          </Button>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            title="Valid Invoices"
            value={reconcileStats ? reconcileStats.valid.toLocaleString() : "â€”"}
            trend={reconcileStats ? `${reconcileStats.total} total` : "loadingâ€¦"}
            icon={TrendingUp}
            accent="success"
          />
          <StatCard
            title="High-Risk Invoices"
            value={reconcileStats ? reconcileStats.high_risk.toLocaleString() : "â€”"}
            trend={reconcileStats ? `${reconcileStats.warning} warnings` : "loadingâ€¦"}
            icon={IndianRupee}
            accent="danger"
            glow
          />
          <StatCard
            title="Active Anomalies"
            value={reconcileStats
              ? (reconcileStats.warning + reconcileStats.high_risk).toLocaleString()
              : "â€”"}
            trend={reconcileStats ? `${reconcileStats.pending} pending` : "loadingâ€¦"}
            icon={AlertTriangle}
            accent="warning"
          />
          <StatCard
            title="Pending Review"
            value={reconcileStats ? reconcileStats.pending.toLocaleString() : "â€”"}
            trend={reconcileStats ? `of ${reconcileStats.total} total` : "loadingâ€¦"}
            icon={ShieldAlert}
            accent="danger"
          />
        </div>

        {/* Main content */}
        <div className="grid xl:grid-cols-[1fr_340px] gap-5">
          {/* Left panel */}
          <div className="space-y-5">
            {/* Graph Overview */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="font-display font-bold text-foreground">
                    {useRealGraph ? "Knowledge Graph Overview" : "Supply Chain Graph"}
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {useRealGraph
                      ? `${graphOverview!.node_count} nodes Â· ${graphOverview!.edge_count} edges Â· click a node to inspect`
                      : "Click a node to view risk profile"}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-foreground/[0.05] text-xs font-medium text-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-foreground animate-pulse" />
                  {useRealGraph ? "Live" : "Demo"}
                </span>
              </div>

              {graphLoading ? (
                <div className="w-full h-[320px] rounded-xl bg-surface-sunken border border-border/60 flex items-center justify-center">
                  <RefreshCw size={18} className="animate-spin text-muted-foreground" />
                </div>
              ) : useRealGraph ? (
                <svg viewBox="0 0 580 320" className="w-full h-auto bg-surface-sunken rounded-xl border border-border/60">
                  {graphOverview!.edges.slice(0, 80).map((edge, i) => {
                    const s = realPositions![edge.source];
                    const t = realPositions![edge.target];
                    if (!s || !t) return null;
                    const isRisk =
                      graphOverview!.nodes.find((n) => n.id === edge.source)?.risk_level === "High";
                    return (
                      <line
                        key={i}
                        x1={s.x} y1={s.y} x2={t.x} y2={t.y}
                        stroke={isRisk ? "hsl(8 90% 60%)" : "hsl(0 0% 75%)"}
                        strokeWidth={isRisk ? 2 : 1.5}
                        strokeDasharray={isRisk ? "6 4" : "none"}
                        strokeOpacity={0.45}
                      />
                    );
                  })}
                  {graphOverview!.nodes.slice(0, 50).map((node) => {
                    const pos = realPositions![node.id];
                    if (!pos) return null;
                    const isSelected = selectedNode === node.id;
                    const isHighRisk = node.risk_level === "High";
                    const color = TYPE_COLORS[node.label] ?? (isHighRisk ? "hsl(8 90% 60%)" : "hsl(0 0% 30%)");
                    return (
                      <g key={node.id} onClick={() => setSelectedNode(node.id)} className="cursor-pointer">
                        <circle
                          cx={pos.x} cy={pos.y}
                          r={isSelected ? 22 : 18}
                          fill={color}
                          fillOpacity={isSelected ? 1 : 0.85}
                          stroke={isSelected ? "hsl(0 0% 40%)" : "transparent"}
                          strokeWidth={2}
                        />
                        <text
                          x={pos.x} y={pos.y + 1}
                          textAnchor="middle" dominantBaseline="middle"
                          fill="white" fontSize="7" fontWeight="600" fontFamily="Inter, sans-serif"
                        >
                          {node.id.length > 12 ? node.id.slice(0, 12) + "â€¦" : node.id}
                        </text>
                        <text
                          x={pos.x} y={pos.y + 32}
                          textAnchor="middle"
                          fill="hsl(0 0% 40%)" fontSize="8" fontFamily="Inter, sans-serif"
                        >
                          {node.label}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              ) : (
                /* Fallback: static mock graph */
                <svg viewBox="0 0 580 320" className="w-full h-auto bg-surface-sunken rounded-xl border border-border/60">
                  {supplyChainEdges.map((edge, i) => {
                    const s = nodePositions[edge.source], t = nodePositions[edge.target];
                    if (!s || !t) return null;
                    return (
                      <line
                        key={i}
                        x1={s.x} y1={s.y} x2={t.x} y2={t.y}
                        stroke={edge.alert ? "hsl(8 90% 60%)" : "hsl(0 0% 75%)"}
                        strokeWidth={edge.alert ? 2 : 1.5}
                        strokeDasharray={edge.alert ? "6 4" : "none"}
                        strokeOpacity={edge.alert ? 0.7 : 0.4}
                      />
                    );
                  })}
                  {supplyChainNodes.map((node) => {
                    const pos = nodePositions[node.id];
                    if (!pos) return null;
                    const isSelected = selectedNode === node.id;
                    const isHighRisk = node.type === "HighRisk";
                    return (
                      <g key={node.id} onClick={() => setSelectedNode(node.id)} className="cursor-pointer">
                        <circle
                          cx={pos.x} cy={pos.y}
                          r={isSelected ? 26 : 22}
                          fill={isHighRisk ? "hsl(8 90% 60%)" : "hsl(0 0% 8%)"}
                          fillOpacity={isSelected ? 1 : 0.85}
                          stroke={isSelected ? "hsl(0 0% 40%)" : "transparent"}
                          strokeWidth={2}
                        />
                        <text
                          x={pos.x} y={pos.y + 1}
                          textAnchor="middle" dominantBaseline="middle"
                          fill="white" fontSize="8" fontWeight="600" fontFamily="Inter, sans-serif"
                        >
                          {node.label.length > 10 ? node.label.slice(0, 10) + "â€¦" : node.label}
                        </text>
                        <text
                          x={pos.x} y={pos.y + 40}
                          textAnchor="middle"
                          fill="hsl(0 0% 40%)" fontSize="9" fontFamily="Inter, sans-serif"
                        >
                          {node.type}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              )}
            </div>

            {/* Charts row */}
            <div className="grid md:grid-cols-2 gap-5">
              {/* Bar Chart */}
              <div className="glass-card p-6">
                <h3 className="font-display font-bold text-foreground text-sm mb-1">Monthly Reconciliation</h3>
                <p className="text-xs text-muted-foreground mb-4">Invoice status breakdown by month</p>
                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyReconciliation} barGap={2} barSize={12}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 0% / 0.05)" vertical={false} />
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(0 0% 40%)" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: "hsl(0 0% 40%)" }} axisLine={false} tickLine={false} width={30} />
                      <Tooltip
                        contentStyle={{
                          background: "white",
                          border: "1px solid hsl(0 0% 88%)",
                          borderRadius: "0.75rem",
                          boxShadow: "0 4px 24px hsl(0 0% 0% / 0.08)",
                          fontSize: 12,
                        }}
                      />
                      <Bar dataKey="valid"    fill="hsl(152 69% 40%)" radius={[3, 3, 0, 0]} name="Valid" />
                      <Bar dataKey="warning"  fill="hsl(38 92% 50%)"  radius={[3, 3, 0, 0]} name="Warning" />
                      <Bar dataKey="highRisk" fill="hsl(8 90% 60%)"   radius={[3, 3, 0, 0]} name="High-Risk" />
                      <Bar dataKey="pending"  fill="hsl(0 0% 72%)"    radius={[3, 3, 0, 0]} name="Pending" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Pie Chart */}
              <div className="glass-card p-6">
                <h3 className="font-display font-bold text-foreground text-sm mb-1">Node Distribution</h3>
                <p className="text-xs text-muted-foreground mb-4">
                  Graph entities by type
                  {graphStats ? ` Â· ${graphStats.total_nodes.toLocaleString()} total` : ""}
                </p>
                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={nodeDistribution}
                        cx="50%" cy="50%"
                        innerRadius={50} outerRadius={80}
                        paddingAngle={3} dataKey="value" stroke="none"
                      >
                        {nodeDistribution.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: "white",
                          border: "1px solid hsl(0 0% 88%)",
                          borderRadius: "0.75rem",
                          boxShadow: "0 4px 24px hsl(0 0% 0% / 0.08)",
                          fontSize: 12,
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-2">
                  {nodeDistribution.map((item, i) => (
                    <div key={item.name} className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span className="text-[10px] text-muted-foreground">{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right panel - Risk Profile */}
          <motion.div
            key={selectedNode}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="glass-card p-6 h-fit sticky top-8"
          >
            <h3 className="font-display font-bold text-foreground mb-1">Risk Profile</h3>

            {useRealGraph && selectedRealNode ? (
              <>
                <p className="text-xs text-muted-foreground font-mono mb-5">{selectedRealNode.id}</p>
                <TrustGauge score={realScore} />
                <div className="mt-5 space-y-2">
                  {Object.entries(selectedRealNode.properties)
                    .filter(([k]) =>
                      ["status", "risk_level", "total_value", "invoice_date", "registration_status"].includes(k)
                    )
                    .map(([k, v]) => (
                      <div key={k} className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground capitalize">{k.replace(/_/g, " ")}</span>
                        <span className="font-mono text-foreground">{String(v)}</span>
                      </div>
                    ))}
                  <div className="pt-1">
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                        selectedRealNode.risk_level === "High"
                          ? "bg-danger/10 text-danger"
                          : selectedRealNode.risk_level === "Medium"
                          ? "bg-warning/10 text-warning"
                          : "bg-success/10 text-success"
                      }`}
                    >
                      {selectedRealNode.risk_level ?? "Unknown"} Risk Â· {selectedRealNode.label}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <>
                <p className="text-xs text-muted-foreground font-mono mb-5">{mockProfile?.gstin}</p>
                <TrustGauge score={mockProfile?.score ?? 50} />
                <div className="mt-6 space-y-3">
                  <p className="text-xs font-semibold text-foreground uppercase tracking-wider">AI Audit Trail</p>
                  {mockProfile?.auditTrail.map((item, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-sm">
                      {item.passed ? (
                        <CheckCircle size={15} className="text-success mt-0.5 flex-shrink-0" />
                      ) : (
                        <XCircle size={15} className="text-danger mt-0.5 flex-shrink-0" />
                      )}
                      <span className={item.passed ? "text-foreground" : "text-muted-foreground"}>
                        {item.message}
                      </span>
                    </div>
                  ))}
                </div>
                {mockProfile && mockProfile.score < 50 && (
                  <div className="mt-6 pt-5 border-t border-border/60">
                    {resolved ? (
                      <div className="flex items-center gap-2 text-sm text-success">
                        <CheckCircle size={16} />
                        <span className="font-medium">Anomaly resolved</span>
                      </div>
                    ) : (
                      <Button
                        className="w-full text-sm font-semibold h-10"
                        onClick={handleResolve}
                        disabled={resolving}
                      >
                        {resolving ? (
                          <span className="flex items-center gap-2">
                            <span className="w-4 h-4 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin" />
                            Resolvingâ€¦
                          </span>
                        ) : "Resolve Anomaly"}
                      </Button>
                    )}
                  </div>
                )}
              </>
            )}
          </motion.div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default Dashboard;
