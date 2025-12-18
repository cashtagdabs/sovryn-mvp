"use client";

import { useMemo, useState } from "react";
import { ShoppingBag, Star, Shield, Crown, Download, Sparkles } from "lucide-react";
import { MOCK_MODELS, type ModelAsset } from "@/app/lib/mockData";
import { formatNumber } from "@/app/lib/utils";

const licenseLabel = {
  COMMERCIAL: "Commercial",
  NON_COMMERCIAL: "Non-commercial",
};

export default function MarketplacePage() {
  const [selected, setSelected] = useState<ModelAsset | null>(MOCK_MODELS[0] || null);
  const premiumTags = useMemo(() => new Set(["multimodal", "safety", "edge"]), []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#06060d] via-[#0e0a1b] to-[#020106] text-white">
      <div className="mx-auto max-w-6xl px-4 py-10 space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-sm text-white/60">Model marketplace (mock)</p>
            <h1 className="text-2xl font-semibold">Discover, fork, and collect models</h1>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1 text-xs">
            <Shield className="h-4 w-4 text-emerald-300" />
            Smart-contract and custody wiring pending
          </div>
        </header>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="space-y-3 lg:col-span-2">
            {MOCK_MODELS.map((model) => (
              <button
                key={model.id}
                onClick={() => setSelected(model)}
                className="w-full rounded-2xl border border-white/10 bg-white/5 p-4 text-left transition hover:border-purple-400/60 hover:bg-white/10"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-semibold text-white">{model.name}</span>
                      {premiumTags.has(model.tags[0]) && (
                        <Crown className="h-4 w-4 text-amber-300" />
                      )}
                    </div>
                    <p className="text-sm text-white/60">by {model.author}</p>
                    <p className="mt-2 text-sm text-white/80 line-clamp-2">{model.description}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {model.tags.map((tag) => (
                        <span key={tag} className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/70">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right text-sm text-white/80">
                    <div className="flex items-center justify-end gap-1 text-yellow-300">
                      <Star className="h-4 w-4" />
                      {model.rating.toFixed(1)}
                    </div>
                    <div className="text-xs text-white/50">{formatNumber(model.downloads)} downloads</div>
                    <div className="mt-2 inline-flex rounded-full bg-purple-500/15 px-3 py-1 text-xs text-purple-200">
                      {licenseLabel[model.license]}
                    </div>
                    <div className="mt-2 text-sm font-semibold">
                      {model.price === 0 ? "Free" : `${model.price} ${model.currency}`}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <aside className="rounded-2xl border border-white/10 bg-white/5 p-5">
            {!selected ? (
              <p className="text-sm text-white/60">Select a model to view details.</p>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-white/50">Model</p>
                    <h2 className="text-lg font-semibold">{selected.name}</h2>
                    <p className="text-sm text-white/60">by {selected.author}</p>
                  </div>
                  <div className="rounded-full bg-purple-500/15 px-3 py-1 text-xs text-purple-200">
                    v{selected.version}
                  </div>
                </div>
                <p className="text-sm text-white/80">{selected.description}</p>
                <div className="flex items-center gap-2 text-sm text-white/70">
                  <Star className="h-4 w-4 text-yellow-300" />
                  {selected.rating.toFixed(1)} · {formatNumber(selected.downloads)} downloads
                </div>
                <div className="space-y-2">
                  <p className="text-xs text-white/50">Sample capabilities</p>
                  <ul className="space-y-2 text-sm text-white/80">
                    {selected.samples.map((sample) => (
                      <li key={sample} className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-purple-300" /> {sample}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-xl border border-white/10 bg-black/40 p-4 text-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-white/50">License</p>
                      <p className="font-semibold">{licenseLabel[selected.license]}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-white/50">Price</p>
                      <p className="text-lg font-semibold">
                        {selected.price === 0 ? "Free" : `${selected.price} ${selected.currency}`}
                      </p>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-white/50">Smart contracts pending; actions are mocked locally.</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button className="flex items-center justify-center gap-2 rounded-lg bg-purple-600 px-3 py-2 text-sm font-semibold hover:bg-purple-700">
                    <ShoppingBag className="h-4 w-4" /> Purchase
                  </button>
                  <button className="flex items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm hover:bg-white/10">
                    <Download className="h-4 w-4" /> Fork
                  </button>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/60">
                  Upgrade to on-chain settlement when ready; royalties and provenance will be enforced via ERC-721/1155.
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
