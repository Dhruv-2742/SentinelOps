import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: string;
  trend?: "up" | "down" | "neutral";
  icon: LucideIcon;
  color?: "cyan" | "blue" | "emerald" | "amber" | "rose";
}

export function StatCard({
  title,
  value,
  subtitle,
  change,
  trend = "neutral",
  icon: Icon,
  color = "cyan",
}: StatCardProps) {
  const colorMap = {
    cyan: "text-[#00d2ff] bg-[#00d2ff]/10 border-[#00d2ff]/20",
    blue: "text-[#3b82f6] bg-[#3b82f6]/10 border-[#3b82f6]/20",
    emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    amber: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    rose: "text-rose-400 bg-rose-500/10 border-rose-500/20",
  };

  return (
    <div className="bg-[#0f1629] border border-[#1a2236] rounded-xl p-5 hover:border-[#2a3754] transition-all group">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-gray-400 tracking-wide uppercase font-mono">
          {title}
        </span>
        <div className={`p-2 rounded-lg border ${colorMap[color]}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-white tracking-tight font-mono">
          {value}
        </span>
        {change && (
          <span
            className={`text-xs font-medium ${
              trend === "up"
                ? "text-rose-400"
                : trend === "down"
                ? "text-emerald-400"
                : "text-gray-400"
            }`}
          >
            {change}
          </span>
        )}
      </div>

      {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
    </div>
  );
}
