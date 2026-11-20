"use client";

import { useEffect, useState } from "react";
import { Search, CheckCircle2, AlertTriangle, ArrowRight, GitFork, RefreshCw } from "lucide-react";
import { Topnav } from "@/components/layout/topnav";
import { api } from "@/lib/api";

export default function RCAPage() {
  const [rcaFindings, setRcaFindings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const data = await api.getRCA(6);
      setRcaFindings(data || []);
    } catch (e) {
      console.warn("Failed fetching RCA findings:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex-1 pb-16">
      <Topnav title="Root Cause Analysis (RCA)" />

      <div className="px-8 pt-8 space-y-8 max-w-7xl mx-auto ml-64">
        {/* Header Info */}
        <div className="bg-[#0f1629] border border-[#1a2236] rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Search className="w-5 h-5 text-cyan-400" />
            <h2 className="text-sm font-semibold text-white uppercase font-mono tracking-wider">
              CORRELATION-BASED CAUSAL ENGINE
            </h2>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed max-w-3xl">
            Correlates multi-signal co-occurrences (CPU, Memory, Disk, Error Rate, Service Latency).
            Per the SentinelOps specification, hypotheses are strictly distinguished from confirmed probable causes
            based on quantified evidence count.
          </p>
        </div>

        {/* RCA Findings Cards */}
        <div className="space-y-4">
          {rcaFindings.length === 0 ? (
            <div className="p-12 text-center text-xs text-gray-500 font-mono bg-[#0f1629] rounded-xl border border-[#1a2236]">
              No active causal anomalies detected in the current 6-hour window.
            </div>
          ) : (
            rcaFindings.map((finding, idx) => (
              <div key={idx} className="bg-[#0f1629] border border-[#1a2236] rounded-xl p-6 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#1a2236]">
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-[10px] font-mono px-2.5 py-1 rounded font-bold uppercase ${
                        finding.confidence_level === "probable"
                          ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      }`}
                    >
                      {finding.confidence_level} CAUSE
                    </span>
                    <span className="text-sm font-bold text-white font-mono">{finding.trigger_metric}</span>
                  </div>
                  <span className="text-xs font-mono text-cyan-400">{finding.evidence_count} Co-Occurring Signals</span>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-gray-300 font-mono uppercase mb-1">PROBABLE ROOT CAUSE</h4>
                  <p className="text-sm text-white font-medium">{finding.probable_cause}</p>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-gray-300 font-mono uppercase mb-1">CORRELATED ANOMALIES</h4>
                  <div className="flex flex-wrap gap-2">
                    {finding.correlated_anomalies.map((m: string) => (
                      <span key={m} className="px-2 py-1 rounded bg-[#0a0e1a] border border-[#1e293b] text-xs font-mono text-cyan-400">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 rounded-lg bg-[#0a0e1a] border border-[#1e293b]">
                  <h4 className="text-xs font-bold text-emerald-400 font-mono uppercase mb-1">RECOMMENDED INVESTIGATION</h4>
                  <p className="text-xs text-gray-300">{finding.recommended_investigation}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
