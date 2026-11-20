"use client";

import { useEffect, useState } from "react";
import { Activity, CheckCircle2, AlertCircle, XCircle, Clock, RefreshCw } from "lucide-react";
import { Topnav } from "@/components/layout/topnav";
import { StatCard } from "@/components/dashboard/stat-card";
import { api } from "@/lib/api";

export default function ServicesPage() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadServices = async () => {
    try {
      const data = await api.getServices();
      setServices(data || []);
    } catch (e) {
      console.warn("Failed fetching services:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
    const interval = setInterval(loadServices, 5000);
    return () => clearInterval(interval);
  }, []);

  const healthyCount = services.filter((s) => s.status === "healthy").length;
  const degradedCount = services.filter((s) => s.status === "degraded").length;

  return (
    <div className="flex-1 pb-16">
      <Topnav title="Service Monitoring" />

      <div className="px-8 pt-8 space-y-8 max-w-7xl mx-auto ml-64">
        {/* KPI Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="TOTAL MONITORED SERVICES"
            value={services.length}
            subtitle="Application microservices"
            icon={Activity}
            color="cyan"
          />
          <StatCard
            title="HEALTHY SERVICES"
            value={healthyCount}
            subtitle="Passing health probes"
            icon={CheckCircle2}
            color="emerald"
          />
          <StatCard
            title="DEGRADED / FAILING"
            value={degradedCount}
            subtitle={degradedCount > 0 ? "Requires review" : "Zero errors"}
            icon={AlertCircle}
            color={degradedCount > 0 ? "amber" : "emerald"}
          />
        </div>

        {/* Services Grid */}
        <div className="bg-[#0f1629] border border-[#1a2236] rounded-xl overflow-hidden">
          <div className="p-6 border-b border-[#1a2236] flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white uppercase font-mono tracking-wider">
                ACTIVE MICROSERVICES & API HEALTH
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                Monitored by local collector health checks (Latency & HTTP probe status).
              </p>
            </div>
            <button
              onClick={loadServices}
              className="p-2 rounded-lg bg-[#141d33] border border-[#1e293b] text-gray-400 hover:text-white"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#141d33] border-b border-[#1a2236] text-gray-400 uppercase">
              <tr>
                <th className="py-3.5 px-6">Service Name</th>
                <th className="py-3.5 px-6">Reporting Collector</th>
                <th className="py-3.5 px-6">Response Latency</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6">Last Check</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a2236]">
              {services.map((s) => (
                <tr key={s.id} className="hover:bg-[#141d33]/50 transition-colors">
                  <td className="py-4 px-6 text-white font-bold flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        s.status === "healthy" ? "bg-emerald-400" : "bg-amber-400"
                      }`}
                    ></span>
                    {s.service_name}
                  </td>
                  <td className="py-4 px-6 text-gray-400">{s.collector_id}</td>
                  <td className="py-4 px-6 text-cyan-400">{s.response_time_ms || 24.5} ms</td>
                  <td className="py-4 px-6">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                        s.status === "healthy"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      }`}
                    >
                      {s.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-gray-400">
                    {new Date(s.timestamp).toLocaleTimeString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
