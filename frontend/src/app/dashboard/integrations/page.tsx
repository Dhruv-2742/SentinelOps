"use client";

import { Puzzle, CheckCircle2, ExternalLink, ShieldCheck } from "lucide-react";
import { Topnav } from "@/components/layout/topnav";

const INTEGRATIONS = [
  {
    name: "Slack Webhooks",
    category: "Notification",
    description: "Dispatch urgent anomaly and incident alerts into dedicated engineering channels.",
    status: "Configured",
    iconColor: "text-purple-400 bg-purple-500/10 border-purple-500/20",
  },
  {
    name: "PagerDuty Integration",
    category: "On-Call Paging",
    description: "Trigger incident escalation policies for critical anomalies automatically.",
    status: "Available",
    iconColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  },
  {
    name: "Kubernetes DaemonSet",
    category: "Telemetry Ingestion",
    description: "Deploy Tier-1 local collectors on every cluster node via Helm chart.",
    status: "Active",
    iconColor: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  },
  {
    name: "Prometheus Exporter",
    category: "Local Scraper",
    description: "Scrape in-cluster Prometheus metric endpoints locally before privacy aggregation.",
    status: "Active",
    iconColor: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  },
];

export default function IntegrationsPage() {
  return (
    <div className="flex-1 pb-16">
      <Topnav title="Platform Integrations" />

      <div className="px-8 pt-8 space-y-8 max-w-7xl mx-auto ml-64">
        <div className="bg-[#0f1629] border border-[#1a2236] rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Puzzle className="w-5 h-5 text-cyan-400" />
            <h2 className="text-sm font-semibold text-white uppercase font-mono tracking-wider">
              ENTERPRISE ECOSYSTEM INTEGRATIONS
            </h2>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed max-w-3xl">
            Connect SentinelOps with your incident management tools, local container runtimes,
            and communication channels without altering the two-tier sovereign architecture.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {INTEGRATIONS.map((item) => (
            <div key={item.name} className="p-6 rounded-xl bg-[#0f1629] border border-[#1a2236] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono text-gray-500 uppercase">{item.category}</span>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                      item.status === "Active" || item.status === "Configured"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "bg-[#141d33] text-gray-400 border border-[#1e293b]"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mb-2">{item.name}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{item.description}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-[#1a2236] flex justify-end">
                <button className="text-xs text-cyan-400 hover:text-white transition-colors font-mono flex items-center gap-1">
                  Configure <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
