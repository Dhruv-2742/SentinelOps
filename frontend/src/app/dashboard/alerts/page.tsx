"use client";

import { useEffect, useState } from "react";
import { BellRing, CheckCircle2, AlertTriangle, ShieldCheck, RefreshCw } from "lucide-react";
import { Topnav } from "@/components/layout/topnav";
import { api } from "@/lib/api";

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [rules, setRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [alertsData, rulesData] = await Promise.all([
        api.getAlerts(),
        api.getAlertRules(),
      ]);
      setAlerts(alertsData || []);
      setRules(rulesData || []);
    } catch (e) {
      console.warn("Failed fetching alerts:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleAcknowledge = async (id: string) => {
    try {
      await api.acknowledgeAlert(id);
      loadData();
    } catch (e) {
      console.error("Failed acknowledging alert:", e);
    }
  };

  return (
    <div className="flex-1 pb-16">
      <Topnav title="Alert Management" />

      <div className="px-8 pt-8 space-y-8 max-w-7xl mx-auto ml-64">
        {/* Active Alerts Table */}
        <div className="bg-[#0f1629] border border-[#1a2236] rounded-xl overflow-hidden">
          <div className="p-6 border-b border-[#1a2236] flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white uppercase font-mono tracking-wider">
                TRIGGERED ANOMALY & THRESHOLD ALERTS
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                Fired by local collector alert rules or cloud AIOps anomaly engines.
              </p>
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
                <th className="py-3.5 px-6">Observed</th>
                <th className="py-3.5 px-6">Description</th>
                <th className="py-3.5 px-6">Timestamp</th>
                <th className="py-3.5 px-6">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a2236]">
              {alerts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">
                    No active unacknowledged alerts.
                  </td>
                </tr>
              ) : (
                alerts.map((a) => (
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
                    <td className="py-4 px-6 text-gray-300 max-w-sm truncate">{a.description}</td>
                    <td className="py-4 px-6 text-gray-400">{new Date(a.timestamp).toLocaleTimeString()}</td>
                    <td className="py-4 px-6">
                      {a.acknowledged ? (
                        <span className="text-emerald-400 font-semibold text-[10px]">ACKNOWLEDGED</span>
                      ) : (
                        <button
                          onClick={() => handleAcknowledge(a.alert_id)}
                          className="px-2.5 py-1 bg-[#141d33] border border-[#1e293b] hover:bg-[#1a2747] text-cyan-400 rounded text-[10px]"
                        >
                          Acknowledge
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Static Alert Rules */}
        <div className="bg-[#0f1629] border border-[#1a2236] rounded-xl p-6">
          <h3 className="text-sm font-semibold text-white uppercase font-mono tracking-wider mb-4">
            CONFIGURED ALERT POLICIES
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {rules.map((r) => (
              <div key={r.id} className="p-4 rounded-lg bg-[#0a0e1a] border border-[#1e293b] text-xs font-mono">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-bold">{r.name}</span>
                  <span className="text-cyan-400">{r.metric_name} {r.operator} {r.threshold}%</span>
                </div>
                <p className="text-gray-400">{r.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
