import Link from "next/link";
import { ShieldCheck, ArrowRight, Server, Lock, Cloud, Terminal } from "lucide-react";

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white">
      <nav className="h-20 border-b border-[#1a2236] px-8 max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <img
            src="/logo-banner.png"
            alt="SentinelOps Logo"
            className="h-10 w-auto object-contain drop-shadow-[0_0_15px_rgba(139,92,246,0.3)]"
          />
        </Link>
        <div className="flex items-center gap-6 text-sm text-gray-400">
          <Link href="/features" className="hover:text-white">Features</Link>
          <Link href="/how-it-works" className="text-cyan-400 font-medium">How It Works</Link>
          <Link href="/privacy" className="hover:text-white">Privacy</Link>
          <Link href="/dashboard" className="px-3 py-1.5 rounded-lg bg-[#00d2ff] text-black font-semibold text-xs">
            Open Dashboard
          </Link>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-8 py-20">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl font-bold tracking-tight text-white">How SentinelOps Works</h1>
          <p className="mt-4 text-gray-400 leading-relaxed">
            The complete 4-step workflow that decouples deep telemetry gathering from cloud data sharing.
          </p>
        </div>

        <div className="space-y-8">
          <div className="flex gap-6 p-8 rounded-xl bg-[#0f1629] border border-[#1a2236]">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-lg shrink-0">
              1
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Local Telemetry Scraping (Tier 1)</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                The SentinelOps local collector runs as a lightweight Docker container or Python service inside your VPC.
                Every 5 seconds, it gathers CPU, memory, disk, network, and application health telemetry using psutil.
                Raw metrics are committed locally to an encrypted SQLite database.
              </p>
            </div>
          </div>

          <div className="flex gap-6 p-8 rounded-xl bg-[#0f1629] border border-[#1a2236]">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-lg shrink-0">
              2
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Privacy Engine & Fail-Closed Sanitization</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Telemetry streams are passed to the Privacy Engine. Multi-pattern regex scrubbers strip emails, tokens,
                API keys, and IPs. An allowlist validator constructs new objects; any unvetted field or raw log line is
                rejected and logged to a local audit trail.
              </p>
            </div>
          </div>

          <div className="flex gap-6 p-8 rounded-xl bg-[#0f1629] border border-[#1a2236]">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg shrink-0">
              3
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Cryptographic Signing & Secure Outbound HTTPS</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                The approved statistical summaries (p50/p95/p99) and health metrics are signed with HMAC-SHA256 using
                the organization's secret key. The collector transmits the payload to the SaaS endpoint over outbound HTTPS.
                No inbound firewall ports are ever opened.
              </p>
            </div>
          </div>

          <div className="flex gap-6 p-8 rounded-xl bg-[#0f1629] border border-[#1a2236]">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-lg shrink-0">
              4
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Cloud AIOps Intelligence & Fleet Dashboards (Tier 2)</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                The FastAPI backend validates the HMAC signature and schema (rejecting any unknown fields). The AIOps engine
                runs correlation RCA, detects cross-service incident cascades, and visualizes health in the Next.js dark-navy dashboard.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
