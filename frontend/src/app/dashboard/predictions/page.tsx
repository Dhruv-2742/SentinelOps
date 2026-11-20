"use client";

import { useEffect, useState } from "react";
import { TrendingUp, Clock, AlertTriangle, ShieldCheck, HardDrive, Cpu, Server } from "lucide-react";
import { Topnav } from "@/components/layout/topnav";
import { api } from "@/lib/api";

export default function PredictionsPage() {
  const [predictions, setPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const data = await api.getPredictions();
      setPredictions(data || []);
    } catch (e) {
      console.warn("Failed fetching predictions:", e);
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
      <Topnav title="Predictive Insights & Capacity Forecasting" />

      <div className="px-8 pt-8 space-y-8 max-w-7xl mx-auto ml-64">
        {/* Header Overview */}
        <div className="bg-[#0f1629] border border-[#1a2236] rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
            <h2 className="text-sm font-semibold text-white uppercase font-mono tracking-wider">
              LINEAR TREND VELOCITY & EXHAUSTION FORECASTER
            </h2>
          </div>
          <p className="text-xs text-gray-400 leading-relaxed max-w-3xl">
            Projects forward resource depletion trajectories using linear regression on telemetry summaries.
            Forecasts exact time-to-threshold to prevent unhandled out-of-memory or disk saturation events.
          </p>
        </div>

        {/* Prediction Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {predictions.map((p, idx) => (
            <div key={idx} className="bg-[#0f1629] border border-[#1a2236] rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-white">{p.metric_name}</span>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold ${
                    p.status === "warning" || p.status === "critical_breached"
                      ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                      : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  }`}
                >
                  {p.status}
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold font-mono text-white">{p.current_value}%</span>
                <span className="text-xs text-gray-500 font-mono">/ {p.threshold}% Threshold</span>
              </div>

              <div className="p-3 rounded-lg bg-[#0a0e1a] border border-[#1e293b] text-xs">
                <span className="text-gray-400 block mb-1 font-mono">PROJECTED HORIZON</span>
                <span className="text-cyan-400 font-bold font-mono">
                  {p.hours_remaining !== null ? `~${p.hours_remaining} hours remaining` : "Stable trajectory"}
                </span>
              </div>

              <p className="text-xs text-gray-300">{p.recommendation}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
