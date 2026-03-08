// ── Mock Data for GraphGST Dashboard ──

// ── KPI Stats ──
export const kpiStats = {
  itcClaimed: { value: "₹18.4L", trend: "+8.2%", count: 342 },
  itcAtRisk: { value: "₹2.1L", trend: "-3.1%", count: 12 },
  activeAnomalies: { value: "7", trend: "+2", count: 7 },
  highRiskVendors: { value: "4", trend: "0", count: 4 },
};

// ── Supply Chain Graph ──
export interface GraphNode {
  id: string;
  label: string;
  type: "Taxpayer" | "Invoice" | "GSTR1" | "GSTR2B" | "GSTR3B" | "TaxPayment" | "HighRisk";
  x?: number;
  y?: number;
  gstin?: string;
}

export interface GraphEdge {
  source: string;
  target: string;
  label?: string;
  alert?: boolean;
}

export const supplyChainNodes: GraphNode[] = [
  { id: "n1", label: "Your Company", type: "Taxpayer", gstin: "27AADCB2230M1ZT" },
  { id: "n2", label: "Vendor A", type: "Taxpayer", gstin: "29GGGGG1314R9Z6" },
  { id: "n3", label: "Vendor B", type: "Taxpayer", gstin: "07AAAAA0000A1Z5" },
  { id: "n4", label: "Vendor C", type: "HighRisk", gstin: "33BBBBB1234C1Z8" },
  { id: "n5", label: "Invoice #992", type: "Invoice" },
  { id: "n6", label: "e-Way Bill", type: "GSTR1" },
];

export const supplyChainEdges: GraphEdge[] = [
  { source: "n2", target: "n1", label: "supplies" },
  { source: "n3", target: "n1", label: "supplies" },
  { source: "n4", target: "n1", label: "supplies", alert: true },
  { source: "n5", target: "n4", label: "linked", alert: true },
  { source: "n6", target: "n4", label: "linked", alert: true },
];

// ── Monthly Reconciliation Bar Chart ──
export const monthlyReconciliation = [
  { month: "Jul", valid: 85, warning: 12, highRisk: 3, pending: 8 },
  { month: "Aug", valid: 92, warning: 8, highRisk: 5, pending: 6 },
  { month: "Sep", valid: 78, warning: 15, highRisk: 7, pending: 10 },
  { month: "Oct", valid: 95, warning: 6, highRisk: 2, pending: 4 },
  { month: "Nov", valid: 88, warning: 10, highRisk: 4, pending: 7 },
  { month: "Dec", valid: 102, warning: 9, highRisk: 1, pending: 3 },
  { month: "Jan", valid: 97, warning: 7, highRisk: 3, pending: 5 },
];

// ── Pie Chart Data ──
export const nodeDistribution = [
  { name: "Taxpayers", value: 156 },
  { name: "Invoices", value: 892 },
  { name: "GSTR-1", value: 312 },
  { name: "GSTR-2B", value: 298 },
  { name: "GSTR-3B", value: 245 },
  { name: "Payments", value: 178 },
];

// ── Risk Profile ──
export interface RiskProfile {
  gstin: string;
  name: string;
  score: number;
  auditTrail: { message: string; passed: boolean }[];
}

export const riskProfiles: Record<string, RiskProfile> = {
  n1: {
    gstin: "27AADCB2230M1ZT",
    name: "Your Company",
    score: 92,
    auditTrail: [
      { message: "All GSTR-1 filed on time", passed: true },
      { message: "ITC claims match 2B data", passed: true },
      { message: "No circular trade patterns", passed: true },
    ],
  },
  n2: {
    gstin: "29GGGGG1314R9Z6",
    name: "Vendor A",
    score: 74,
    auditTrail: [
      { message: "GSTR-3B filed with 4-day delay", passed: false },
      { message: "Invoice values match", passed: true },
      { message: "No amendment anomalies", passed: true },
    ],
  },
  n4: {
    gstin: "33BBBBB1234C1Z8",
    name: "Vendor C",
    score: 32,
    auditTrail: [
      { message: "Multiple GSTR-1 filing delays", passed: false },
      { message: "₹4.2L ITC mismatch detected", passed: false },
      { message: "Linked to circular trade network", passed: false },
      { message: "e-Way bill discrepancy", passed: false },
    ],
  },
};

// ── Invoices ──
export type InvoiceStatus = "Valid" | "Warning" | "High-Risk" | "Pending";

export interface Invoice {
  id: string;
  date: string;
  sellerGstin: string;
  buyerGstin: string;
  value: number;
  status: InvoiceStatus;
  risk: InvoiceStatus;
  aiExplanation?: string;
  compliancePath?: { hop: string; status: "pass" | "fail" }[];
  linkedPayments?: { id: string; amount: number; date: string }[];
}

export const invoices: Invoice[] = [
  {
    id: "INV-2026-001",
    date: "2026-01-15",
    sellerGstin: "29GGGGG1314R9Z6",
    buyerGstin: "27AADCB2230M1ZT",
    value: 245000,
    status: "Valid",
    risk: "Valid",
    aiExplanation: "Invoice matches GSTR-1, GSTR-2B, and payment records. No anomalies detected.",
    compliancePath: [
      { hop: "GSTR-1 Filed", status: "pass" },
      { hop: "GSTR-2B Matched", status: "pass" },
      { hop: "Payment Verified", status: "pass" },
    ],
    linkedPayments: [{ id: "PAY-001", amount: 245000, date: "2026-01-20" }],
  },
  {
    id: "INV-2026-002",
    date: "2026-01-18",
    sellerGstin: "07AAAAA0000A1Z5",
    buyerGstin: "27AADCB2230M1ZT",
    value: 182500,
    status: "Valid",
    risk: "Valid",
    compliancePath: [
      { hop: "GSTR-1 Filed", status: "pass" },
      { hop: "GSTR-2B Matched", status: "pass" },
    ],
  },
  {
    id: "INV-2026-003",
    date: "2026-01-22",
    sellerGstin: "33BBBBB1234C1Z8",
    buyerGstin: "27AADCB2230M1ZT",
    value: 420000,
    status: "High-Risk",
    risk: "High-Risk",
    aiExplanation: "Seller GSTIN flagged for circular trade pattern. ITC value mismatch of ₹18,200 between GSTR-1 and GSTR-2B.",
    compliancePath: [
      { hop: "GSTR-1 Filed", status: "pass" },
      { hop: "GSTR-2B Matched", status: "fail" },
      { hop: "Circular Trade Check", status: "fail" },
    ],
  },
  {
    id: "INV-2026-004",
    date: "2026-02-01",
    sellerGstin: "24CCCCC5678D1Z2",
    buyerGstin: "27AADCB2230M1ZT",
    value: 95000,
    status: "Warning",
    risk: "Warning",
    aiExplanation: "Filing delay of 12 days detected for seller's GSTR-1. Monitor for resolution.",
    compliancePath: [
      { hop: "GSTR-1 Filed", status: "pass" },
      { hop: "Filing Timeliness", status: "fail" },
    ],
  },
  {
    id: "INV-2026-005",
    date: "2026-02-03",
    sellerGstin: "19DDDDD9012E1Z4",
    buyerGstin: "27AADCB2230M1ZT",
    value: 310000,
    status: "Valid",
    risk: "Valid",
    compliancePath: [
      { hop: "GSTR-1 Filed", status: "pass" },
      { hop: "GSTR-2B Matched", status: "pass" },
    ],
  },
  {
    id: "INV-2026-006",
    date: "2026-02-05",
    sellerGstin: "33BBBBB1234C1Z8",
    buyerGstin: "27AADCB2230M1ZT",
    value: 178000,
    status: "High-Risk",
    risk: "High-Risk",
    aiExplanation: "Repeated high-risk transactions from flagged vendor. Amendment rate exceeds 40%.",
    compliancePath: [
      { hop: "GSTR-1 Filed", status: "fail" },
      { hop: "Amendment Check", status: "fail" },
    ],
  },
  {
    id: "INV-2026-007",
    date: "2026-02-08",
    sellerGstin: "06EEEEE3456F1Z6",
    buyerGstin: "27AADCB2230M1ZT",
    value: 52000,
    status: "Pending",
    risk: "Pending",
    aiExplanation: "Awaiting GSTR-2B reconciliation for this period.",
  },
  {
    id: "INV-2026-008",
    date: "2026-02-10",
    sellerGstin: "29GGGGG1314R9Z6",
    buyerGstin: "27AADCB2230M1ZT",
    value: 415000,
    status: "Valid",
    risk: "Valid",
    compliancePath: [
      { hop: "GSTR-1 Filed", status: "pass" },
      { hop: "GSTR-2B Matched", status: "pass" },
      { hop: "Payment Verified", status: "pass" },
    ],
    linkedPayments: [{ id: "PAY-008", amount: 415000, date: "2026-02-15" }],
  },
  {
    id: "INV-2026-009",
    date: "2026-02-12",
    sellerGstin: "21FFFFF7890G1Z9",
    buyerGstin: "27AADCB2230M1ZT",
    value: 88000,
    status: "Warning",
    risk: "Warning",
    aiExplanation: "Minor value discrepancy of ₹2,100 between purchase register and GSTR-2B.",
  },
  {
    id: "INV-2026-010",
    date: "2026-02-14",
    sellerGstin: "07AAAAA0000A1Z5",
    buyerGstin: "27AADCB2230M1ZT",
    value: 267000,
    status: "Valid",
    risk: "Valid",
    compliancePath: [
      { hop: "GSTR-1 Filed", status: "pass" },
      { hop: "GSTR-2B Matched", status: "pass" },
    ],
  },
  {
    id: "INV-2026-011",
    date: "2026-02-18",
    sellerGstin: "24CCCCC5678D1Z2",
    buyerGstin: "27AADCB2230M1ZT",
    value: 134000,
    status: "Pending",
    risk: "Pending",
  },
  {
    id: "INV-2026-012",
    date: "2026-02-20",
    sellerGstin: "33BBBBB1234C1Z8",
    buyerGstin: "27AADCB2230M1ZT",
    value: 562000,
    status: "High-Risk",
    risk: "High-Risk",
    aiExplanation: "Vendor suspended by GST portal. All pending ITC claims at risk of disallowance.",
    compliancePath: [
      { hop: "Vendor Status Check", status: "fail" },
      { hop: "GSTR-1 Filed", status: "fail" },
    ],
  },
];

// ── Vendors ──
export interface Vendor {
  gstin: string;
  legalName: string;
  state: string;
  registrationStatus: "Active" | "Suspended" | "Cancelled";
  complianceScore: number;
  risk: InvoiceStatus;
  invoiceCount: number;
  highRiskCount: number;
  filingHistory: {
    period: string;
    gstr1Filed: boolean;
    gstr3bFiled: boolean;
    delayDays: number;
  }[];
  patternFlags: string[];
  scoreBreakdown: {
    filingConsistency: number;
    avgDelayDays: number;
    amendmentRate: number;
    valueMismatchRate: number;
  };
}

export const vendors: Vendor[] = [
  {
    gstin: "29GGGGG1314R9Z6",
    legalName: "Vendor A Enterprises Pvt Ltd",
    state: "Karnataka",
    registrationStatus: "Active",
    complianceScore: 82,
    risk: "Valid",
    invoiceCount: 45,
    highRiskCount: 0,
    filingHistory: [
      { period: "Jan 2026", gstr1Filed: true, gstr3bFiled: true, delayDays: 0 },
      { period: "Dec 2025", gstr1Filed: true, gstr3bFiled: true, delayDays: 1 },
      { period: "Nov 2025", gstr1Filed: true, gstr3bFiled: true, delayDays: 0 },
      { period: "Oct 2025", gstr1Filed: true, gstr3bFiled: true, delayDays: 2 },
      { period: "Sep 2025", gstr1Filed: true, gstr3bFiled: true, delayDays: 0 },
      { period: "Aug 2025", gstr1Filed: true, gstr3bFiled: false, delayDays: 4 },
    ],
    patternFlags: [],
    scoreBreakdown: { filingConsistency: 92, avgDelayDays: 1.2, amendmentRate: 3, valueMismatchRate: 1.5 },
  },
  {
    gstin: "07AAAAA0000A1Z5",
    legalName: "Vendor B Trading Co",
    state: "Delhi",
    registrationStatus: "Active",
    complianceScore: 76,
    risk: "Valid",
    invoiceCount: 32,
    highRiskCount: 0,
    filingHistory: [
      { period: "Jan 2026", gstr1Filed: true, gstr3bFiled: true, delayDays: 3 },
      { period: "Dec 2025", gstr1Filed: true, gstr3bFiled: true, delayDays: 5 },
      { period: "Nov 2025", gstr1Filed: true, gstr3bFiled: true, delayDays: 2 },
      { period: "Oct 2025", gstr1Filed: false, gstr3bFiled: true, delayDays: 8 },
    ],
    patternFlags: [],
    scoreBreakdown: { filingConsistency: 78, avgDelayDays: 4.5, amendmentRate: 6, valueMismatchRate: 3.2 },
  },
  {
    gstin: "33BBBBB1234C1Z8",
    legalName: "Vendor C Industries",
    state: "Tamil Nadu",
    registrationStatus: "Suspended",
    complianceScore: 28,
    risk: "High-Risk",
    invoiceCount: 18,
    highRiskCount: 12,
    filingHistory: [
      { period: "Jan 2026", gstr1Filed: false, gstr3bFiled: false, delayDays: 45 },
      { period: "Dec 2025", gstr1Filed: true, gstr3bFiled: false, delayDays: 32 },
      { period: "Nov 2025", gstr1Filed: false, gstr3bFiled: false, delayDays: 60 },
      { period: "Oct 2025", gstr1Filed: true, gstr3bFiled: true, delayDays: 18 },
    ],
    patternFlags: ["CIRCULAR_TRADE", "SHELL_ENTITY_RISK", "FILING_GAPS"],
    scoreBreakdown: { filingConsistency: 35, avgDelayDays: 38.8, amendmentRate: 42, valueMismatchRate: 28.5 },
  },
  {
    gstin: "24CCCCC5678D1Z2",
    legalName: "Vendor D Solutions LLP",
    state: "Gujarat",
    registrationStatus: "Active",
    complianceScore: 61,
    risk: "Warning",
    invoiceCount: 22,
    highRiskCount: 2,
    filingHistory: [
      { period: "Jan 2026", gstr1Filed: true, gstr3bFiled: true, delayDays: 12 },
      { period: "Dec 2025", gstr1Filed: true, gstr3bFiled: true, delayDays: 8 },
      { period: "Nov 2025", gstr1Filed: false, gstr3bFiled: true, delayDays: 15 },
    ],
    patternFlags: ["LATE_FILER"],
    scoreBreakdown: { filingConsistency: 65, avgDelayDays: 11.7, amendmentRate: 15, valueMismatchRate: 8.4 },
  },
  {
    gstin: "19DDDDD9012E1Z4",
    legalName: "Vendor E Exports",
    state: "West Bengal",
    registrationStatus: "Active",
    complianceScore: 89,
    risk: "Valid",
    invoiceCount: 56,
    highRiskCount: 0,
    filingHistory: [
      { period: "Jan 2026", gstr1Filed: true, gstr3bFiled: true, delayDays: 0 },
      { period: "Dec 2025", gstr1Filed: true, gstr3bFiled: true, delayDays: 0 },
      { period: "Nov 2025", gstr1Filed: true, gstr3bFiled: true, delayDays: 1 },
    ],
    patternFlags: [],
    scoreBreakdown: { filingConsistency: 96, avgDelayDays: 0.3, amendmentRate: 1, valueMismatchRate: 0.5 },
  },
  {
    gstin: "06EEEEE3456F1Z6",
    legalName: "Vendor F Pharma Ltd",
    state: "Haryana",
    registrationStatus: "Active",
    complianceScore: 71,
    risk: "Warning",
    invoiceCount: 14,
    highRiskCount: 1,
    filingHistory: [
      { period: "Jan 2026", gstr1Filed: true, gstr3bFiled: true, delayDays: 6 },
      { period: "Dec 2025", gstr1Filed: true, gstr3bFiled: false, delayDays: 10 },
    ],
    patternFlags: ["INCONSISTENT_FILINGS"],
    scoreBreakdown: { filingConsistency: 70, avgDelayDays: 8, amendmentRate: 9, valueMismatchRate: 5.2 },
  },
  {
    gstin: "21FFFFF7890G1Z9",
    legalName: "Vendor G Textiles",
    state: "Odisha",
    registrationStatus: "Active",
    complianceScore: 68,
    risk: "Warning",
    invoiceCount: 9,
    highRiskCount: 1,
    filingHistory: [
      { period: "Jan 2026", gstr1Filed: true, gstr3bFiled: true, delayDays: 5 },
      { period: "Dec 2025", gstr1Filed: true, gstr3bFiled: true, delayDays: 7 },
    ],
    patternFlags: [],
    scoreBreakdown: { filingConsistency: 72, avgDelayDays: 6, amendmentRate: 7, valueMismatchRate: 4.8 },
  },
];

// ── Full Graph Nodes/Edges ──
export const fullGraphNodes: GraphNode[] = [
  { id: "g1", label: "27AADCB2230M1ZT", type: "Taxpayer" },
  { id: "g2", label: "29GGGGG1314R9Z6", type: "Taxpayer" },
  { id: "g3", label: "07AAAAA0000A1Z5", type: "Taxpayer" },
  { id: "g4", label: "33BBBBB1234C1Z8", type: "HighRisk" },
  { id: "g5", label: "24CCCCC5678D1Z2", type: "Taxpayer" },
  { id: "g6", label: "19DDDDD9012E1Z4", type: "Taxpayer" },
  { id: "g7", label: "INV-2026-001", type: "Invoice" },
  { id: "g8", label: "INV-2026-003", type: "Invoice" },
  { id: "g9", label: "INV-2026-004", type: "Invoice" },
  { id: "g10", label: "GSTR1-Jan26", type: "GSTR1" },
  { id: "g11", label: "GSTR1-Feb26", type: "GSTR1" },
  { id: "g12", label: "GSTR2B-Jan26", type: "GSTR2B" },
  { id: "g13", label: "GSTR2B-Feb26", type: "GSTR2B" },
  { id: "g14", label: "GSTR3B-Jan26", type: "GSTR3B" },
  { id: "g15", label: "PAY-001", type: "TaxPayment" },
  { id: "g16", label: "PAY-008", type: "TaxPayment" },
  { id: "g17", label: "06EEEEE3456F1Z6", type: "Taxpayer" },
  { id: "g18", label: "21FFFFF7890G1Z9", type: "Taxpayer" },
];

export const fullGraphEdges: GraphEdge[] = [
  { source: "g2", target: "g7" },
  { source: "g7", target: "g1" },
  { source: "g4", target: "g8", alert: true },
  { source: "g8", target: "g1", alert: true },
  { source: "g5", target: "g9" },
  { source: "g9", target: "g1" },
  { source: "g3", target: "g1" },
  { source: "g6", target: "g1" },
  { source: "g17", target: "g1" },
  { source: "g18", target: "g1" },
  { source: "g1", target: "g10" },
  { source: "g1", target: "g11" },
  { source: "g1", target: "g12" },
  { source: "g1", target: "g13" },
  { source: "g1", target: "g14" },
  { source: "g7", target: "g15" },
  { source: "g2", target: "g16" },
  { source: "g4", target: "g4", alert: true, label: "circular" },
];

// ── Patterns ──
export interface CircularTrade {
  cycleId: string;
  gstins: string[];
  period: string;
  risk: InvoiceStatus;
}

export const circularTrades: CircularTrade[] = [
  { cycleId: "CYC-001", gstins: ["33BBBBB1234C1Z8", "24CCCCC5678D1Z2", "33BBBBB1234C1Z8"], period: "Jan 2026", risk: "High-Risk" },
  { cycleId: "CYC-002", gstins: ["06EEEEE3456F1Z6", "21FFFFF7890G1Z9", "33BBBBB1234C1Z8", "06EEEEE3456F1Z6"], period: "Dec 2025", risk: "High-Risk" },
];

export interface PaymentDelay {
  gstin: string;
  avgDelay: number;
  maxDelay: number;
  invoiceCount: number;
}

export const paymentDelays: PaymentDelay[] = [
  { gstin: "33BBBBB1234C1Z8", avgDelay: 38.8, maxDelay: 60, invoiceCount: 18 },
  { gstin: "24CCCCC5678D1Z2", avgDelay: 11.7, maxDelay: 15, invoiceCount: 22 },
  { gstin: "06EEEEE3456F1Z6", avgDelay: 8, maxDelay: 10, invoiceCount: 14 },
  { gstin: "21FFFFF7890G1Z9", avgDelay: 6, maxDelay: 7, invoiceCount: 9 },
];

export interface Amendment {
  gstin: string;
  amendmentChains: number;
  maxChainDepth: number;
}

export const amendments: Amendment[] = [
  { gstin: "33BBBBB1234C1Z8", amendmentChains: 8, maxChainDepth: 4 },
  { gstin: "24CCCCC5678D1Z2", amendmentChains: 3, maxChainDepth: 2 },
  { gstin: "06EEEEE3456F1Z6", amendmentChains: 2, maxChainDepth: 2 },
];

export interface RiskNetwork {
  gstin: string;
  totalPartners: number;
  riskyPartners: number;
  riskyRatio: number;
}

export const riskNetworks: RiskNetwork[] = [
  { gstin: "33BBBBB1234C1Z8", totalPartners: 12, riskyPartners: 8, riskyRatio: 0.67 },
  { gstin: "24CCCCC5678D1Z2", totalPartners: 9, riskyPartners: 3, riskyRatio: 0.33 },
  { gstin: "06EEEEE3456F1Z6", totalPartners: 7, riskyPartners: 2, riskyRatio: 0.29 },
  { gstin: "21FFFFF7890G1Z9", totalPartners: 5, riskyPartners: 1, riskyRatio: 0.2 },
];
