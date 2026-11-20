"use client";

import { useEffect, useState } from "react";
import { BarChart3, TrendingUp, Cpu, HardDrive, RefreshCw } from "lucide-react";
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

export default function MetricsPage() {
  const [timeFilter, setTimeFilter] = useState(1);
  const [metrics, setMetrics] = useState<any[]>([]);

  const loadData = async (hrs = timeFilter) => {
    try {
      const data = await api.getMetrics(undefined, hrs);
      setMetrics(data || []);
    } catch (e) {
      console.warn("Failed fetching metrics:", e);
    }
  };

  useEffect(() => {
    loadData(timeFilter);
    const interval = setInterval(() => loadData(timeFilter), 5000);
    return () => clearInterval(interval);
  }, [timeFilter]);

  // Transform metrics into time-series chart data
  const chartData = metrics.slice(-30).map((m) => ({
    time: new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    mean: m.mean,
    p95: m.p95,
    p99: m.p99,
  }));

  return (
    <div className="flex-1 pb-16">
      <Topnav
        title="Metrics & Analytics"
        timeFilter={timeFilter}
        onTimeFilterChange={(hrs) => {
          setTimeFilter(hrs);
          loadData(hrs);
        }}
      />

      <div className="px-8 pt-8 space-y-8 max-w-7xl mx-auto ml-64">
        {/* Metric Overview Chart */}
        <div className="bg-[#0f1629] border border-[#1a2236] rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-sm font-semibold text-white uppercase font-mono tracking-wider">
                STATISTICAL DISTRIBUTION (MEAN, P95, P99)
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                Visualizing rolling percentile metrics. No raw high-frequency observations needed.
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="flex items-center gap-1.5 text-cyan-400">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00d2ff]"></span> Mean
              </span>
              <span className="flex items-center gap-1.5 text-blue-400">
                <span className="w-2.5 h-2.5 rounded-full bg-[#3b82f6]"></span> p95
              </span>
              <span className="flex items-center gap-1.5 text-purple-400">
                <span className="w-2.5 h-2.5 rounded-full bg-[#a855f7]"></span> p99
              </span>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="p95Grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#475569" fontSize={11} />
                <YAxis stroke="#475569" fontSize={11} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0a0e1a",
                    borderColor: "#1e293b",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Area type="monotone" dataKey="p95" stroke="#3b82f6" strokeWidth={2} fill="url(#p95Grad)" />
                <Area type="monotone" dataKey="mean" stroke="#00d2ff" strokeWidth={2} fill="none" />
                <Area type="monotone" dataKey="p99" stroke="#a855f7" strokeWidth={1.5} strokeDasharray="3 3" fill="none" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Aggregated Summaries Table */}
        <div className="bg-[#0f1629] border border-[#1a2236] rounded-xl overflow-hidden">
          <div className="p-6 border-b border-[#1a2236]">
            <h3 className="text-sm font-semibold text-white uppercase font-mono tracking-wider">
              RECENT METRIC DIGESTS
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              Every row represents a 60-second aggregated statistical block.
            </p>
          </div>

          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#141d33] border-b border-[#1a2236] text-gray-400 uppercase">
              <tr>
                <th className="py-3.5 px-6">Metric Name</th>
                <th className="py-3.5 px-6">Collector</th>
                <th className="py-3.5 px-6">Count</th>
                <th className="py-3.5 px-6">Min / Max</th>
                <th className="py-3.5 px-6">Mean</th>
                <th className="py-3.5 px-6">p95 / p99</th>
                <th className="py-3.5 px-6">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a2236]">
              {metrics.slice(-10).map((m) => (
                <tr key={m.id} className="hover:bg-[#141d33]/50 transition-colors">
                  <td className="py-4 px-6 text-[#00d2ff] font-bold">{m.metric_name}</td>
                  <td className="py-4 px-6 text-gray-400">{m.collector_id}</td>
                  <td className="py-4 px-6 text-white">{m.count}</td>
                  <td className="py-4 px-6 text-gray-300">{m.min} / {m.max}</td>
                  <td className="py-4 px-6 text-emerald-400 font-bold">{m.mean}</td>
                  <td className="py-4 px-6 text-purple-400">{m.p95} / {m.p99}</td>
                  <td className="py-4 px-6 text-gray-400">{new Date(m.timestamp).toLocaleTimeString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
