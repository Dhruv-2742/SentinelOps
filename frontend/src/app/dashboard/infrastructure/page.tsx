"use client";

import { useEffect, useState } from "react";
import { Server, Cpu, HardDrive, Network, Radio, Clock, CheckCircle2, ShieldCheck, Activity } from "lucide-react";
import { Topnav } from "@/components/layout/topnav";
import { api } from "@/lib/api";

export default function InfrastructurePage() {
  const [collectors, setCollectors] = useState<any[]>([]);
  const [health, setHealth] = useState<any[]>([]);

  const loadData = async () => {
    try {
      const [colRes, healthRes] = await Promise.all([
        api.getCollectors(),
        api.getHealth(1),
      ]);
      setCollectors(colRes || []);
      setHealth(healthRes || []);
    } catch (e) {
      console.warn("Failed fetching infrastructure data:", e);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const nodes = [
    { name: "node-us-east-01", env: "AWS EKS", cpu: "34.2%", mem: "58.4%", disk: "50.1%", status: "Healthy", uptime: "142h" },
    { name: "node-us-east-02", env: "AWS EKS", cpu: "94.2%", mem: "72.0%", disk: "68.4%", status: "Degraded", uptime: "86h" },
    { name: "node-eu-west-01", env: "BareMetal", cpu: "28.5%", mem: "42.1%", disk: "45.0%", status: "Healthy", uptime: "320h" },
    { name: "node-gcp-stage-01", env: "GCP GKE", cpu: "19.8%", mem: "38.2%", disk: "42.0%", status: "Healthy", uptime: "48h" },
  ];

  return (
    <div className="flex-1 pb-16 bg-[#0B0F19] min-h-screen text-slate-100">
      <Topnav title="Infrastructure Fleet Monitoring" />

      <div className="px-8 pt-6 space-y-6 max-w-7xl mx-auto ml-64">
        {/* KPI Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
          <div className="bg-[#111827] border border-[#1E293B] rounded-lg p-4 space-y-1">
            <span className="text-[11px] font-medium text-slate-400">Total Nodes</span>
            <div className="text-xl font-bold text-white">12 Clusters</div>
            <div className="text-[10px] text-emerald-400">11 Healthy · 1 Degraded</div>
          </div>
          <div className="bg-[#111827] border border-[#1E293B] rounded-lg p-4 space-y-1">
            <span className="text-[11px] font-medium text-slate-400">Peak Fleet CPU</span>
            <div className="text-xl font-bold text-amber-400">94.2%</div>
            <div className="text-[10px] text-slate-500">Threshold: 85.0%</div>
          </div>
          <div className="bg-[#111827] border border-[#1E293B] rounded-lg p-4 space-y-1">
            <span className="text-[11px] font-medium text-slate-400">Memory Allocation</span>
            <div className="text-xl font-bold text-blue-400">58.4%</div>
            <div className="text-[10px] text-slate-500">Nominal across nodes</div>
          </div>
          <div className="bg-[#111827] border border-[#1E293B] rounded-lg p-4 space-y-1">
            <span className="text-[11px] font-medium text-slate-400">Fleet Uptime</span>
            <div className="text-xl font-bold text-emerald-400">99.98%</div>
            <div className="text-[10px] text-slate-500">Last 30 days composite</div>
          </div>
        </div>

        {/* Node Infrastructure Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {nodes.map((n) => (
            <div
              key={n.name}
              className={`bg-[#111827] border rounded-lg p-4 space-y-3 ${
                n.status === "Healthy" ? "border-[#1E293B]" : "border-rose-500/40"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-xs text-white font-mono">{n.name}</span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                    n.status === "Healthy"
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "bg-rose-500/20 text-rose-400"
                  }`}
                >
                  {n.status}
                </span>
              </div>

              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>CPU Usage:</span>
                  <span className={`font-mono font-semibold ${parseFloat(n.cpu) > 80 ? "text-rose-400" : "text-white"}`}>{n.cpu}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Memory:</span>
                  <span className="font-mono text-white">{n.mem}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Disk Storage:</span>
                  <span className="font-mono text-white">{n.disk}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Uptime:</span>
                  <span className="font-mono text-slate-400">{n.uptime}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-[#1E293B] text-[10px] text-slate-500 flex justify-between">
                <span>Env: {n.env}</span>
                <span className="text-emerald-400 font-mono">Tier-1 Scraper Active</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
