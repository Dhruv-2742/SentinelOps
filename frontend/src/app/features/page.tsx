import Link from "next/link";
import { ShieldCheck, Activity, Brain, Server, Lock, Cpu, BarChart3, Database } from "lucide-react";

export default function FeaturesPage() {
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
          <Link href="/features" className="text-cyan-400 font-medium">Features</Link>
          <Link href="/how-it-works" className="hover:text-white">How It Works</Link>
          <Link href="/privacy" className="hover:text-white">Privacy</Link>
          <Link href="/dashboard" className="px-3 py-1.5 rounded-lg bg-[#00d2ff] text-black font-semibold text-xs">
            Open Dashboard
          </Link>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-8 py-20">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl font-bold tracking-tight text-white">Enterprise Features</h1>
          <p className="mt-4 text-gray-400 leading-relaxed">
            Designed for regulated industries that demand cutting-edge AIOps without sacrificing customer data confidentiality.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="p-8 rounded-xl bg-[#0f1629] border border-[#1a2236]">
            <Lock className="w-8 h-8 text-cyan-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Fail-Closed Privacy Engine</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Every telemetry field must be explicitly declared on an allowlist schema. Any unexpected key, unvetted payload,
              or raw log message is dropped locally before serialization.
            </p>
          </div>

          <div className="p-8 rounded-xl bg-[#0f1629] border border-[#1a2236]">
            <Brain className="w-8 h-8 text-blue-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Correlation-based Root Cause Analysis</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Co-occurring anomalies in CPU, Memory, Disk, and Latency are evaluated by an automated RCA engine that
              distinguishes hypotheses from verified probable causes.
            </p>
          </div>

          <div className="p-8 rounded-xl bg-[#0f1629] border border-[#1a2236]">
            <Cpu className="w-8 h-8 text-emerald-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Edge Isolation Forest</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Outlier detection runs on the local collector using temporal feature engineering. Raw observation vectors
              stay local; only decision scores and severity signals cross the boundary.
            </p>
          </div>

          <div className="p-8 rounded-xl bg-[#0f1629] border border-[#1a2236]">
            <BarChart3 className="w-8 h-8 text-amber-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Capacity Trend Forecaster</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Linear trend velocity calculates exact time-to-exhaustion for storage and memory, warning teams before
              disk fill or out-of-memory outages occur.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
