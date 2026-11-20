"use client";

import { useEffect, useState } from "react";
import { ShieldAlert, CheckCircle2, Clock, Plus, Filter, RefreshCw, XCircle } from "lucide-react";
import { Topnav } from "@/components/layout/topnav";
import { api } from "@/lib/api";

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<any[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const loadIncidents = async () => {
    try {
      const data = await api.getIncidents(filterStatus || undefined);
      setIncidents(data || []);
    } catch (e) {
      console.warn("Failed fetching incidents:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIncidents();
    const interval = setInterval(loadIncidents, 5000);
    return () => clearInterval(interval);
  }, [filterStatus]);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await api.updateIncidentStatus(id, newStatus);
      loadIncidents();
    } catch (e) {
      console.error("Failed updating status:", e);
    }
  };

  return (
    <div className="flex-1 pb-16">
      <Topnav title="Incident Management" />

      <div className="px-8 pt-8 space-y-8 max-w-7xl mx-auto ml-64">
        {/* Actions Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {["", "open", "acknowledged", "resolved"].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase transition-all ${
                  filterStatus === st
                    ? "bg-[#00d2ff] text-black font-bold"
                    : "bg-[#0f1629] border border-[#1a2236] text-gray-400 hover:text-white"
                }`}
              >
                {st === "" ? "All Statuses" : st}
              </button>
            ))}
          </div>

          <button
            onClick={loadIncidents}
            className="p-2 rounded-lg bg-[#141d33] border border-[#1e293b] text-gray-400 hover:text-white self-start"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Incidents List */}
        <div className="space-y-4">
          {incidents.length === 0 ? (
            <div className="p-12 text-center text-xs text-gray-500 font-mono bg-[#0f1629] rounded-xl border border-[#1a2236]">
              Zero matching incidents. All systems operational.
            </div>
          ) : (
            incidents.map((inc) => (
              <div key={inc.incident_id} className="bg-[#0f1629] border border-[#1a2236] rounded-xl p-6 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#1a2236]">
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-[10px] font-mono px-2.5 py-1 rounded font-bold uppercase ${
                        inc.severity === "critical" || inc.severity === "emergency"
                          ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                          : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                      }`}
                    >
                      {inc.severity}
                    </span>
                    <span className="text-sm font-bold text-white font-mono">{inc.incident_id}</span>
                    <span className="text-sm text-gray-300 font-medium">— {inc.title}</span>
                  </div>

                  {/* Status Badges & Transition Buttons */}
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-mono px-2.5 py-1 rounded font-semibold uppercase ${
                        inc.status === "open"
                          ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                          : inc.status === "acknowledged"
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      }`}
                    >
                      {inc.status}
                    </span>

                    {inc.status === "open" && (
                      <button
                        onClick={() => handleUpdateStatus(inc.incident_id, "acknowledged")}
                        className="px-3 py-1 bg-[#141d33] border border-[#1e293b] hover:bg-[#1a2747] text-cyan-400 text-xs rounded transition-colors font-mono"
                      >
                        Acknowledge
                      </button>
                    )}

                    {inc.status !== "resolved" && (
                      <button
                        onClick={() => handleUpdateStatus(inc.incident_id, "resolved")}
                        className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 text-emerald-400 text-xs rounded transition-colors font-mono"
                      >
                        Resolve
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 text-xs font-mono">
                  <div>
                    <span className="text-gray-500 block mb-1">PROBABLE ROOT CAUSE</span>
                    <p className="text-white bg-[#0a0e1a] p-3 rounded-lg border border-[#1e293b]">
                      {inc.probable_cause || "Analyzing telemetry signatures..."}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500 block mb-1">RECOMMENDED INVESTIGATION</span>
                    <p className="text-cyan-400 bg-[#0a0e1a] p-3 rounded-lg border border-[#1e293b]">
                      {inc.recommended_investigation || "Review correlated service logs locally."}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono text-gray-500 pt-2">
                  <span>Detected: {new Date(inc.detection_time).toLocaleString()}</span>
                  <span>Service: {inc.affected_service || "infrastructure"}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
