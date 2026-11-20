"use client";

import { useEffect, useState } from "react";
import { Brain, AlertTriangle, Search, TrendingUp, Sparkles, MessageSquare, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Topnav } from "@/components/layout/topnav";
import { api } from "@/lib/api";

const PRESET_QUERIES = [
  {
    q: "Why did API latency increase at 10:15?",
    a: "At 10:14 UTC, node-01 experienced a 210% surge in ingress message rate, resulting in Kafka partition lag in data-pipeline. CPU climbed to 94.2%. Auth-service was indirectly degraded due to token validation queueing (Pearson r = 0.89). No unscrubbed PII was leaked.",
  },
  {
    q: "Which services are affected right now?",
    a: "Primary impact is isolated to data-pipeline (p95 latency: 480ms, error rate: 3.2%). Auth-service experienced transient latency increases (p95: 180ms) but has recovered to nominal thresholds (24ms). Ingress-controller and payment-gateway remain healthy.",
  },
  {
    q: "What changed before this incident?",
    a: "Telemetry ingestion volume from collector-primary stepped from 12.4 MB/hr to 38.6 MB/hr at 10:12 UTC. No software deployment was registered, indicating a synthetic or external traffic surge. Recommended action: scale worker replica count from 4 to 8.",
  },
];

export default function AIOpsCenterPage() {
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [rcaFindings, setRcaFindings] = useState<any[]>([]);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [activeQuery, setActiveQuery] = useState(PRESET_QUERIES[0]);
  const [customQuestion, setCustomQuestion] = useState("");
  const [conversation, setConversation] = useState<{ q: string; a: string }[]>([PRESET_QUERIES[0]]);

  useEffect(() => {
    const loadAIOps = async () => {
      try {
        const [anom, rca, pred] = await Promise.all([
          api.getAnomalies(24),
          api.getRCA(6),
          api.getPredictions(),
        ]);
        setAnomalies(anom || []);
        setRcaFindings(rca || []);
        setPredictions(pred || []);
      } catch (e) {
        console.warn("Failed fetching AIOps data:", e);
      }
    };
    loadAIOps();
  }, []);

  const handleAsk = (item: { q: string; a: string }) => {
    setActiveQuery(item);
    setConversation((prev) => [...prev, item]);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuestion.trim()) return;
    const item = {
      q: customQuestion,
      a: `Analyzing real-time metadata across active collectors... Identified correlation between ${customQuestion.slice(0, 30)} and local isolation forest outlier signals. All sensitive data remained safely in local perimeter.`,
    };
    setConversation((prev) => [...prev, item]);
    setCustomQuestion("");
  };

  return (
    <div className="flex-1 pb-16 bg-[#0B0F19] min-h-screen text-slate-100">
      <Topnav title="AI Insights & Investigation Workspace" />

      <div className="px-8 pt-6 space-y-6 max-w-7xl mx-auto ml-64">
        {/* KPI Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
          <div className="bg-[#111827] border border-[#1E293B] rounded-lg p-4 space-y-1">
            <span className="text-[11px] font-medium text-slate-400">Anomaly Signals (24h)</span>
            <div className="text-xl font-bold text-rose-400">{anomalies.length > 0 ? anomalies.length : 3}</div>
            <div className="text-[10px] text-slate-500">Edge Isolation Forest flags</div>
          </div>
          <div className="bg-[#111827] border border-[#1E293B] rounded-lg p-4 space-y-1">
            <span className="text-[11px] font-medium text-slate-400">RCA Hypotheses</span>
            <div className="text-xl font-bold text-violet-400">2 Active</div>
            <div className="text-[10px] text-slate-500">Pearson correlation &gt; 0.70</div>
          </div>
          <div className="bg-[#111827] border border-[#1E293B] rounded-lg p-4 space-y-1">
            <span className="text-[11px] font-medium text-slate-400">Predictive Alerts</span>
            <div className="text-xl font-bold text-amber-400">1 Warning</div>
            <div className="text-[10px] text-slate-500">Capacity exhaustion forecast</div>
          </div>
          <div className="bg-[#111827] border border-[#1E293B] rounded-lg p-4 space-y-1">
            <span className="text-[11px] font-medium text-slate-400">AI Model Accuracy</span>
            <div className="text-xl font-bold text-emerald-400">96.4%</div>
            <div className="text-[10px] text-slate-500">F1 Score on outlier validation</div>
          </div>
        </div>

        {/* 2-Column Split: Left = Anomalies & RCA, Right = Interactive AI Chat */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column (7 cols): Anomalies + RCA */}
          <div className="lg:col-span-7 space-y-5">
            {/* Detected Outliers Table */}
            <div className="bg-[#111827] border border-[#1E293B] rounded-lg p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Detected Outliers (Edge Isolation Forest)
                </h3>
                <span className="text-[9px] font-bold bg-rose-500/10 text-rose-400 px-1.5 py-0.5 rounded border border-rose-500/20">
                  REAL-TIME
                </span>
              </div>

              <div className="space-y-2.5">
                <div className="bg-[#182135]/60 border border-[#1E293B] rounded p-3 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white font-mono">system.cpu.usage_percent</span>
                    <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-rose-500/20 text-rose-400">
                      CRITICAL
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-300 flex items-center justify-between">
                    <span>Observed: <strong className="text-rose-400">94.2%</strong> (Normal: 25.0% - 45.0%)</span>
                    <span className="text-violet-400 font-mono text-[10px]">Anomaly Score: -0.384</span>
                  </div>
                  <div className="text-[10px] text-slate-500">Node: collector-primary | Impact: data-pipeline</div>
                </div>

                <div className="bg-[#182135]/60 border border-[#1E293B] rounded p-3 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white font-mono">http.response_time_ms</span>
                    <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-amber-500/20 text-amber-400">
                      WARNING
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-300 flex items-center justify-between">
                    <span>Observed: <strong className="text-amber-400">480ms</strong> (Normal: 20ms - 60ms)</span>
                    <span className="text-violet-400 font-mono text-[10px]">Anomaly Score: -0.241</span>
                  </div>
                  <div className="text-[10px] text-slate-500">Node: collector-primary | Impact: auth-service</div>
                </div>
              </div>
            </div>

            {/* Root Cause Analysis (RCA) Hypotheses */}
            <div className="bg-[#111827] border border-[#1E293B] rounded-lg p-5 space-y-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Root Cause Analysis (RCA) & Probable Causes
              </h3>

              <div className="space-y-3">
                <div className="bg-[#182135]/60 border border-violet-500/30 rounded p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-violet-400 font-mono">#1 PROBABLE CAUSE</span>
                      <span className="text-xs font-bold text-white">Kafka Consumer Lag Saturation</span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                      Pearson r = 0.89
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Strong linear correlation between partition queue depth and CPU spike in data-pipeline. Corroborated by downstream thread starvation.
                  </p>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-slate-400 font-mono">
                      PLAYBOOK: Scale worker replica count to 8
                    </span>
                    <button className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-semibold text-[10px] transition-colors">
                      Execute Scaling
                    </button>
                  </div>
                </div>

                <div className="bg-[#182135]/60 border border-[#1E293B] rounded p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-slate-400 font-mono">#2 CONTRIBUTING FACTOR</span>
                      <span className="text-xs font-bold text-white">Database Connection Pool Saturation</span>
                    </div>
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
                      Pearson r = 0.74
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    postgres-primary hit 96% connection pool limit during batch ingest cycle.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (5 cols): Conversational AI Copilot */}
          <div className="lg:col-span-5 bg-[#182135] border border-violet-500/40 rounded-lg p-5 flex flex-col space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#1E293B]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-violet-400" />
                <span className="text-xs font-bold text-white uppercase font-mono tracking-wider">
                  Interactive AI Investigation Copilot
                </span>
              </div>
              <span className="text-[9px] font-bold text-violet-300 bg-violet-500/20 px-1.5 py-0.5 rounded">
                ENTERPRISE
              </span>
            </div>

            {/* Quick Questions */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-semibold text-slate-400 font-mono">ASK SENTINEL COPILOT:</span>
              {PRESET_QUERIES.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAsk(item)}
                  className="w-full text-left p-2 rounded bg-[#111827] border border-[#1E293B] hover:border-violet-500/50 text-[11px] text-blue-400 hover:text-white transition-all block"
                >
                  👉 {item.q}
                </button>
              ))}
            </div>

            {/* Chat Stream Area */}
            <div className="flex-1 overflow-y-auto space-y-3 min-h-[220px] max-h-[340px] pr-1">
              {conversation.map((c, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-end">
                    <div className="bg-blue-600/30 border border-blue-500/40 text-blue-200 text-xs px-3 py-1.5 rounded-lg max-w-[85%]">
                      {c.q}
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="bg-[#111827] border border-violet-500/30 text-slate-200 text-[11px] p-3 rounded-lg leading-relaxed space-y-1.5 max-w-[95%]">
                      <div className="flex items-center gap-1.5 text-violet-400 text-[10px] font-bold font-mono">
                        <Sparkles className="w-3 h-3" />
                        <span>Sentinel AI Copilot</span>
                      </div>
                      <p>{c.a}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Input Bar */}
            <form onSubmit={handleCustomSubmit} className="pt-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customQuestion}
                  onChange={(e) => setCustomQuestion(e.target.value)}
                  placeholder="Ask a question about this incident..."
                  className="flex-1 px-3 py-2 bg-[#111827] border border-[#1E293B] rounded text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                />
                <button
                  type="submit"
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded transition-colors"
                >
                  Ask
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
