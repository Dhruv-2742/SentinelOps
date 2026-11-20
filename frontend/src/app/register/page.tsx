"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldCheck, Lock, Mail, User, Building, ArrowRight, AlertCircle } from "lucide-react";
import { api } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    full_name: "",
    organization_name: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.register(formData);
      if (res.token) {
        localStorage.setItem("sentinel_token", res.token);
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Registration failed. Please check input values.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white flex flex-col justify-center items-center px-4 py-12">
      <Link href="/" className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00d2ff] to-[#3b82f6] flex items-center justify-center">
          <ShieldCheck className="w-6 h-6 text-black" />
        </div>
        <span className="font-bold text-2xl text-white">Sentinel<span className="text-[#00d2ff]">Ops</span></span>
      </Link>

      <div className="w-full max-w-md p-8 rounded-2xl bg-[#0f1629] border border-[#1a2236] shadow-2xl">
        <h2 className="text-xl font-bold text-white mb-2">Create Organization Account</h2>
        <p className="text-xs text-gray-400 mb-6">Deploy SentinelOps across your sovereign infrastructure</p>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-gray-400 mb-1">ORGANIZATION NAME</label>
            <div className="relative">
              <Building className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
              <input
                type="text"
                required
                placeholder="Acme Financial Corp"
                value={formData.organization_name}
                onChange={(e) => setFormData({ ...formData, organization_name: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 bg-[#0a0e1a] border border-[#1e2942] rounded-lg text-sm text-white focus:outline-none focus:border-[#00d2ff]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-gray-400 mb-1">FULL NAME</label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
              <input
                type="text"
                required
                placeholder="Jane Doe"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 bg-[#0a0e1a] border border-[#1e2942] rounded-lg text-sm text-white focus:outline-none focus:border-[#00d2ff]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-gray-400 mb-1">WORK EMAIL</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
              <input
                type="email"
                required
                placeholder="jane@company.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 bg-[#0a0e1a] border border-[#1e2942] rounded-lg text-sm text-white focus:outline-none focus:border-[#00d2ff]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-gray-400 mb-1">USERNAME</label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
              <input
                type="text"
                required
                placeholder="jdoe"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 bg-[#0a0e1a] border border-[#1e2942] rounded-lg text-sm text-white focus:outline-none focus:border-[#00d2ff]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-gray-400 mb-1">PASSWORD</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 bg-[#0a0e1a] border border-[#1e2942] rounded-lg text-sm text-white focus:outline-none focus:border-[#00d2ff]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-[#00d2ff] text-black font-semibold text-sm hover:bg-[#38e1ff] transition-all flex items-center justify-center gap-2 mt-6"
          >
            {loading ? "Creating..." : "Create Organization & Account"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-gray-400">
          Already have an account? <Link href="/login" className="text-cyan-400 hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
