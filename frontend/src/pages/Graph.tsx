import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Search,
  RefreshCw,
  ArrowLeft,
  ZoomIn,
  ZoomOut,
  Maximize2,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import type { GraphNode, GraphEdge } from "@/lib/api";

const TYPE_COLORS: Record<string, string> = {
  Taxpayer: "hsl(0 0% 8%)",
  Invoice: "hsl(0 0% 35%)",
  GSTR1: "hsl(0 0% 20%)",
  GSTR2B: "hsl(0 0% 45%)",
  GSTR3B: "hsl(0 0% 55%)",
  TaxPayment: "hsl(0 0% 65%)",
  HighRisk: "hsl(8 90% 60%)",
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

/** Normalize an API GraphNode to a SimNode-compatible shape */
function toSimInput(n: GraphNode): { id: string; type: string; label: string; risk_level?: string } {
  return {
    id: n.id,
    type: n.label,       // API uses label as node type
    label: n.id,         // display identifier
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

  const simNodes: SimNode[] = nodes.map((n, i) => {
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
    // Repulsion
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

    // Attraction
    edges.forEach((e) => {
      const si = nodeMap.get(e.source);
      const ti = nodeMap.get(e.target);
      if (si === undefined || ti === undefined) return;
      if (si === ti) return;
      const dx = simNodes[ti].x - simNodes[si].x;
      const dy = simNodes[ti].y - simNodes[si].y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const force = dist * attraction;
      simNodes[si].vx += (dx / dist) * force;
      simNodes[si].vy += (dy / dist) * force;
      simNodes[ti].vx -= (dx / dist) * force;
      simNodes[ti].vy -= (dy / dist) * force;
    });

    // Center gravity
    simNodes.forEach((n) => {
      n.vx += (width / 2 - n.x) * centerGravity;
      n.vy += (height / 2 - n.y) * centerGravity;
    });

    // Update positions
    simNodes.forEach((n) => {
      n.vx *= damping;
      n.vy *= damping;
      n.x += n.vx;
      n.y += n.vy;
      n.x = Math.max(40, Math.min(width - 40, n.x));
      n.y = Math.max(40, Math.min(height - 40, n.y));
    });
  }

  return simNodes;
}

const GraphPage = () => {
  const [gstinSearch, setGstinSearch] = useState("");
  const [depth, setDepth] = useState<1 | 2>(1);
  const [subgraphGstin, setSubgraphGstin] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [apiNodes, setApiNodes] = useState<GraphNode[]>([]);
  const [apiEdges, setApiEdges] = useState<GraphEdge[]>([]);
  const [graphLoading, setGraphLoading] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, y: 0 });

  const WIDTH = 800;
  const HEIGHT = 580;

  // Load overview graph on mount
  useEffect(() => {
    api.graph.overview(60)
      .then((data) => {
        setApiNodes(data.nodes ?? []);
        setApiEdges(data.edges ?? []);
      })
      .catch(() => { /* backend unavailable — empty graph */ });
  }, []);

  // Normalised node/edge arrays for subgraph filter
  const { activeNodes, activeEdges } = useMemo(() => {
    if (apiNodes.length === 0) return { activeNodes: [], activeEdges: [] };

    if (!subgraphGstin) return { activeNodes: apiNodes.map(toSimInput), activeEdges: apiEdges };

    const target = apiNodes.find((n) => n.id === subgraphGstin);
    if (!target) return { activeNodes: apiNodes.map(toSimInput), activeEdges: apiEdges };

    const connectedIds = new Set<string>([target.id]);
    apiEdges.forEach((e) => {
      if (e.source === target.id) connectedIds.add(e.target);
      if (e.target === target.id) connectedIds.add(e.source);
    });
    if (depth === 2) {
      const depth1Ids = new Set(connectedIds);
      apiEdges.forEach((e) => {
        if (depth1Ids.has(e.source)) connectedIds.add(e.target);
        if (depth1Ids.has(e.target)) connectedIds.add(e.source);
      });
    }

    const nodes = apiNodes.filter((n) => connectedIds.has(n.id)).map(toSimInput);
    const nodeIds = new Set(nodes.map((n) => n.id));
    const edges = apiEdges.filter((e) => nodeIds.has(e.source) && nodeIds.has(e.target));
    return { activeNodes: nodes, activeEdges: edges };
  }, [apiNodes, apiEdges, subgraphGstin, depth]);

  const simNodes = useMemo(
    () => runForceSimulation(activeNodes, activeEdges, WIDTH, HEIGHT),
    [activeNodes, activeEdges]
  );

  const nodeMap = useMemo(() => {
    const m = new Map<string, SimNode>();
    simNodes.forEach((n) => m.set(n.id, n));
    return m;
  }, [simNodes]);

  const handleNodeClick = (node: SimNode) => {
    if (node.type === "Taxpayer" || node.type === "HighRisk" || node.risk_level === "High") {
      setGraphLoading(true);
      api.graph.subgraph(node.id, depth)
        .then((data) => {
          setApiNodes(data.nodes ?? []);
          setApiEdges(data.edges ?? []);
          setSubgraphGstin(node.id);
          setZoom(1);
          setPan({ x: 0, y: 0 });
        })
        .catch(() => {
          setSubgraphGstin(node.id);
          setZoom(1);
          setPan({ x: 0, y: 0 });
        })
        .finally(() => setGraphLoading(false));
    }
  };

  const handleVisualize = () => {
    const gstin = gstinSearch.trim();
    if (!gstin) return;
    setGraphLoading(true);
    api.graph.subgraph(gstin, depth)
      .then((data) => {
        setApiNodes(data.nodes ?? []);
        setApiEdges(data.edges ?? []);
        setSubgraphGstin(gstin);
        setZoom(1);
        setPan({ x: 0, y: 0 });
      })
      .catch(() => {
        setSubgraphGstin(gstin);
        setZoom(1);
        setPan({ x: 0, y: 0 });
      })
      .finally(() => setGraphLoading(false));
  };

  // Pan handlers
  const onMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("circle")) return;
    isPanning.current = true;
    panStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };
  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isPanning.current) return;
      setPan({ x: e.clientX - panStart.current.x, y: e.clientY - panStart.current.y });
    },
    []
  );
  const onMouseUp = () => {
    isPanning.current = false;
  };

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Knowledge Graph</h1>
          <p className="text-sm text-muted-foreground mt-1">Interactive graph explorer for GST entities</p>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center flex-wrap">
          {subgraphGstin && (
            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-1.5"
              onClick={() => {
                setSubgraphGstin(null);
                setZoom(1);
                setPan({ x: 0, y: 0 });
                api.graph.overview(60).then((d) => { setApiNodes(d.nodes ?? []); setApiEdges(d.edges ?? []); }).catch(() => {});
              }}
            >
              <ArrowLeft size={14} />
              Back to Overview
            </Button>
          )}

          <div className="relative max-w-xs flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search GSTIN…"
              value={gstinSearch}
              onChange={(e) => setGstinSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleVisualize()}
              className="pl-9 h-9 text-sm bg-background"
            />
          </div>

          {/* Depth toggle */}
          <div className="flex items-center gap-1 p-1 bg-surface-sunken rounded-lg border border-border">
            {([1, 2] as const).map((d) => (
              <button
                key={d}
                onClick={() => setDepth(d)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                  depth === d ? "bg-foreground text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Depth {d}
              </button>
            ))}
          </div>

          <Button size="sm" className="h-9 gap-1.5 font-semibold" onClick={handleVisualize} disabled={graphLoading}>
            <Search size={14} className={graphLoading ? "animate-spin" : ""} />
            {graphLoading ? "Loading…" : "Visualize"}
          </Button>

          <Button variant="outline" size="sm" className="h-9" onClick={() => {
            setSubgraphGstin(null); setZoom(1); setPan({ x: 0, y: 0 });
            api.graph.overview(60).then((d) => { setApiNodes(d.nodes ?? []); setApiEdges(d.edges ?? []); }).catch(() => {});
          }}>
            <RefreshCw size={14} />
          </Button>

          <span className="text-xs text-muted-foreground ml-auto">
            {activeNodes.length} nodes · {activeEdges.length} edges
          </span>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-x-5 gap-y-1.5">
          {Object.entries(TYPE_COLORS).map(([type, color]) => (
            <div key={type} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-[11px] text-muted-foreground">{type}</span>
            </div>
          ))}
        </div>

        {/* Canvas */}
        <div className="glass-card overflow-hidden relative">
          {/* Mode badge */}
          <div className="absolute top-4 left-4 z-10">
            {subgraphGstin ? (
              <span className="px-2.5 py-1 rounded-md bg-foreground/[0.06] border border-foreground/10 text-xs font-medium text-foreground">
                Subgraph: {subgraphGstin.slice(0, 15)}…
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-md bg-foreground/[0.05] border border-foreground/10 text-xs font-medium text-foreground">
                Full Overview
              </span>
            )}
          </div>

          {/* Zoom controls */}
          <div className="absolute top-4 right-4 z-10 flex flex-col gap-1">
            <button
              onClick={() => setZoom((z) => Math.min(z + 0.2, 3))}
              className="w-8 h-8 rounded-lg bg-background border border-border flex items-center justify-center text-muted-foreground hover:text-foreground shadow-sm"
            >
              <ZoomIn size={14} />
            </button>
            <button
              onClick={() => setZoom((z) => Math.max(z - 0.2, 0.4))}
              className="w-8 h-8 rounded-lg bg-background border border-border flex items-center justify-center text-muted-foreground hover:text-foreground shadow-sm"
            >
              <ZoomOut size={14} />
            </button>
            <button
              onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
              className="w-8 h-8 rounded-lg bg-background border border-border flex items-center justify-center text-muted-foreground hover:text-foreground shadow-sm"
            >
              <Maximize2 size={14} />
            </button>
          </div>

          <svg
            ref={svgRef}
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            className="w-full bg-surface-sunken cursor-grab active:cursor-grabbing"
            style={{
              height: 580,
              backgroundImage: "radial-gradient(circle at 1px 1px, hsl(0 0% 0% / 0.06) 1px, transparent 0)",
              backgroundSize: "28px 28px",
            }}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
          >
            <defs>
              <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill="hsl(0 0% 60%)" />
              </marker>
            </defs>

            <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
              {/* Edges */}
              {activeEdges.map((edge, i) => {
                const s = nodeMap.get(edge.source);
                const t = nodeMap.get(edge.target);
                if (!s || !t || s.id === t.id) return null;
                return (
                  <line
                    key={i}
                    x1={s.x}
                    y1={s.y}
                    x2={t.x}
                    y2={t.y}
                    stroke={edge.alert ? "hsl(8 90% 60%)" : "hsl(0 0% 75%)"}
                    strokeWidth={edge.alert ? 2 : 1}
                    strokeDasharray={edge.alert ? "6 4" : "none"}
                    strokeOpacity={0.5}
                    markerEnd="url(#arrowhead)"
                  />
                );
              })}

              {/* Nodes */}
              {simNodes.map((node) => (
                <g
                  key={node.id}
                  onClick={() => handleNodeClick(node)}
                  className={node.type === "Taxpayer" || node.type === "HighRisk" || node.risk_level === "High" ? "cursor-pointer" : "cursor-default"}
                >
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={node.type === "Taxpayer" || node.type === "HighRisk" || node.risk_level === "High" ? 18 : 14}
                    fill={node.risk_level === "High" ? TYPE_COLORS["HighRisk"] : (TYPE_COLORS[node.type] || "hsl(0 0% 50%)")}
                    stroke={node.risk_level === "High" ? "hsl(8 90% 85%)" : "white"}
                    strokeWidth={node.risk_level === "High" ? 2.5 : 1.5}
                    opacity={0.9}
                  />
                  <text
                    x={node.x}
                    y={node.y + 28}
                    textAnchor="middle"
                    fill="hsl(0 0% 40%)"
                    fontSize="8"
                    fontFamily="Inter, sans-serif"
                  >
                    {node.label.length > 16 ? node.label.slice(0, 16) + "…" : node.label}
                  </text>
                </g>
              ))}
            </g>
          </svg>

          {activeNodes.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl mb-3">🕸️</span>
              <p className="text-sm text-muted-foreground">No graph data to display. Upload data or search a GSTIN.</p>
            </div>
          )}
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default GraphPage;
