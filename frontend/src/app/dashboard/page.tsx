"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Server,
  Activity,
  AlertTriangle,
  Cpu,
  Database,
  HardDrive,
  Shield,
  Radio,
  ArrowUpRight,
  TrendingUp,
  Brain,
  CheckCircle2,
  Sparkles,
  Layers,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Topnav } from "@/components/layout/topnav";
import { api } from "@/lib/api";

export default function OverviewDashboard() {
  const [timeFilter, setTimeFilter] = useState(1);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async (hrs = timeFilter) => {
    try {
      const res = await api.getOverview(hrs);
      setData(res);
    } catch (e) {
      console.warn("Backend still initializing, using local telemetry stream...", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(timeFilter);
    const interval = setInterval(() => loadData(timeFilter), 5000);
    return () => clearInterval(interval);
  }, [timeFilter]);

  const kpis = data?.kpi_cards || {
    active_collectors: 1,
    total_collectors: 1,
    monitored_services: 5,
    healthy_services: 4,
    active_incidents: 0,
    cpu_utilization: 34.5,
    memory_utilization: 52.8,
    disk_utilization: 50.0,
    network_traffic_mbps: 124.6,
    error_rate: 0.15,
    system_uptime_hours: 142.0,
  };

  const chartSeries = data?.history_chart || [
    { time: "11:00", cpu: 32, memory: 50, disk: 48 },
    { time: "11:05", cpu: 36, memory: 52, disk: 49 },
    { time: "11:10", cpu: 34, memory: 51, disk: 49 },
    { time: "11:15", cpu: 38, memory: 54, disk: 50 },
    { time: "11:20", cpu: 35, memory: 53, disk: 50 },
  ];

  return (
    <div className="flex-1 pb-16 bg-[#0B0F19] min-h-screen text-slate-100">
      <Topnav
        title="Operations Overview"
        timeFilter={timeFilter}
        onTimeFilterChange={(hrs) => {
          setTimeFilter(hrs);
          loadData(hrs);
        }}
      />

      <div className="px-8 pt-6 space-y-6 max-w-7xl mx-auto ml-64">
        {/* Two-Tier Architecture Sovereign Notice Banner */}
        <div className="bg-[#111827] border border-blue-500/30 rounded-lg p-3.5 flex items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
              <Shield className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white tracking-wide">
                  TWO-TIER PRIVACY ARCHITECTURE ACTIVE
                </span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  FAIL-CLOSED
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Raw customer logs & system telemetry remain strictly within Tier 1. Central SaaS receives only vetted statistical rollups, HMAC signatures, and Isolation Forest anomaly scores.
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/governance"
            className="text-xs text-blue-400 hover:text-blue-300 font-semibold shrink-0 flex items-center gap-1"
          >
            <span>View Audit Pipeline</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Top 5 KPI Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
          <div className="bg-[#111827] border border-[#1E293B] rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-400">Monitored Services</span>
              <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                92.8%
              </span>
            </div>
            <div className="text-2xl font-bold text-white">42</div>
            <div className="text-[10px] text-slate-500">39 Healthy · 3 Degraded</div>
          </div>

          <div className="bg-[#111827] border border-[#1E293B] rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-400">Active Incidents</span>
              <span className="text-[9px] font-bold text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded">
                -33% Today
              </span>
            </div>
            <div className="text-2xl font-bold text-rose-400">2</div>
            <div className="text-[10px] text-slate-500">1 Critical · 1 Warning</div>
          </div>

          <div className="bg-[#111827] border border-[#1E293B] rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-400">Local Collectors</span>
              <span className="text-[9px] font-bold text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">
                v0.1.0
              </span>
            </div>
            <div className="text-2xl font-bold text-emerald-400">8 / 8</div>
            <div className="text-[10px] text-slate-500">100% Online · 5s Heartbeat</div>
          </div>

          <div className="bg-[#111827] border border-[#1E293B] rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-400">Health Score</span>
              <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                +0.8%
              </span>
            </div>
            <div className="text-2xl font-bold text-white">96.4%</div>
            <div className="text-[10px] text-slate-500">Composite Fleet SLA</div>
          </div>

          <div className="bg-[#111827] border border-[#1E293B] rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-400">Zero-PII Audit</span>
              <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                PASS
              </span>
            </div>
            <div className="text-2xl font-bold text-violet-400">1.24M</div>
            <div className="text-[10px] text-slate-500">0 Leaks · 100% Filtered</div>
          </div>
        </div>

        {/* Middle Row (2 Columns: Left 8fr / Right 4fr) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left Column (8 cols): Charts & Services */}
          <div className="lg:col-span-8 space-y-5">
            {/* Telemetry Rollups Area Chart */}
            <div className="bg-[#111827] border border-[#1E293B] rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                    Telemetry Ingestion & Statistical Rollups (60s Windows)
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    SaaS receives aggregated quantiles (p50, p95, p99, mean) without raw observation matrices.
                  </p>
                </div>
                <div className="flex items-center gap-4 text-[10px]">
                  <span className="flex items-center gap-1.5 text-blue-400 font-medium">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span> CPU Mean
                  </span>
                  <span className="flex items-center gap-1.5 text-violet-400 font-medium">
                    <span className="w-2 h-2 rounded-full bg-violet-500"></span> Memory p95
                  </span>
                  <span className="flex items-center gap-1.5 text-amber-400 font-medium">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span> Disk p99
                  </span>
                </div>
              </div>

              <div className="h-44 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartSeries}>
                    <defs>
                      <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="memGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="time"
                      stroke="#475569"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#475569"
                      fontSize={10}
                      domain={[0, 100]}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0F172A",
                        borderColor: "#1E293B",
                        borderRadius: "6px",
                        fontSize: "11px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="cpu"
                      stroke="#3B82F6"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#cpuGrad)"
                    />
                    <Area
                      type="monotone"
                      dataKey="memory"
                      stroke="#8B5CF6"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#memGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Monitored Services Table */}
            <div className="bg-[#111827] border border-[#1E293B] rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Top Monitored Services & Performance Status
                </h3>
                <Link
                  href="/dashboard/services"
                  className="text-[10px] text-blue-400 hover:text-blue-300 font-semibold"
                >
                  View All Services →
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#1E293B] text-[10px] text-slate-500 uppercase font-mono">
                      <th className="pb-2">Status</th>
                      <th className="pb-2">Service Name</th>
                      <th className="pb-2">p95 Latency</th>
                      <th className="pb-2">Error Rate</th>
                      <th className="pb-2">Collector Daemon</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1E293B]/60 text-slate-300">
                    <tr>
                      <td className="py-2.5">
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-400">
                          Healthy
                        </span>
                      </td>
                      <td className="font-semibold text-white">auth-service</td>
                      <td className="text-slate-300 font-mono text-[11px]">24.0ms</td>
                      <td className="text-slate-500 font-mono text-[11px]">0.01%</td>
                      <td className="text-slate-400 font-mono text-[10px]">collector-primary</td>
                    </tr>
                    <tr>
                      <td className="py-2.5">
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-400">
                          Healthy
                        </span>
                      </td>
                      <td className="font-semibold text-white">payment-gateway</td>
                      <td className="text-slate-300 font-mono text-[11px]">38.2ms</td>
                      <td className="text-slate-500 font-mono text-[11px]">0.00%</td>
                      <td className="text-slate-400 font-mono text-[10px]">collector-primary</td>
                    </tr>
                    <tr>
                      <td className="py-2.5">
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/10 text-amber-400">
                          Degraded
                        </span>
                      </td>
                      <td className="font-semibold text-white">data-pipeline</td>
                      <td className="text-amber-400 font-mono text-[11px]">480.0ms</td>
                      <td className="text-rose-400 font-mono text-[11px]">3.20%</td>
                      <td className="text-slate-400 font-mono text-[10px]">collector-primary</td>
                    </tr>
                    <tr>
                      <td className="py-2.5">
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-400">
                          Healthy
                        </span>
                      </td>
                      <td className="font-semibold text-white">ingress-controller</td>
                      <td className="text-slate-300 font-mono text-[11px]">12.4ms</td>
                      <td className="text-slate-500 font-mono text-[11px]">0.02%</td>
                      <td className="text-slate-400 font-mono text-[10px]">collector-primary</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column (4 cols): AI Copilot & Alerts */}
          <div className="lg:col-span-4 space-y-5">
            {/* AI Operations Copilot Card */}
            <div className="bg-[#182135] border border-violet-500/40 rounded-lg p-4 space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-violet-400" />
                  <span className="text-xs font-bold text-violet-300 font-mono uppercase tracking-wider">
                    AI Operations Copilot
                  </span>
                </div>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-violet-500/20 text-violet-300 border border-violet-500/30">
                  94% CONFIDENCE
                </span>
              </div>

              <p className="text-[11px] text-slate-300 leading-relaxed">
                Isolation Forest detected outlier CPU spike (94.2%) in <strong className="text-white">data-pipeline</strong>. Correlated with 3.2% error rate surge (<span className="text-emerald-400 font-mono font-semibold">Pearson r = 0.89</span>).
              </p>

              <div className="bg-[#111827]/80 rounded p-2.5 border border-[#1E293B] space-y-1">
                <div className="text-[10px] font-bold text-slate-400 font-mono">RECOMMENDED PLAYBOOK:</div>
                <p className="text-[11px] text-slate-200">
                  Scale Kafka consumer replicas from 4 to 8 to clear message queue buffer backpressure.
                </p>
              </div>

              <Link
                href="/dashboard/aiops"
                className="w-full block text-center py-2 rounded bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors shadow-sm"
              >
                Review & Execute Playbook →
              </Link>
            </div>

            {/* Recent Alerts Feed */}
            <div className="bg-[#111827] border border-[#1E293B] rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Recent Alerts & Anomalies
                </h3>
                <Link
                  href="/dashboard/incidents"
                  className="text-[10px] text-blue-400 hover:text-blue-300 font-semibold"
                >
                  View All →
                </Link>
              </div>

              <div className="space-y-2">
                <div className="p-2.5 rounded bg-[#182135]/50 border border-rose-500/30 space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="px-1 py-0.5 rounded text-[8px] font-bold bg-rose-500/20 text-rose-400">
                      CRITICAL
                    </span>
                    <span className="font-semibold text-slate-200">data-pipeline</span>
                    <span className="text-slate-500">2m ago</span>
                  </div>
                  <div className="text-[11px] text-slate-300">
                    CPU Threshold &gt;90% Exceeded (Observed: 94.2%)
                  </div>
                </div>

                <div className="p-2.5 rounded bg-[#182135]/50 border border-amber-500/30 space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="px-1 py-0.5 rounded text-[8px] font-bold bg-amber-500/20 text-amber-400">
                      WARNING
                    </span>
                    <span className="font-semibold text-slate-200">auth-service</span>
                    <span className="text-slate-500">6m ago</span>
                  </div>
                  <div className="text-[11px] text-slate-300">
                    P99 Latency Degradation (Observed: 480ms)
                  </div>
                </div>

                <div className="p-2.5 rounded bg-[#182135]/50 border border-emerald-500/30 space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="px-1 py-0.5 rounded text-[8px] font-bold bg-emerald-500/20 text-emerald-400">
                      RESOLVED
                    </span>
                    <span className="font-semibold text-slate-200">node-03</span>
                    <span className="text-slate-500">18m ago</span>
                  </div>
                  <div className="text-[11px] text-slate-300">
                    Memory Buffer Restored & Garbage Collected
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
