/**
 * api.ts — Centralised API client for the GST Reconciliation backend.
 *
 * Base URL:  http://localhost:8000  (configurable via VITE_API_URL env var)
 * Auth:      Bearer token stored in localStorage under "gst_token"
 *
 * Usage:
 *   import { api } from "@/lib/api";
 *   const invoices = await api.invoices.list({ page: 1, per_page: 50 });
 */

// ── Config ──────────────────────────────────────────────────────────────────
export const BASE_URL: string =
  (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:8000";

const TOKEN_KEY = "gst_token";

// ── Token helpers ────────────────────────────────────────────────────────────
export const tokenStore = {
  get: (): string | null => localStorage.getItem(TOKEN_KEY),
  set: (token: string): void => localStorage.setItem(TOKEN_KEY, token),
  clear: (): void => localStorage.removeItem(TOKEN_KEY),
};

// ── Fetch wrapper ─────────────────────────────────────────────────────────────
async function request<T>(
  path: string,
  options: RequestInit & { params?: Record<string, string | number | boolean | null | undefined> } = {}
): Promise<T> {
  const { params, ...init } = options;

  // Build URL with query params
  const url = new URL(`${BASE_URL}${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== null && v !== undefined) url.searchParams.set(k, String(v));
    });
  }

  // Attach auth header if token is present
  const token = tokenStore.get();
  const headers: Record<string, string> = {
    ...(init.headers as Record<string, string> | undefined),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  // Only set Content-Type to JSON when not sending FormData
  if (!(init.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(url.toString(), { ...init, headers });

  if (!response.ok) {
    let detail = `HTTP ${response.status}`;
    try {
      const json = await response.json();
      detail = json.detail ?? JSON.stringify(json);
    } catch {
      detail = await response.text().catch(() => detail);
    }
    throw new ApiError(response.status, detail);
  }

  // Handle 204 No Content
  if (response.status === 204) return undefined as T;

  return response.json() as Promise<T>;
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly detail: string
  ) {
    super(`API Error ${status}: ${detail}`);
    this.name = "ApiError";
  }
}

// ── Type definitions ────────────────────────────────────────────────────────

export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

// Invoices
export type InvoiceStatus = "Valid" | "Warning" | "High-Risk" | "Pending";
export type RiskLevel = "Low" | "Medium" | "High";

export interface InvoiceListItem {
  invoice_id: string;
  invoice_number: string;
  invoice_date: string;
  supplier_gstin: string;
  buyer_gstin: string;
  total_value: number;
  status: InvoiceStatus;
  risk_level: RiskLevel | null;
  explanation: string | null;
}

export interface PaginatedInvoices {
  total: number;
  page: number;
  per_page: number;
  items: InvoiceListItem[];
}

export interface PathHop {
  hop: string;
  present: boolean;
  detail: string | null;
}

export interface TaxPaymentResponse {
  payment_id: string;
  amount_paid: number;
  payment_date: string;
  payment_mode: string | null;
}

export interface InvoiceResponse {
  invoice_id: string;
  invoice_number: string;
  invoice_date: string;
  supplier_gstin: string;
  buyer_gstin: string;
  total_value: number;
  status: InvoiceStatus;
  risk_level: RiskLevel | null;
  explanation: string | null;
}

export interface ValueComparison {
  gstr1_taxable_value: number | null;
  pr_taxable_value: number | null;
  authoritative_value: number | null;
  difference: number | null;
  difference_pct: number | null;
  within_tolerance: boolean | null;
}

export interface InvoiceDetail {
  invoice: InvoiceResponse;
  value_comparison: ValueComparison | null;
  path_hops: PathHop[];
  payments: TaxPaymentResponse[];
  gstr1: unknown | null;
  gstr2b: unknown | null;
  gstr3b: unknown | null;
  amends: string | null;
  amended_by: string | null;
}

// Vendors
export interface VendorListItem {
  gstin: string;
  state_code: string | null;
  registration_status: string | null;
  compliance_score: number | null;
  risk_level: RiskLevel | null;
  total_invoices: number | null;
  high_risk_count: number | null;
}

export interface ScoreBreakdown {
  filing_consistency: number | null;
  avg_payment_delay_days: number | null;
  amendment_rate: number | null;
  value_mismatch_rate: number | null;
  risky_partner_ratio: number | null;
  circular_flag: boolean;
}

export interface FilingRecord {
  tax_period: string;
  gstr1_filed: boolean;
  gstr3b_filed: boolean;
  payment_delay_days: number | null;
}

export interface TaxpayerResponse {
  gstin: string;
  pan: string | null;
  state_code: string;
  country_code: string;
  registration_status: string | null;
  filing_frequency: string | null;
  risk_score: number | null;
  risk_level: RiskLevel | null;
}

export interface VendorProfile {
  taxpayer: TaxpayerResponse;
  compliance_score: number | null;
  score_breakdown: ScoreBreakdown | null;
  filing_history: FilingRecord[];
  invoices: InvoiceListItem[];
  pattern_flags: string[];
}

export interface PaginatedVendors {
  total: number;
  page: number;
  per_page: number;
  items: VendorListItem[];
}

// Patterns
export interface CircularTradeResult {
  cycle_id: string;
  gstins: string[];
  invoice_ids: string[];
  period: string | null;
  risk_level: RiskLevel;
}

export interface PaymentDelayResult {
  gstin: string;
  avg_delay_days: number;
  max_delay_days: number;
  affected_invoice_count: number;
  risk_level: RiskLevel;
}

export interface AmendmentChainResult {
  gstin: string;
  amendment_chains: number;
  max_chain_depth: number;
  risk_level: RiskLevel;
}

export interface RiskNetworkResult {
  gstin: string;
  total_partners: number;
  risky_partners: number;
  risky_partner_ratio: number;
  risk_level: RiskLevel;
}

export interface PatternSummary {
  circular_trades: CircularTradeResult[];
  payment_delays: PaymentDelayResult[];
  amendment_chains: AmendmentChainResult[];
  risk_networks: RiskNetworkResult[];
  total_patterns: number;
}

// Reconciliation
export interface ReconciliationSummary {
  total: number;
  valid: number;
  warning: number;
  high_risk: number;
  pending: number;
  duration_ms: number | null;
  run_at: string | null;
}

// Graph
export interface GraphNode {
  id: string;
  label: string;
  properties: Record<string, unknown>;
  risk_level: RiskLevel | null;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  properties: Record<string, unknown>;
}

export interface GraphExport {
  nodes: GraphNode[];
  edges: GraphEdge[];
  node_count: number;
  edge_count: number;
}

export interface GraphStats {
  nodes: Record<string, number>;
  relationships: Record<string, number>;
  total_nodes: number;
  total_relationships: number;
}

// Upload
export interface UploadResult {
  file_name: string;
  loaded: number;
  skipped: number;
  errors: { row_index: number; errors: string[] }[];
  duration_ms: number | null;
}

// ── API namespace ────────────────────────────────────────────────────────────

export const api = {
  // ── Auth ──────────────────────────────────────────────────────────────────
  auth: {
    /** POST /auth/login — returns bearer token */
    login: (username: string, password: string): Promise<LoginResponse> =>
      request<LoginResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      }),

    /** GET /auth/me — returns current user (requires token) */
    me: (): Promise<{ username: string; role: string }> =>
      request("/auth/me"),
  },

  // ── Invoices ───────────────────────────────────────────────────────────────
  invoices: {
    /** GET /invoices/ — paginated list */
    list: (opts?: {
      page?: number;
      per_page?: number;
      gstin?: string | null;
      status?: string | null;
    }): Promise<PaginatedInvoices> =>
      request<PaginatedInvoices>("/invoices/", {
        params: {
          page: opts?.page ?? 1,
          per_page: opts?.per_page ?? 50,
          ...(opts?.gstin ? { gstin: opts.gstin } : {}),
          ...(opts?.status && opts.status !== "All" ? { status: opts.status } : {}),
        },
      }),

    /** GET /invoices/{id} — full detail */
    detail: (id: string): Promise<InvoiceDetail> =>
      request<InvoiceDetail>(`/invoices/${encodeURIComponent(id)}`),
  },

  // ── Vendors ────────────────────────────────────────────────────────────────
  vendors: {
    /** GET /vendors/ — paginated list */
    list: (opts?: { page?: number; limit?: number }): Promise<PaginatedVendors> =>
      request<PaginatedVendors>("/vendors/", {
        params: { page: opts?.page ?? 1, limit: opts?.limit ?? 50 },
      }),

    /** GET /vendors/{gstin} — full profile */
    profile: (gstin: string): Promise<VendorProfile> =>
      request<VendorProfile>(`/vendors/${encodeURIComponent(gstin)}`),

    /** POST /vendors/train — train ML models (requires token) */
    train: (): Promise<{ status: string; message?: string }> =>
      request("/vendors/train", { method: "POST" }),

    /** POST /vendors/score — score all vendors (requires token) */
    scoreAll: (): Promise<{ status: string; message?: string }> =>
      request("/vendors/score", { method: "POST" }),
  },

  // ── Upload ─────────────────────────────────────────────────────────────────
  upload: {
    _upload: (endpoint: string, file: File): Promise<UploadResult> => {
      const fd = new FormData();
      fd.append("file", file);
      return request<UploadResult>(endpoint, { method: "POST", body: fd });
    },
    taxpayers: (file: File) => api.upload._upload("/upload/taxpayers", file),
    invoices:  (file: File) => api.upload._upload("/upload/invoices",  file),
    gstr1:     (file: File) => api.upload._upload("/upload/gstr1",     file),
    gstr2b:    (file: File) => api.upload._upload("/upload/gstr2b",    file),
    gstr3b:    (file: File) => api.upload._upload("/upload/gstr3b",    file),
    payments:  (file: File) => api.upload._upload("/upload/tax-payments", file),
  },

  // ── Patterns ───────────────────────────────────────────────────────────────
  patterns: {
    /** GET /patterns/ — run all detectors */
    all: (): Promise<PatternSummary> =>
      request<PatternSummary>("/patterns/"),

    circularTrades: (): Promise<CircularTradeResult[]> =>
      request<CircularTradeResult[]>("/patterns/circular-trades"),

    paymentDelays: (minInvoices?: number): Promise<PaymentDelayResult[]> =>
      request<PaymentDelayResult[]>("/patterns/payment-delays", {
        params: minInvoices ? { min_invoices: minInvoices } : {},
      }),

    amendmentChains: (): Promise<AmendmentChainResult[]> =>
      request<AmendmentChainResult[]>("/patterns/amendment-chains"),

    riskNetworks: (): Promise<RiskNetworkResult[]> =>
      request<RiskNetworkResult[]>("/patterns/risk-networks"),
  },

  // ── Reconciliation ─────────────────────────────────────────────────────────
  reconcile: {
    /** GET /reconcile/stats — current status counts (no re-processing) */
    stats: (): Promise<ReconciliationSummary> =>
      request<ReconciliationSummary>("/reconcile/stats"),

    /** POST /reconcile/run — run batch reconciliation (requires token) */
    run: (opts?: { gstin?: string; tax_period?: string; limit?: number }): Promise<ReconciliationSummary> =>
      request<ReconciliationSummary>("/reconcile/run", {
        method: "POST",
        params: opts,
      }),

    /** POST /reconcile/invoice/{id} — reconcile a single invoice (requires token) */
    invoice: (id: string): Promise<ReconciliationSummary> =>
      request<ReconciliationSummary>(`/reconcile/invoice/${encodeURIComponent(id)}`, {
        method: "POST",
      }),
  },

  // ── Graph ──────────────────────────────────────────────────────────────────
  graph: {
    /** GET /graph/subgraph/{gstin}?depth=1|2 */
    subgraph: (gstin: string, depth?: 1 | 2): Promise<GraphExport> =>
      request<GraphExport>(`/graph/subgraph/${encodeURIComponent(gstin)}`, {
        params: depth ? { depth } : {},
      }),

    /** GET /graph/overview — full overview (sampled) */
    overview: (limit?: number): Promise<GraphExport> =>
      request<GraphExport>("/graph/overview", {
        params: limit ? { limit } : {},
      }),

    /** GET /graph/stats — node / edge counts */
    stats: (): Promise<GraphStats> =>
      request<GraphStats>("/graph/stats"),
  },

  // ── Health ─────────────────────────────────────────────────────────────────
  health: (): Promise<{ api: string; neo4j: string }> =>
    request("/health"),
};
