import { useEffect, useMemo, useState } from "react";
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
  ArrowUpRight,
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
} from "@/lib/mockData";
import { Link } from "react-router-dom";

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

interface SimNode {
  id: string;
  type: string;
  label: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  risk_level?: string;
}

function toSimInput(n: ApiGraphNode): { id: string; type: string; label: string; risk_level?: string } {
  return {
    id: n.id,
    type: n.label,
    label: n.id,
    risk_level: n.risk_level,
  };
}

function runForceSimulation(
  nodes: { id: string; type: string; label: string; risk_level?: string }[],
  edges: { source: string; target: string }[],
  width: number,
  height: number
): SimNode[] {
  const typeGroups: Record<string, number> = {};
  let groupIdx = 0;
  nodes.forEach((n) => {
    if (!(n.type in typeGroups)) typeGroups[n.type] = groupIdx++;
  });
  const groupCount = Math.max(groupIdx, 1);

  const simNodes: SimNode[] = nodes.map((n) => {
    const gIdx = typeGroups[n.type];
    const angle = (gIdx / groupCount) * Math.PI * 2;
    const r = 120;
    return {
      ...n,
      x: width / 2 + Math.cos(angle) * r + (Math.random() - 0.5) * 80,
      y: height / 2 + Math.sin(angle) * r + (Math.random() - 0.5) * 80,
      vx: 0,
      vy: 0,
    };
  }) as SimNode[];

  const nodeMap = new Map<string, number>();
  simNodes.forEach((n, i) => nodeMap.set(n.id, i));

  const iterations = 80;
  const repulsion = 2200;
  const attraction = 0.012;
  const damping = 0.85;
  const centerGravity = 0.008;

  for (let iter = 0; iter < iterations; iter++) {
    for (let i = 0; i < simNodes.length; i++) {
      for (let j = i + 1; j < simNodes.length; j++) {
        const dx = simNodes[j].x - simNodes[i].x;
        const dy = simNodes[j].y - simNodes[i].y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = repulsion / (dist * dist);
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        simNodes[i].vx -= fx;
        simNodes[i].vy -= fy;
        simNodes[j].vx += fx;
        simNodes[j].vy += fy;
      }
    }

    edges.forEach((e) => {
      const si = nodeMap.get(e.source);
      const ti = nodeMap.get(e.target);
      if (si === undefined || ti === undefined || si === ti) return;
      const dx = simNodes[ti].x - simNodes[si].x;
      const dy = simNodes[ti].y - simNodes[si].y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const force = dist * attraction;
      simNodes[si].vx += (dx / dist) * force;
      simNodes[si].vy += (dy / dist) * force;
      simNodes[ti].vx -= (dx / dist) * force;
      simNodes[ti].vy -= (dy / dist) * force;
    });

    simNodes.forEach((n) => {
      n.vx += (width / 2 - n.x) * centerGravity;
      n.vy += (height / 2 - n.y) * centerGravity;
      n.vx *= damping;
      n.vy *= damping;
      n.x += n.vx;
      n.y += n.vy;
      n.x = Math.max(36, Math.min(width - 36, n.x));
      n.y = Math.max(36, Math.min(height - 36, n.y));
    });
  }

  return simNodes;
}

const Dashboard = () => {
  const [selectedNode, setSelectedNode] = useState<string>("n1");
  const [resolved, setResolved] = useState(false);
  const [resolving, setResolving] = useState(false);
  const GRAPH_WIDTH = 580;
  const GRAPH_HEIGHT = 320;

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

  const useRealGraph = !!graphOverview && graphOverview.nodes.length > 0;

  const simNodes = useMemo(
    () =>
      useRealGraph
        ? runForceSimulation(
            graphOverview!.nodes.map(toSimInput),
            graphOverview!.edges,
            GRAPH_WIDTH,
            GRAPH_HEIGHT
          )
        : [],
    [useRealGraph, graphOverview]
  );

  const nodeMap = useMemo(() => {
    const map = new Map<string, SimNode>();
    simNodes.forEach((n) => map.set(n.id, n));
    return map;
  }, [simNodes]);

  useEffect(() => {
    if (!useRealGraph) return;
    const exists = graphOverview!.nodes.some((n) => n.id === selectedNode);
    if (!exists) {
      setSelectedNode(graphOverview!.nodes[0]?.id ?? selectedNode);
    }
  }, [useRealGraph, graphOverview, selectedNode]);

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
                      ? `${graphOverview!.node_count} nodes · ${graphOverview!.edge_count} edges · click a node to inspect`
                      : "Click a node to view risk profile"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-foreground/[0.05] text-xs font-medium text-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-foreground animate-pulse" />
                    {useRealGraph ? "Live" : "Demo"}
                  </span>
                  <Button asChild size="sm" variant="outline" className="h-7 px-2.5 text-xs">
                    <Link to="/graph" className="inline-flex items-center gap-1">
                      Open Graph Workspace
                      <ArrowUpRight size={12} />
                    </Link>
                  </Button>
                </div>
              </div>

              {graphLoading ? (
                <div className="w-full h-[320px] rounded-xl bg-surface-sunken border border-border/60 flex items-center justify-center">
                  <RefreshCw size={18} className="animate-spin text-muted-foreground" />
                </div>
              ) : useRealGraph ? (
                <svg
                  viewBox={`0 0 ${GRAPH_WIDTH} ${GRAPH_HEIGHT}`}
                  className="w-full h-auto bg-surface-sunken rounded-xl border border-border/60"
                  style={{
                    backgroundImage: "radial-gradient(circle at 1px 1px, hsl(0 0% 0% / 0.06) 1px, transparent 0)",
                    backgroundSize: "28px 28px",
                  }}
                >
                  {graphOverview!.edges.slice(0, 110).map((edge, i) => {
                    const s = nodeMap.get(edge.source);
                    const t = nodeMap.get(edge.target);
                    if (!s || !t || s.id === t.id) return null;
                    return (
                      <line
                        key={i}
                        x1={s.x} y1={s.y} x2={t.x} y2={t.y}
                        stroke={edge.alert ? "hsl(8 90% 60%)" : "hsl(0 0% 75%)"}
                        strokeWidth={edge.alert ? 2 : 1}
                        strokeDasharray={edge.alert ? "6 4" : "none"}
                        strokeOpacity={0.5}
                      />
                    );
                  })}

                  {simNodes.slice(0, 70).map((node) => {
                    const isSelected = selectedNode === node.id;
                    return (
                      <g key={node.id} onClick={() => setSelectedNode(node.id)} className="cursor-pointer">
                        <circle
                          cx={node.x}
                          cy={node.y}
                          r={node.type === "Taxpayer" || node.type === "HighRisk" || node.risk_level === "High" ? 18 : 14}
                          fill={node.risk_level === "High" ? TYPE_COLORS["HighRisk"] : (TYPE_COLORS[node.type] || "hsl(0 0% 50%)")}
                          stroke={isSelected ? "hsl(0 0% 40%)" : node.risk_level === "High" ? "hsl(8 90% 85%)" : "white"}
                          strokeWidth={isSelected ? 2.5 : node.risk_level === "High" ? 2 : 1.5}
                          opacity={isSelected ? 1 : 0.9}
                        />
                        <text
                          x={node.x} y={node.y + 28}
                          textAnchor="middle"
                          fill="hsl(0 0% 40%)" fontSize="8" fontFamily="Inter, sans-serif"
                        >
                          {node.label.length > 16 ? node.label.slice(0, 16) + "…" : node.label}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              ) : (
                <div className="w-full h-[320px] rounded-xl bg-surface-sunken border border-border/60 flex items-center justify-center">
                  <p className="text-sm text-muted-foreground">No graph data yet. Open Graph tab for explorer mode.</p>
                </div>
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
