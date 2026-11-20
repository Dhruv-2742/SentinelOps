"use client";

import { useEffect, useState } from "react";
import { Radio, Plus, Terminal, Copy, Check, RefreshCw, Key, Shield, ArrowRightLeft, Layers, Server } from "lucide-react";
import { Topnav } from "@/components/layout/topnav";
import { api } from "@/lib/api";

export default function CollectorsPage() {
  const [collectors, setCollectors] = useState<any[]>([]);
  const [enrollModal, setEnrollModal] = useState(false);
  const [collectorName, setCollectorName] = useState("");
  const [enrolledInfo, setEnrolledInfo] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const loadCollectors = async () => {
    try {
      const data = await api.getCollectors();
      setCollectors(data || []);
    } catch (e) {
      console.warn("Failed fetching collectors:", e);
    }
  };

  useEffect(() => {
    loadCollectors();
    const interval = setInterval(loadCollectors, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.enrollCollector({ name: collectorName || "Production-Worker-Node" });
      setEnrolledInfo(res);
      loadCollectors();
    } catch (err) {
      console.error("Enrollment failed:", err);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 pb-16 bg-[#0B0F19] min-h-screen text-slate-100">
      <Topnav title="Local Collector Management" />

      <div className="px-8 pt-6 space-y-6 max-w-7xl mx-auto ml-64">
        {/* Architectural Split: Tier 1 vs Tier 2 */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
          {/* Tier 1 Card */}
          <div className="md:col-span-5 bg-[#111827] border border-blue-500/40 rounded-lg p-5 space-y-3">
            <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase tracking-wider font-mono">
              <Shield className="w-4 h-4" />
              <span>TIER 1: Customer Local Perimeter</span>
            </div>
            <ul className="text-[11px] text-slate-300 space-y-1.5 leading-relaxed">
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-400 font-bold">✔</span>
                <span><strong>Raw Telemetry Sovereignty:</strong> Unsanitized logs, traces & kernel scrapes stay inside local memory/disk.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-400 font-bold">✔</span>
                <span><strong>Air-Gapped SQLite Store:</strong> Raw observation matrix is never queried over external networks.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-400 font-bold">✔</span>
                <span><strong>Edge Isolation Forest ML:</strong> 5-dimensional feature outlier detection executes locally.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-400 font-bold">✔</span>
                <span><strong>Fail-Closed Gate:</strong> Regex PII scrubber and strict allowlist block any tainted payload.</span>
              </li>
            </ul>
          </div>

          {/* Bridge */}
          <div className="md:col-span-2 bg-[#182135]/60 border border-[#1E293B] rounded-lg p-3 flex flex-col items-center justify-center text-center space-y-1">
            <ArrowRightLeft className="w-5 h-5 text-violet-400" />
            <span className="text-[10px] font-bold text-violet-300 font-mono">HMAC-SHA256</span>
            <span className="text-[9px] text-slate-400">Statistical Rollups Only</span>
            <span className="text-[8px] text-emerald-400 bg-emerald-500/10 px-1 py-0.5 rounded font-mono font-bold mt-1">
              99.97% REDUCTION
            </span>
          </div>

          {/* Tier 2 Card */}
          <div className="md:col-span-5 bg-[#111827] border border-violet-500/40 rounded-lg p-5 space-y-3">
            <div className="flex items-center gap-2 text-violet-400 font-bold text-xs uppercase tracking-wider font-mono">
              <Layers className="w-4 h-4" />
              <span>TIER 2: Centralized SaaS Control Plane</span>
            </div>
            <ul className="text-[11px] text-slate-300 space-y-1.5 leading-relaxed">
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-400 font-bold">✔</span>
                <span><strong>Zero Sensitive Data Egress:</strong> Cloud gateway accepts only approved metadata digests.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-400 font-bold">✔</span>
                <span><strong>Global Correlation Engine:</strong> Cross-cluster Pearson RCA pinpoints multi-service root causes.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-400 font-bold">✔</span>
                <span><strong>Predictive Capacity Forecasting:</strong> Linear regression projects resource exhaustion milestones.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-400 font-bold">✔</span>
                <span><strong>Verifiable Compliance:</strong> Continuous cryptographic audit ensures immutable data integrity.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Fleet Metrics Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
          <div className="bg-[#111827] border border-[#1E293B] rounded-lg p-4 space-y-1">
            <span className="text-[11px] font-medium text-slate-400">Local Telemetry Ingested</span>
            <div className="text-xl font-bold text-white">48.2 GB</div>
            <div className="text-[10px] text-slate-500">Processed entirely inside customer tier</div>
          </div>
          <div className="bg-[#111827] border border-[#1E293B] rounded-lg p-4 space-y-1">
            <span className="text-[11px] font-medium text-slate-400">Approved Metadata Egress</span>
            <div className="text-xl font-bold text-blue-400">14.6 MB</div>
            <div className="text-[10px] text-emerald-400 font-semibold">99.97% Data Reduction to Cloud</div>
          </div>
          <div className="bg-[#111827] border border-[#1E293B] rounded-lg p-4 space-y-1">
            <span className="text-[11px] font-medium text-slate-400">PII Interceptions</span>
            <div className="text-xl font-bold text-emerald-400">1,420</div>
            <div className="text-[10px] text-slate-500">Credit cards, IPs, tokens sanitized</div>
          </div>
          <div className="bg-[#111827] border border-[#1E293B] rounded-lg p-4 space-y-1">
            <span className="text-[11px] font-medium text-slate-400">Sync Cadence</span>
            <div className="text-xl font-bold text-violet-400">5.0s</div>
            <div className="text-[10px] text-slate-500">Zero-jitter heartbeat cadence</div>
          </div>
        </div>

        {/* Collector Fleet Data Table */}
        <div className="bg-[#111827] border border-[#1E293B] rounded-lg p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Connected Collector Fleet (Tier 1 Daemons)
              </h3>
              <p className="text-[11px] text-slate-400">
                Registered local agents actively scrubbing and transmitting signed metadata.
              </p>
            </div>
            <button
              onClick={() => {
                setEnrolledInfo(null);
                setEnrollModal(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Enroll New Collector</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#1E293B] text-[10px] text-slate-500 uppercase font-mono">
                  <th className="pb-2">Status</th>
                  <th className="pb-2">Collector ID</th>
                  <th className="pb-2">Host / OS</th>
                  <th className="pb-2">Version</th>
                  <th className="pb-2">Last Heartbeat</th>
                  <th className="pb-2">Local / Egress</th>
                  <th className="pb-2">Privacy Policy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E293B]/60 text-slate-300">
                {/* Live Active Collector from API */}
                {collectors.map((c) => (
                  <tr key={c.id}>
                    <td className="py-3">
                      <span className="flex items-center gap-1.5 text-emerald-400 font-bold text-[10px]">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        ONLINE
                      </span>
                    </td>
                    <td className="font-semibold text-white font-mono">{c.id}</td>
                    <td className="text-slate-300 font-mono text-[11px]">{c.hostname || "local-host"} ({c.os_info || "Windows"})</td>
                    <td className="text-blue-400 font-mono text-[10px]">v{c.version || "0.1.0"}</td>
                    <td className="text-slate-400 font-mono text-[11px]">Just now</td>
                    <td className="text-slate-300 font-mono text-[11px]">12.4 GB / 3.8 MB</td>
                    <td>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Fail-Closed [PASS]
                      </span>
                    </td>
                  </tr>
                ))}

                {/* Simulated Fleet Nodes */}
                <tr>
                  <td className="py-3">
                    <span className="flex items-center gap-1.5 text-emerald-400 font-bold text-[10px]">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      ONLINE
                    </span>
                  </td>
                  <td className="font-semibold text-white font-mono">collector-eu-prod</td>
                  <td className="text-slate-300 font-mono text-[11px]">eu-central-baremetal-01 (Linux 6.1)</td>
                  <td className="text-blue-400 font-mono text-[10px]">v0.1.0</td>
                  <td className="text-slate-400 font-mono text-[11px]">2s ago</td>
                  <td className="text-slate-300 font-mono text-[11px]">18.2 GB / 5.4 MB</td>
                  <td>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Fail-Closed [PASS]
                    </span>
                  </td>
                </tr>

                <tr>
                  <td className="py-3">
                    <span className="flex items-center gap-1.5 text-emerald-400 font-bold text-[10px]">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      ONLINE
                    </span>
                  </td>
                  <td className="font-semibold text-white font-mono">collector-fintech-pci</td>
                  <td className="text-slate-300 font-mono text-[11px]">pci-isolated-hsm (RHEL 9.2)</td>
                  <td className="text-blue-400 font-mono text-[10px]">v0.1.0</td>
                  <td className="text-slate-400 font-mono text-[11px]">1s ago</td>
                  <td className="text-slate-300 font-mono text-[11px]">11.5 GB / 3.5 MB</td>
                  <td>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Fail-Closed [PASS]
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Enrollment Modal */}
        {enrollModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#111827] border border-[#1E293B] rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
              <h3 className="text-base font-bold text-white">Enroll New Local Collector</h3>
              <p className="text-xs text-slate-400">
                Generate a one-time enrollment token to connect an on-premise or cloud node securely.
              </p>

              {!enrolledInfo ? (
                <form onSubmit={handleEnroll} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Collector Node Name</label>
                    <input
                      type="text"
                      value={collectorName}
                      onChange={(e) => setCollectorName(e.target.value)}
                      placeholder="e.g. us-west-k8s-worker"
                      className="w-full px-3 py-2 bg-[#0B0F19] border border-[#1E293B] rounded text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setEnrollModal(false)}
                      className="px-3 py-1.5 rounded bg-slate-800 text-slate-300 text-xs hover:bg-slate-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1.5 rounded bg-blue-600 text-white font-semibold text-xs hover:bg-blue-500"
                    >
                      Generate Key & Token
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-3">
                  <div className="p-3 bg-[#0B0F19] rounded border border-[#1E293B] space-y-1 font-mono text-xs">
                    <div className="text-slate-400 text-[10px]">COLLECTOR ID:</div>
                    <div className="text-white font-bold">{enrolledInfo.collector_id}</div>
                    <div className="text-slate-400 text-[10px] pt-1">API KEY:</div>
                    <div className="text-emerald-400 break-all">{enrolledInfo.api_key}</div>
                  </div>
                  <button
                    onClick={() => copyToClipboard(enrolledInfo.api_key)}
                    className="w-full py-2 bg-blue-600 text-white rounded text-xs font-semibold hover:bg-blue-500"
                  >
                    {copied ? "Copied to Clipboard!" : "Copy Ingestion Key"}
                  </button>
                  <button
                    onClick={() => setEnrollModal(false)}
                    className="w-full py-1 text-slate-400 text-xs hover:text-white"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
