"use client";

import { useMemo } from "react";
import { CheckCircle2, Clock, XCircle, Vote } from "lucide-react";
import { MOCK_PROPOSALS } from "@/app/lib/mockData";
import { formatNumber } from "@/app/lib/utils";

export default function GovernancePage() {
  const active = useMemo(() => MOCK_PROPOSALS.filter((p) => p.status === "ACTIVE"), []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#070611] via-[#0d0a1c] to-[#030208] text-white">
      <div className="mx-auto max-w-4xl px-4 py-10 space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white/60">DAO preview (mock)</p>
            <h1 className="text-2xl font-semibold">Governance & voting</h1>
          </div>
          <div className="rounded-full border border-sky-400/40 bg-sky-500/10 px-3 py-1 text-xs text-sky-200">
            On-chain voting to be wired later
          </div>
        </header>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <h2 className="text-lg font-semibold">Active proposals</h2>
          {active.length === 0 ? (
            <p className="mt-3 text-sm text-white/60">No active proposals.</p>
          ) : (
            <div className="mt-4 space-y-3">
              {active.map((proposal) => (
                <div
                  key={proposal.id}
                  className="rounded-xl border border-white/10 bg-black/30 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs text-white/50">Ends {proposal.endsAt}</p>
                      <h3 className="text-lg font-semibold">{proposal.title}</h3>
                      <p className="text-sm text-white/70">{proposal.summary}</p>
                    </div>
                    <button className="rounded-lg bg-purple-600 px-3 py-2 text-sm font-semibold hover:bg-purple-700">
                      Cast vote (mock)
                    </button>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
                    <VoteBar label="For" value={proposal.forVotes} tone="emerald" />
                    <VoteBar label="Against" value={proposal.againstVotes} tone="rose" />
                    <VoteBar label="Abstain" value={proposal.abstainVotes} tone="slate" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <h2 className="text-lg font-semibold">History</h2>
          <div className="mt-3 space-y-3">
            {MOCK_PROPOSALS.map((proposal) => (
              <div key={proposal.id} className="flex items-start gap-3 rounded-xl border border-white/10 bg-black/30 p-4 text-sm">
                <StatusIcon status={proposal.status} />
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <h3 className="font-semibold">{proposal.title}</h3>
                      <p className="text-xs text-white/50">{proposal.summary}</p>
                    </div>
                    <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-white/60">
                      {proposal.status}
                    </span>
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-white/70">
                    <VoteBar label="For" value={proposal.forVotes} tone="emerald" compact />
                    <VoteBar label="Against" value={proposal.againstVotes} tone="rose" compact />
                    <VoteBar label="Abstain" value={proposal.abstainVotes} tone="slate" compact />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-xs text-white/60">
          When ready, wire this view to your governance stack (e.g., Polygon with Snapshot + on-chain execution). The UI is ready for proposal feeds, vote payloads, and status callbacks.
        </div>
      </div>
    </div>
  );
}

function VoteBar({
  label,
  value,
  tone,
  compact = false,
}: {
  label: string;
  value: number;
  tone: "emerald" | "rose" | "slate";
  compact?: boolean;
}) {
  const colors: Record<string, string> = {
    emerald: "bg-emerald-500/20 text-emerald-200",
    rose: "bg-rose-500/20 text-rose-200",
    slate: "bg-slate-500/20 text-slate-200",
  };

  return (
    <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
      <div className="flex items-center justify-between text-xs text-white/60">
        <span>{label}</span>
        {!compact && <span>{formatNumber(value)}</span>}
      </div>
      {!compact && (
        <div className={`mt-2 h-2 rounded-full ${colors[tone]}`} style={{ width: "100%" }} />
      )}
    </div>
  );
}

function StatusIcon({ status }: { status: string }) {
  if (status === "PASSED") return <CheckCircle2 className="h-5 w-5 text-emerald-300" />;
  if (status === "DEFEATED") return <XCircle className="h-5 w-5 text-rose-300" />;
  if (status === "ACTIVE") return <Clock className="h-5 w-5 text-amber-300" />;
  return <Vote className="h-5 w-5 text-slate-300" />;
}
