"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle, RefreshCw, ShieldAlert, Cpu } from "lucide-react";
import { Topnav } from "@/components/layout/topnav";
import { api } from "@/lib/api";

export default function AnomaliesPage() {
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const data = await api.getAnomalies(24);
      setAnomalies(data || []);
    } catch (e) {
      console.warn("Failed fetching anomalies:", e);
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
      <Topnav title="Anomaly Detection" />

      <div className="px-8 pt-8 space-y-8 max-w-7xl mx-auto ml-64">
        {/* Header Description */}
        <div className="bg-[#0f1629] border border-[#1a2236] rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <Cpu className="w-5 h-5 text-cyan-400" />
            <h2 className="text-sm font-semibold text-white uppercase font-mono tracking-wider">
              EDGE ISOLATION FOREST ANOMALIES
            </h2>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed max-w-3xl">
            Anomalies are detected directly on the local collector inside the customer perimeter using Scikit-Learn
            Isolation Forest. The raw high-dimensional observation matrix remains local — only decision scores,
            expected range bounds, and severity classifications are transmitted.
          </p>
        </div>

        {/* Anomalies Table */}
        <div className="bg-[#0f1629] border border-[#1a2236] rounded-xl overflow-hidden">
          <div className="p-6 border-b border-[#1a2236] flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white uppercase font-mono tracking-wider">
                FLIGHT ANOMALY LOG (LAST 24 HOURS)
              </h3>
              <p className="text-xs text-gray-400 mt-1">{anomalies.length} Outliers Identified</p>
            </div>
            <button onClick={loadData} className="p-2 rounded-lg bg-[#141d33] border border-[#1e293b] text-gray-400 hover:text-white">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#141d33] border-b border-[#1a2236] text-gray-400 uppercase">
              <tr>
                <th className="py-3.5 px-6">Severity</th>
                <th className="py-3.5 px-6">Metric Name</th>
                <th className="py-3.5 px-6">Observed Value</th>
                <th className="py-3.5 px-6">Expected Range</th>
                <th className="py-3.5 px-6">Anomaly Score</th>
                <th className="py-3.5 px-6">Description</th>
                <th className="py-3.5 px-6">Detected At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a2236]">
              {anomalies.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">
                    No anomalies detected in the last 24 hours. Normal distribution maintained.
                  </td>
                </tr>
              ) : (
                anomalies.map((a) => (
                  <tr key={a.alert_id} className="hover:bg-[#141d33]/50 transition-colors">
                    <td className="py-4 px-6">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          a.severity === "critical"
                            ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                            : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                        }`}
                      >
                        {a.severity}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-bold text-white">{a.metric_name}</td>
                    <td className="py-4 px-6 text-cyan-400 font-bold">{a.actual_value}</td>
                    <td className="py-4 px-6 text-gray-400">{a.expected_range}</td>
                    <td className="py-4 px-6 text-purple-400">{a.anomaly_score}</td>
                    <td className="py-4 px-6 text-gray-300 max-w-xs truncate">{a.description}</td>
                    <td className="py-4 px-6 text-gray-500">{new Date(a.timestamp).toLocaleTimeString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
