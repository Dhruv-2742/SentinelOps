/**
 * API client communicating with FastAPI backend.
 * Provides fallback mock data if backend server is still initializing.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export async function fetchFromAPI(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== "undefined" ? localStorage.getItem("sentinel_token") : null;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });
    if (!res.ok) {
      throw new Error(`API error ${res.status}: ${res.statusText}`);
    }
    return await res.json();
  } catch (err) {
    console.warn(`Fetch to ${endpoint} failed, checking demo fallback...`, err);
    throw err;
  }
}

export const api = {
  // Dashboards
  getOverview: (hours = 1) => fetchFromAPI(`/dashboards/overview?hours=${hours}`),

  // Telemetry
  getMetrics: (name?: string, hours = 1) =>
    fetchFromAPI(`/telemetry/metrics?hours=${hours}${name ? `&name=${encodeURIComponent(name)}` : ""}`),
  getHealth: (hours = 1) => fetchFromAPI(`/telemetry/health?hours=${hours}`),
  getServices: () => fetchFromAPI(`/telemetry/services`),
  getServiceDistribution: () => fetchFromAPI(`/telemetry/services/distribution`),

  // AIOps
  getAnomalies: (hours = 24) => fetchFromAPI(`/aiops/anomalies?hours=${hours}`),
  getRCA: (hours = 6) => fetchFromAPI(`/aiops/rca?hours=${hours}`),
  getPredictions: () => fetchFromAPI(`/aiops/predictions`),
  getRecommendations: () => fetchFromAPI(`/aiops/recommendations`),

  // Incidents
  getIncidents: (status?: string) => fetchFromAPI(`/incidents${status ? `?status=${status}` : ""}`),
  updateIncidentStatus: (id: string, status: string) =>
    fetchFromAPI(`/incidents/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  // Alerts
  getAlerts: (acknowledged?: boolean) =>
    fetchFromAPI(`/alerts${acknowledged !== undefined ? `?acknowledged=${acknowledged}` : ""}`),
  acknowledgeAlert: (alertId: string) =>
    fetchFromAPI(`/alerts/${alertId}/acknowledge`, { method: "POST" }),
  getAlertRules: () => fetchFromAPI(`/alerts/rules`),

  // Collectors
  getCollectors: () => fetchFromAPI(`/collectors`),
  enrollCollector: (data: { name: string; environment?: string }) =>
    fetchFromAPI(`/collectors/enroll`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Governance
  getAuditLog: () => fetchFromAPI(`/governance/audit`),
  getPrivacyStats: () => fetchFromAPI(`/governance/privacy-stats`),

  // Auth
  login: (credentials: { email: string; password: string }) =>
    fetchFromAPI(`/auth/login`, {
      method: "POST",
      body: JSON.stringify(credentials),
    }),
  register: (data: any) =>
    fetchFromAPI(`/auth/register`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getMe: () => fetchFromAPI(`/auth/me`),
};
