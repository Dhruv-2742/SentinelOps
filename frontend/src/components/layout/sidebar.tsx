"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Server,
  Activity,
  BarChart3,
  Brain,
  AlertTriangle,
  Radio,
  Lock,
  Puzzle,
  Settings,
  Shield,
  CheckCircle2,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/infrastructure", label: "Infrastructure", icon: Server },
  { href: "/dashboard/services", label: "Services", icon: Activity },
  { href: "/dashboard/metrics", label: "Telemetry Explorer", icon: BarChart3 },
  { href: "/dashboard/aiops", label: "AI Insights", icon: Brain, badge: "COPILOT" },
  { href: "/dashboard/incidents", label: "Incidents & Alerts", icon: AlertTriangle, badge: "2" },
  { href: "/dashboard/collectors", label: "Local Collectors", icon: Radio },
  { href: "/dashboard/governance", label: "Data Governance", icon: Lock },
  { href: "/dashboard/integrations", label: "Integrations", icon: Puzzle },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-[#0F172A] border-r border-[#1E293B] flex flex-col h-screen fixed left-0 top-0 z-40 select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-4 border-b border-[#1E293B]">
        <Link href="/dashboard" className="flex items-center gap-2.5 w-full">
          <img
            src="/logo-banner.png"
            alt="SentinelOps"
            className="h-9 w-auto max-w-[210px] object-contain drop-shadow-[0_0_12px_rgba(139,92,246,0.3)]"
          />
        </Link>
      </div>

      {/* Nav List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? "bg-[#182135] text-white border border-blue-500/60 shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon
                  className={`w-4 h-4 ${isActive ? "text-blue-400" : "text-slate-400"}`}
                />
                <span className={isActive ? "font-semibold text-white" : ""}>{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={`px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider ${
                    item.badge === "COPILOT"
                      ? "bg-violet-500/20 text-violet-400 border border-violet-500/30"
                      : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* Tier-1 Local Status Footer Widget */}
      <div className="p-3 border-t border-[#1E293B]">
        <div className="bg-[#111827] border border-[#1E293B] rounded-lg p-3 space-y-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[11px] font-semibold text-white">Tier-1 Local Daemon</span>
            </div>
            <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
              ONLINE
            </span>
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            Zero-PII Filter: <span className="text-emerald-400 font-semibold">ACTIVE</span>
          </div>
          <div className="text-[9px] text-slate-500 font-mono">
            HMAC Signature: SHA256 (5s sync)
          </div>
        </div>
      </div>
    </aside>
  );
}
