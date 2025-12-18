"use client";

import { useMemo, useState } from "react";
import { Coins, ArrowUpRight, ArrowDownLeft, Rocket, Percent } from "lucide-react";
import { MOCK_LEDGER, type LedgerEntry } from "@/app/lib/mockData";

export default function WalletPage() {
  const [balance, setBalance] = useState(1820);
  const [ledger] = useState<LedgerEntry[]>(MOCK_LEDGER);
  const rewards = useMemo(() => ledger.filter((l) => l.type === "reward").length, [ledger]);

  const boost = () => setBalance((b) => Math.max(0, b - 25));
  const tip = () => setBalance((b) => Math.max(0, b - 5));

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#080612] via-[#0f0a1e] to-[#030108] text-white">
      <div className="mx-auto max-w-4xl px-4 py-10 space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white/60">$PRIME wallet (mock)</p>
            <h1 className="text-2xl font-semibold">Balances, boosts, and tips</h1>
          </div>
          <div className="rounded-full border border-amber-400/30 bg-amber-500/10 px-3 py-1 text-xs text-amber-200">
            On-chain wiring pending (Polygon/Solana TBD)
          </div>
        </header>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-white/60">Available</p>
              <Coins className="h-5 w-5 text-emerald-300" />
            </div>
            <div className="mt-2 text-3xl font-bold">{balance.toFixed(0)} PRIME</div>
            <p className="text-xs text-white/50">Simulation only; no custody.</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-white/60">Rewards</p>
              <Rocket className="h-5 w-5 text-purple-300" />
            </div>
            <div className="mt-2 text-3xl font-bold">{rewards}</div>
            <p className="text-xs text-white/50">Rewards earned from activity.</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-white/60">APR (mock)</p>
              <Percent className="h-5 w-5 text-sky-300" />
            </div>
            <div className="mt-2 text-3xl font-bold">12.4%</div>
            <p className="text-xs text-white/50">Projected staking yield (simulated).</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-5">
            <h2 className="text-lg font-semibold">Quick actions</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <button
                onClick={boost}
                className="flex items-center justify-center gap-2 rounded-lg bg-purple-600 px-3 py-2 font-semibold hover:bg-purple-700"
              >
                <ArrowUpRight className="h-4 w-4" />
                Boost post (−25)
              </button>
              <button
                onClick={tip}
                className="flex items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/5 px-3 py-2 font-semibold hover:bg-white/10"
              >
                <ArrowDownLeft className="h-4 w-4" />
                Tip creator (−5)
              </button>
              <button className="flex items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/5 px-3 py-2 font-semibold hover:bg-white/10">
                <Coins className="h-4 w-4" />
                Stake PRIME
              </button>
              <button className="flex items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/5 px-3 py-2 font-semibold hover:bg-white/10">
                <Rocket className="h-4 w-4" />
                Claim rewards
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <h2 className="text-lg font-semibold">Activity</h2>
            <div className="mt-3 space-y-3">
              {ledger.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between rounded-xl border border-white/5 bg-black/30 px-3 py-2 text-sm">
                  <div>
                    <p className="font-semibold text-white/90 capitalize">{entry.type}</p>
                    <p className="text-xs text-white/50">{entry.note}</p>
                  </div>
                  <div className="text-right text-white/80">
                    <p className="font-semibold">{entry.amount} PRIME</p>
                    <p className="text-xs text-white/50">{entry.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-xs text-white/60">
          This wallet layer is mocked. When ready, plug in a preferred stack (e.g., Wagmi/RainbowKit on Polygon or Solana wallet adapters) and wire to smart contracts for custody, staking, and settlement.
        </div>
      </div>
    </div>
  );
}
