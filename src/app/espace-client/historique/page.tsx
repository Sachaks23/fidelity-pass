"use client";
import { useState, useEffect } from "react";

interface Transaction {
  id: string;
  type: string;
  stampsDelta: number;
  note: string | null;
  createdAt: string;
  card: {
    business: { name: string; cardAccentColor: string };
  };
}

const typeConfig: Record<string, { label: string; icon: string; color: string; bg: string }> = {
  STAMP:      { label: "Tampon ajouté",      icon: "⭐", color: "text-amber-400",  bg: "bg-amber-500/10 border-amber-500/20" },
  REWARD:     { label: "Récompense gagnée",  icon: "🎁", color: "text-green-400",  bg: "bg-green-500/10 border-green-500/20" },
  ADJUSTMENT: { label: "Ajustement",         icon: "✏️", color: "text-blue-400",   bg: "bg-blue-500/10 border-blue-500/20"  },
};

function groupByDate(txs: Transaction[]): Record<string, Transaction[]> {
  return txs.reduce((acc, tx) => {
    const day = new Date(tx.createdAt).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    const key = day.charAt(0).toUpperCase() + day.slice(1);
    if (!acc[key]) acc[key] = [];
    acc[key].push(tx);
    return acc;
  }, {} as Record<string, Transaction[]>);
}

export default function HistoriquePage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "STAMP" | "REWARD">("ALL");

  useEffect(() => {
    fetch("/api/customer/transactions")
      .then(r => r.json())
      .then(d => { setTransactions(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = filter === "ALL" ? transactions : transactions.filter(t => t.type === filter);
  const grouped = groupByDate(filtered);
  const stampCount = transactions.filter(t => t.type === "STAMP").length;
  const rewardCount = transactions.filter(t => t.type === "REWARD").length;

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Historique</h1>
        <p className="text-slate-400 text-sm mt-1">{transactions.length} transaction{transactions.length > 1 ? "s" : ""}</p>
      </div>

      {/* Résumé */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 text-center">
          <p className="text-3xl font-bold text-amber-400">{stampCount}</p>
          <p className="text-slate-400 text-xs mt-1">Tampons obtenus</p>
        </div>
        <div className="p-4 rounded-xl border border-green-500/20 bg-green-500/5 text-center">
          <p className="text-3xl font-bold text-green-400">{rewardCount}</p>
          <p className="text-slate-400 text-xs mt-1">Récompenses gagnées</p>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex gap-2 mb-6">
        {([["ALL", "Tout"], ["STAMP", "⭐ Tampons"], ["REWARD", "🎁 Récompenses"]] as const).map(([val, label]) => (
          <button key={val} onClick={() => setFilter(val)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              filter === val ? "gold-gradient text-black" : "border border-white/10 text-slate-400 hover:bg-white/5"
            }`}>
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-10 text-slate-500">Chargement...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border border-dashed border-white/10">
          <div className="text-4xl mb-3">📋</div>
          <p className="text-slate-400">Aucune transaction</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([date, txs]) => (
            <div key={date}>
              <p className="text-slate-500 text-xs font-medium uppercase tracking-widest mb-3">{date}</p>
              <div className="space-y-2">
                {txs.map(tx => {
                  const cfg = typeConfig[tx.type] || typeConfig.ADJUSTMENT;
                  return (
                    <div key={tx.id} className={`flex items-center gap-3 p-4 rounded-xl border ${cfg.bg}`}>
                      <span className="text-2xl">{cfg.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className={`font-semibold text-sm ${cfg.color}`}>{cfg.label}</p>
                        <p className="text-slate-500 text-xs truncate">{tx.card.business.name}</p>
                        {tx.note && <p className="text-slate-400 text-xs mt-0.5">{tx.note}</p>}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className={`font-bold text-sm ${cfg.color}`}>
                          {tx.stampsDelta > 0 ? `+${tx.stampsDelta}` : tx.stampsDelta}
                        </p>
                        <p className="text-slate-600 text-xs">
                          {new Date(tx.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
