import Link from "next/link";
import { ShieldCheck, Lock, CheckCircle2, XCircle, FileCode2 } from "lucide-react";

export default function PrivacyArchitecturePage() {
  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white">
      <nav className="h-20 border-b border-[#1a2236] px-8 max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00d2ff] to-[#3b82f6] flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-black" />
          </div>
          <span className="font-bold text-lg text-white">Sentinel<span className="text-[#00d2ff]">Ops</span></span>
        </Link>
        <div className="flex items-center gap-6 text-sm text-gray-400">
          <Link href="/features" className="hover:text-white">Features</Link>
          <Link href="/how-it-works" className="hover:text-white">How It Works</Link>
          <Link href="/privacy" className="text-cyan-400 font-medium">Privacy Architecture</Link>
          <Link href="/dashboard" className="px-3 py-1.5 rounded-lg bg-[#00d2ff] text-black font-semibold text-xs">
            Open Dashboard
          </Link>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-8 py-20">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono mb-4">
            <Lock className="w-3.5 h-3.5" />
            <span>SECURITY SPECIFICATION v1.0</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white">Privacy Architecture & Data Contract</h1>
          <p className="mt-4 text-gray-400 leading-relaxed">
            A formal breakdown of what data remains physically quarantined inside the customer host versus what metadata is approved for SaaS egress.
          </p>
        </div>

        {/* Boundary Table */}
        <div className="rounded-xl border border-[#1a2236] overflow-hidden bg-[#0f1629] mb-12">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#141d33] border-b border-[#1a2236] text-gray-400">
              <tr>
                <th className="py-4 px-6 uppercase tracking-wider">Data Category</th>
                <th className="py-4 px-6 uppercase tracking-wider text-rose-400">Stays Inside Customer Perimeter (Tier 1)</th>
                <th className="py-4 px-6 uppercase tracking-wider text-cyan-400">Approved for SaaS Egress (Tier 2)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a2236]">
              <tr>
                <td className="py-4 px-6 font-bold text-white">System Metrics</td>
                <td className="py-4 px-6 text-gray-400">Raw 5s readings, exact byte counters, raw kernel ticks</td>
                <td className="py-4 px-6 text-emerald-400">60s statistical summaries (min, max, mean, p50, p95, p99)</td>
              </tr>
              <tr>
                <td className="py-4 px-6 font-bold text-white">Application Logs</td>
                <td className="py-4 px-6 text-gray-400">Raw log strings, stack traces, unparsed error messages</td>
                <td className="py-4 px-6 text-emerald-400">Normalized pattern counts and anomaly frequency only</td>
              </tr>
              <tr>
                <td className="py-4 px-6 font-bold text-white">Sensitive Credentials</td>
                <td className="py-4 px-6 text-gray-400">Tokens, JWTs, DB passwords, API keys, Bearer auth</td>
                <td className="py-4 px-6 text-rose-400 font-bold">STRICTLY FORBIDDEN (Filtered & Redacted)</td>
              </tr>
              <tr>
                <td className="py-4 px-6 font-bold text-white">User PII</td>
                <td className="py-4 px-6 text-gray-400">Customer emails, IP addresses, SSNs, credit cards</td>
                <td className="py-4 px-6 text-rose-400 font-bold">STRICTLY FORBIDDEN (Filtered & Redacted)</td>
              </tr>
              <tr>
                <td className="py-4 px-6 font-bold text-white">AIOps / ML</td>
                <td className="py-4 px-6 text-gray-400">Isolation Forest decision matrices, raw weights</td>
                <td className="py-4 px-6 text-emerald-400">Anomaly alert payload (score, metric name, bounds)</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Pydantic Schema Proof */}
        <div className="p-6 rounded-xl bg-[#0c1222] border border-[#1a2236]">
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-3">
            <FileCode2 className="w-4 h-4" />
            <span>Pydantic Fail-Closed Contract (shared/schemas.py)</span>
          </div>
          <pre className="text-xs font-mono text-gray-300 overflow-x-auto p-4 rounded bg-[#060913]">
{`class MetricSummary(BaseModel):
    model_config = ConfigDict(extra="forbid")  # REJECTS ANY UNAPPROVED FIELD

    collector_id: str
    metric_name: str
    timestamp: datetime
    window_seconds: int = 60
    count: int
    min_val: float
    max_val: float
    mean_val: float
    p50: float
    p95: float
    p99: float
    unit: str = ""
    labels: dict[str, str] = Field(default_factory=dict)`}
          </pre>
        </div>
      </main>
    </div>
  );
}
