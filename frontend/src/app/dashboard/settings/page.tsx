"use client";

import { useState } from "react";
import { Settings, Key, Building, ShieldCheck, Copy, Check } from "lucide-react";
import { Topnav } from "@/components/layout/topnav";

export default function SettingsPage() {
  const [copied, setCopied] = useState(false);
  const apiKey = "sntl_live_demo_key_77a92b3c4d5e6f";

  const copyKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 pb-16">
      <Topnav title="Organization Settings" />

      <div className="px-8 pt-8 space-y-8 max-w-7xl mx-auto ml-64">
        {/* Org Profile Card */}
        <div className="bg-[#0f1629] border border-[#1a2236] rounded-xl p-6">
          <h3 className="text-sm font-semibold text-white uppercase font-mono tracking-wider mb-6">
            ORGANIZATION PROFILE
          </h3>
          <div className="grid md:grid-cols-2 gap-6 text-xs font-mono">
            <div>
              <label className="text-gray-500 block mb-1">ORGANIZATION NAME</label>
              <input
                disabled
                value="SentinelOps Corp"
                className="w-full px-4 py-2 bg-[#0a0e1a] border border-[#1e293b] rounded-lg text-white"
              />
            </div>
            <div>
              <label className="text-gray-500 block mb-1">ORGANIZATION SLUG</label>
              <input
                disabled
                value="sentinelops-corp"
                className="w-full px-4 py-2 bg-[#0a0e1a] border border-[#1e293b] rounded-lg text-gray-400"
              />
            </div>
          </div>
        </div>

        {/* API Credentials Card */}
        <div className="bg-[#0f1629] border border-[#1a2236] rounded-xl p-6">
          <div className="flex items-center gap-2 mb-2">
            <Key className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-white uppercase font-mono tracking-wider">
              ORGANIZATION INGESTION API KEY
            </h3>
          </div>
          <p className="text-xs text-gray-400 mb-4">
            Passed as <code className="text-cyan-400 font-mono">X-API-Key</code> on all outbound collector transmissions.
          </p>

          <div className="flex items-center gap-2 max-w-xl">
            <input
              readOnly
              value={apiKey}
              className="flex-1 px-4 py-2.5 bg-[#0a0e1a] border border-[#1e293b] rounded-lg text-xs font-mono text-cyan-400"
            />
            <button
              onClick={copyKey}
              className="px-4 py-2.5 bg-[#141d33] border border-[#1e293b] hover:bg-[#1a2747] text-gray-300 text-xs rounded-lg flex items-center gap-1.5 font-mono"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>

        {/* Privacy Enforcement Policy */}
        <div className="bg-[#0f1629] border border-[#1a2236] rounded-xl p-6">
          <h3 className="text-sm font-semibold text-white uppercase font-mono tracking-wider mb-2">
            DATA POLICY ENFORCEMENT
          </h3>
          <p className="text-xs text-gray-400 mb-4">
            Active data boundary configuration applied across all enrolled collectors:
          </p>
          <div className="p-4 rounded-lg bg-[#0a0e1a] border border-[#1e293b] space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between text-gray-300">
              <span>Fail-Closed Field Rejection</span>
              <span className="text-emerald-400 font-bold">STRICTLY ENABLED</span>
            </div>
            <div className="flex items-center justify-between text-gray-300">
              <span>Automatic PII Redaction Pattern Engine</span>
              <span className="text-emerald-400 font-bold">ACTIVE (9 PATTERNS)</span>
            </div>
            <div className="flex items-center justify-between text-gray-300">
              <span>HMAC-SHA256 Payload Signature Verification</span>
              <span className="text-emerald-400 font-bold">MANDATORY</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
