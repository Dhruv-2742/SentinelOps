"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, Search, Terminal, User, Shield, CheckCircle2, ChevronDown } from "lucide-react";

interface TopnavProps {
  title?: string;
  timeFilter?: number;
  onTimeFilterChange?: (hours: number) => void;
}

export function Topnav({ title = "Overview", timeFilter = 1, onTimeFilterChange }: TopnavProps) {
  const [cluster, setCluster] = useState("us-east-prod-k8s");

  return (
    <header className="h-16 bg-[#0F172A]/90 backdrop-blur-md border-b border-[#1E293B] px-8 flex items-center justify-between sticky top-0 z-30 ml-64">
      {/* Title & Security Status Pill */}
      <div className="flex items-center gap-4">
        <h1 className="text-base font-bold text-white tracking-tight">{title}</h1>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold tracking-wide">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>ZERO-PII EGRESS VERIFIED</span>
        </div>
      </div>

      {/* Right Action Bar */}
      <div className="flex items-center gap-3">
        {/* Cluster Selector */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#111827] border border-[#1E293B] text-xs text-slate-300 font-medium">
          <span className="text-slate-500 font-mono text-[10px]">CLUSTER:</span>
          <span>{cluster}</span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-500 ml-1" />
        </div>

        {/* Time Window Filter (1h / 6h / 24h) */}
        {onTimeFilterChange && (
          <div className="flex items-center bg-[#111827] p-1 rounded-md border border-[#1E293B] text-xs">
            {[1, 6, 24].map((hrs) => (
              <button
                key={hrs}
                onClick={() => onTimeFilterChange(hrs)}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  timeFilter === hrs
                    ? "bg-blue-600 text-white font-semibold shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {hrs}h
              </button>
            ))}
          </div>
        )}

        {/* Notifications */}
        <Link
          href="/dashboard/incidents"
          className="relative p-2 rounded-md bg-[#111827] border border-[#1E293B] text-slate-400 hover:text-white transition-colors"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-[#0F172A]" />
        </Link>

        {/* User profile chip */}
        <div className="flex items-center gap-2 pl-2 border-l border-[#1E293B]">
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-sm">
            AL
          </div>
          <div className="hidden lg:block text-left">
            <span className="block text-xs font-semibold text-white leading-tight">Admin Lead</span>
            <span className="block text-[10px] text-slate-400 leading-tight">SecOps Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
}
