import Link from "next/link";
import {
  ShieldCheck,
  Lock,
  Brain,
  Server,
  Activity,
  ArrowRight,
  Terminal,
  CheckCircle,
  BarChart3,
  Cpu,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white">
      {/* Top Header */}
      <nav className="h-20 border-b border-[#1a2236] px-8 max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <img
            src="/logo-banner.png"
            alt="SentinelOps Logo"
            className="h-11 w-auto object-contain drop-shadow-[0_0_15px_rgba(139,92,246,0.35)]"
          />
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm text-gray-400">
          <Link href="/features" className="hover:text-cyan-400 transition-colors">Features</Link>
          <Link href="/how-it-works" className="hover:text-cyan-400 transition-colors">How It Works</Link>
          <Link href="/privacy" className="hover:text-cyan-400 transition-colors">Privacy Architecture</Link>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/dashboard"
            className="px-4 py-2 rounded-lg bg-[#00d2ff] text-black font-semibold text-sm hover:bg-[#38e1ff] transition-all shadow-lg shadow-cyan-500/20"
          >
            Live Demo
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-24 px-8 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#00d2ff]/10 border border-[#00d2ff]/20 text-[#00d2ff] text-xs font-mono mb-6">
          <Lock className="w-3.5 h-3.5" />
          <span>GDPR, HIPAA & SOC 2 COMPLIANT BY ARCHITECTURE</span>
        </div>

        <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-white leading-tight">
          Observe Locally. <br />
          <span className="bg-gradient-to-r from-[#00d2ff] via-[#60a5fa] to-[#3b82f6] bg-clip-text text-transparent">
            Understand Globally.
          </span>
        </h1>

        <p className="mt-6 text-lg text-gray-400 max-w-3xl mx-auto leading-relaxed">
          The two-tier AIOps observability platform where raw telemetry, application logs, database queries,
          and sensitive customer tokens <strong>never leave your perimeter</strong>. Export only cryptographically verified
          summaries, ML anomaly signals, and health indicators.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-[#00d2ff] text-black font-semibold text-sm hover:bg-[#38e1ff] transition-all shadow-lg shadow-cyan-500/25"
          >
            <span>Launch Live Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/privacy"
            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-[#141c30] border border-[#222e4c] text-gray-300 font-medium text-sm hover:bg-[#1a2540] transition-colors"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Verify Privacy Contract</span>
          </Link>
        </div>

        {/* Live Architecture Graphic Preview */}
        <div className="mt-16 p-1 rounded-2xl bg-gradient-to-b from-[#1e293b] to-transparent border border-[#1e293b] shadow-2xl">
          <div className="bg-[#0a0e1a] rounded-xl p-6 text-left">
            <div className="flex items-center justify-between pb-4 border-b border-[#1a2236] mb-6">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80"></span>
                <span className="w-3 h-3 rounded-full bg-amber-500/80"></span>
                <span className="w-3 h-3 rounded-full bg-emerald-500/80"></span>
                <span className="ml-2 text-xs font-mono text-gray-400">sentinel-collector status --audit</span>
              </div>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                POLICY: FAIL-CLOSED
              </span>
            </div>

            <div className="grid md:grid-cols-2 gap-6 text-xs font-mono">
              <div className="bg-[#0f1629] p-4 rounded-lg border border-[#1a2236]">
                <p className="text-rose-400 font-bold mb-2 flex items-center gap-2">
                  <Lock className="w-4 h-4" /> TIER 1: STAYS INSIDE CUSTOMER ENVIRONMENT
                </p>
                <ul className="space-y-1.5 text-gray-400">
                  <li>✔ Raw OS Metrics (psutil 5s scrapes)</li>
                  <li>✔ Customer Application Logs & SQL Statements</li>
                  <li>✔ Passwords, Bearer Tokens, API Keys</li>
                  <li>✔ Internal IP Addresses & Email IDs (REDACTED)</li>
                  <li>✔ Raw Isolation Forest High-Dim Matrices</li>
                </ul>
              </div>

              <div className="bg-[#0f1629] p-4 rounded-lg border border-[#1a2236]">
                <p className="text-cyan-400 font-bold mb-2 flex items-center gap-2">
                  <Activity className="w-4 h-4" /> TIER 2: APPROVED SAAS EGRESS ONLY
                </p>
                <ul className="space-y-1.5 text-gray-400">
                  <li>✔ 60s Statistical Summaries (p50/p95/p99)</li>
                  <li>✔ Host Health Indicators (Percentages only)</li>
                  <li>✔ ML Anomaly Scores & Severity Signals</li>
                  <li>✔ Microservice Response Times</li>
                  <li>✔ HMAC-SHA256 Signed Metadata Payloads</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Value Pillars */}
      <section className="py-20 border-t border-[#1a2236] bg-[#0c101d] px-8">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
          <div className="bg-[#0f1629] p-8 rounded-xl border border-[#1a2236]">
            <div className="w-12 h-12 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-[#00d2ff] mb-6">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Fail-Closed Privacy Engine</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              If an export field is not explicitly on the allowlist schema, it is rejected.
              The collector constructs brand new objects rather than trusting redaction alone.
            </p>
          </div>

          <div className="bg-[#0f1629] p-8 rounded-xl border border-[#1a2236]">
            <div className="w-12 h-12 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-[#3b82f6] mb-6">
              <Brain className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Distributed AIOps Intelligence</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Local Isolation Forest detects anomalies on the host. Centralized SaaS runs correlation-based
              Root Cause Analysis (RCA) and trend exhaustion forecasting.
            </p>
          </div>

          <div className="bg-[#0f1629] p-8 rounded-xl border border-[#1a2236]">
            <div className="w-12 h-12 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-6">
              <Server className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Zero Inbound Ports</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Collectors run inside strict VPCs without exposing public ingress. Outbound metadata
              is transmitted over HTTPS with HMAC-SHA256 integrity verification.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-[#1a2236] px-8 text-center text-xs text-gray-400">
        <p>SentinelOps Observability Platform. Built with Next.js, FastAPI & Scikit-Learn.</p>
        <p className="mt-1">Observe Locally. Understand Globally. Copyright © 2026.</p>
      </footer>
    </div>
  );
}
