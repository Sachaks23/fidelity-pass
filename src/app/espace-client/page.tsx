"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import type { Badge } from "@/lib/badges";

interface Reward {
  id: string;
  name: string;
  description: string | null;
  pointsRequired: number;
  isActive: boolean;
}

interface LoyaltyCard {
  id: string;
  serialNumber: string;
  points: number;
  totalPointsEarned: number;
  issuedAt: string;
  lastScanDate: string | null;
  scanCount: number;
  badges: Badge[];
  business: {
    name: string;
    category: string;
    address: string | null;
    cardBgColor: string;
    cardFgColor: string;
    cardAccentColor: string;
    cardLogoUrl: string | null;
    pointsPerEuro: number;
    rewards: Reward[];
  };
}

function BadgeItem({ badge }: { badge: Badge }) {
  return (
    <div
      className="flex flex-col items-center gap-1.5 px-3 py-2.5 rounded-xl text-center min-w-[72px]"
      style={{
        background: badge.unlocked ? badge.bg : "rgba(255,255,255,0.03)",
        border: `1px solid ${badge.unlocked ? badge.border : "rgba(255,255,255,0.06)"}`,
        opacity: badge.unlocked ? 1 : 0.45,
      }}
      title={badge.description}
    >
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center"
        style={{ background: badge.unlocked ? badge.bg : "rgba(255,255,255,0.04)" }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke={badge.unlocked ? badge.color : "#475569"} strokeWidth={1.5} className="w-4 h-4" strokeLinecap="round" strokeLinejoin="round">
          <path d={badge.svgPath} />
        </svg>
      </div>
      <span className="text-xs font-semibold leading-tight" style={{ color: badge.unlocked ? badge.color : "#475569" }}>
        {badge.label}
      </span>
    </div>
  );
}

function QRModal({ card, customerName, onClose }: { card: LoyaltyCard; customerName: string; onClose: () => void }) {
  const qrUrl = `/api/cards/${card.id}/qr`;

  async function handleShare() {
    if (navigator.share) {
      try {
        const resp = await fetch(qrUrl);
        const blob = await resp.blob();
        const file = new File([blob], "ma-carte-fidelite.png", { type: "image/png" });
        await navigator.share({ title: `Ma carte ${card.business.name}`, files: [file] });
      } catch {
        // fallback silent
      }
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <div
        className="rounded-t-3xl w-full max-w-sm border-t border-x p-6 pb-10"
        style={{ background: "#0f172a", borderColor: "rgba(255,255,255,0.1)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mb-5" />
        <h3 className="text-white font-bold text-lg text-center mb-0.5">Mon QR code</h3>
        <p className="text-slate-400 text-sm text-center mb-5">{card.business.name}</p>

        <div className="bg-white rounded-2xl p-5 flex flex-col items-center mb-4">
          <Image
            src={qrUrl}
            alt="QR Code"
            width={220}
            height={220}
            className="rounded-xl"
            unoptimized
          />
          <p className="text-slate-500 text-xs mt-3 text-center font-medium">
            Présentez ce code en caisse
          </p>
        </div>

        <p className="text-slate-500 text-xs text-center mb-4">
          {card.points} pts disponibles · {card.scanCount} visite{card.scanCount !== 1 ? "s" : ""}
        </p>

        <div className="flex gap-2 mb-3">
          {typeof navigator !== "undefined" && "share" in navigator && (
            <button
              onClick={handleShare}
              className="flex-1 py-3 rounded-2xl flex items-center justify-center gap-2 text-sm font-semibold transition-colors"
              style={{ background: "rgba(245,158,11,0.15)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.25)" }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" strokeLinecap="round" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" strokeLinecap="round" />
              </svg>
              Partager
            </button>
          )}
          <a
            href={qrUrl}
            download={`carte-${card.business.name}.png`}
            className="flex-1 py-3 rounded-2xl flex items-center justify-center gap-2 text-sm font-semibold transition-colors"
            style={{ background: "rgba(255,255,255,0.07)", color: "white", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" strokeLinecap="round" />
              <polyline points="7 10 12 15 17 10" strokeLinecap="round" />
              <line x1="12" y1="15" x2="12" y2="3" strokeLinecap="round" />
            </svg>
            Télécharger
          </a>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-2xl text-sm font-medium transition-colors"
          style={{ background: "rgba(255,255,255,0.06)", color: "#94a3b8" }}
        >
          Fermer
        </button>
      </div>
    </div>
  );
}

function LoyaltyCardVisual({
  card,
  customerName,
  onShowQR,
}: {
  card: LoyaltyCard;
  customerName: string;
  onShowQR: () => void;
}) {
  const { cardBgColor, cardFgColor, cardAccentColor, cardLogoUrl, name } = card.business;
  const isDark = cardBgColor !== "#ffffff";
  const qrBg = isDark ? "rgba(255,255,255,0.95)" : "rgba(0,0,0,0.06)";

  return (
    <div
      className="relative rounded-2xl overflow-hidden shadow-2xl cursor-pointer active:scale-95 transition-transform select-none"
      style={{ background: `linear-gradient(135deg, ${cardBgColor}, ${cardBgColor}cc)`, width: "100%", aspectRatio: "1.586 / 1" }}
      onClick={onShowQR}
    >
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 50%, rgba(0,0,0,0.2) 100%)" }} />

      {/* Top: logo + nom */}
      <div className="absolute top-4 left-0 right-0 flex flex-col items-center gap-1 px-4">
        {cardLogoUrl ? (
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-white/10 flex items-center justify-center shadow-md">
            <img src={cardLogoUrl} alt="Logo" className="w-full h-full object-contain p-0.5" />
          </div>
        ) : (
          <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shadow-md" style={{ background: cardAccentColor, color: cardBgColor }}>
            {name?.[0]?.toUpperCase() || "F"}
          </div>
        )}
        <p className="text-xs font-bold tracking-wide" style={{ color: `${cardFgColor}cc` }}>{name}</p>
      </div>

      {/* Center: QR tap hint */}
      <div className="absolute inset-0 flex items-center justify-center mt-8">
        <div className="rounded-xl p-2 shadow-lg flex flex-col items-center gap-1" style={{ background: qrBg }}>
          <svg viewBox="0 0 24 24" fill="none" stroke={cardBgColor} strokeWidth={2} className="w-12 h-12 opacity-80">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <path d="M14 14h2v2h-2zM18 14h3v2h-3zM14 18h2v3h-2zM18 18h3v3h-3z" fill={cardBgColor} stroke="none" />
          </svg>
          <p className="text-xs font-bold px-2 pb-1" style={{ color: cardBgColor }}>Appuyez pour scanner</p>
        </div>
      </div>

      {/* Bottom: nom + points */}
      <div className="absolute bottom-0 left-0 right-0 px-4 py-3 flex items-end justify-between">
        <div>
          <p className="text-xs opacity-40 mb-0.5 leading-none uppercase tracking-wider" style={{ color: cardFgColor }}>Client</p>
          <p className="text-sm font-bold leading-tight" style={{ color: cardFgColor }}>{customerName}</p>
        </div>
        <div className="text-right">
          <p className="text-xs opacity-40 mb-0.5 leading-none uppercase tracking-wider" style={{ color: cardFgColor }}>Points</p>
          <p className="text-xl font-black leading-tight" style={{ color: cardAccentColor }}>
            {card.points} <span className="text-sm font-bold opacity-70">pts</span>
          </p>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-0.5 opacity-30" style={{ background: cardAccentColor }} />
    </div>
  );
}

export default function MesCartesPage() {
  const { data: session } = useSession();
  const [cards, setCards] = useState<LoyaltyCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeQR, setActiveQR] = useState<LoyaltyCard | null>(null);
  const [newBadges, setNewBadges] = useState<Badge[]>([]);

  const customerName = session?.user?.name || "Client";

  useEffect(() => {
    fetch("/api/cards")
      .then((r) => r.json())
      .then((d) => {
        const arr = Array.isArray(d) ? d : [];
        setCards(arr);
        setLoading(false);

        // Detect newly unlocked badges (store seen in sessionStorage)
        const key = "seen_badges";
        const seen: string[] = JSON.parse(sessionStorage.getItem(key) || "[]");
        const allBadges = arr.flatMap((c: LoyaltyCard) => c.badges.filter((b) => b.unlocked));
        const fresh = allBadges.filter((b) => !seen.includes(b.id));
        if (fresh.length > 0) {
          setNewBadges(fresh.slice(0, 2));
          const ids = [...new Set([...seen, ...allBadges.map((b: Badge) => b.id)])];
          sessionStorage.setItem(key, JSON.stringify(ids));
          setTimeout(() => setNewBadges([]), 4000);
        }
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  // Total badges unlocked
  const allBadges = cards.flatMap((c) => c.badges);
  const unlockedCount = allBadges.filter((b) => b.unlocked).length;
  const uniqueBadges = allBadges.reduce((acc: Badge[], b) => {
    if (!acc.find((x) => x.id === b.id)) acc.push(b);
    return acc;
  }, []);

  return (
    <>
      {/* Badge notification toast */}
      {newBadges.length > 0 && (
        <div className="fixed top-16 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
          <div className="rounded-2xl px-4 py-3 shadow-2xl flex items-center gap-3 animate-bounce"
            style={{ background: "rgba(15,23,42,0.95)", border: "1px solid rgba(245,158,11,0.3)", backdropFilter: "blur(10px)" }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "rgba(245,158,11,0.15)", color: "#f59e0b" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </div>
            <div>
              <p className="text-white text-xs font-bold">Badge débloqué !</p>
              <p className="text-amber-400 text-xs">{newBadges[0].label}</p>
            </div>
          </div>
        </div>
      )}

      {activeQR && (
        <QRModal card={activeQR} customerName={customerName} onClose={() => setActiveQR(null)} />
      )}

      <div className="mb-5">
        <h1 className="text-2xl font-bold text-white">Mes cartes</h1>
        <p className="text-slate-400 text-sm mt-0.5">
          {cards.length === 0
            ? "Aucune carte"
            : `${cards.length} carte${cards.length > 1 ? "s" : ""} de fidélité`}
        </p>
      </div>

      {/* Badges globaux */}
      {cards.length > 0 && uniqueBadges.length > 0 && (
        <div className="rounded-2xl p-4 mb-5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-white">Mes badges</p>
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: "rgba(245,158,11,0.12)", color: "#f59e0b" }}>
              {unlockedCount}/{uniqueBadges.length}
            </span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {uniqueBadges.map((badge) => (
              <BadgeItem key={badge.id} badge={badge} />
            ))}
          </div>
        </div>
      )}

      {cards.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border border-dashed border-white/10">
          <div className="w-16 h-16 rounded-2xl gold-gradient flex items-center justify-center text-black font-bold text-2xl mx-auto mb-4">FC</div>
          <h2 className="text-lg font-bold text-white mb-2">Aucune carte</h2>
          <p className="text-slate-400 text-sm">Scannez le QR code d&apos;un commerce partenaire.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {cards.map((card) => {
            const rewards = card.business.rewards;
            const nextReward = rewards.find((r) => r.pointsRequired > card.points);
            const progressToNext = nextReward ? Math.min(100, (card.points / nextReward.pointsRequired) * 100) : 100;
            const { cardBgColor, cardFgColor, cardAccentColor } = card.business;

            return (
              <div key={card.id} className="space-y-3">
                <LoyaltyCardVisual card={card} customerName={customerName} onShowQR={() => setActiveQR(card)} />

                {/* Progression */}
                {nextReward && (
                  <div className="rounded-xl px-4 py-3 border border-white/10" style={{ background: `${cardBgColor}33` }}>
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-xs text-slate-400">Prochaine récompense</p>
                      <p className="text-xs font-bold" style={{ color: cardAccentColor }}>
                        {nextReward.pointsRequired - card.points} pts restants
                      </p>
                    </div>
                    <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${progressToNext}%`, background: cardAccentColor }} />
                    </div>
                    <p className="text-xs mt-1.5 font-medium text-slate-400">{nextReward.name}</p>
                  </div>
                )}

                {rewards.length > 0 && !nextReward && (
                  <p className="text-xs font-bold text-green-400 text-center py-2">Toutes les récompenses débloquées !</p>
                )}

                {/* Récompenses */}
                {rewards.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {rewards.map((reward) => {
                      const unlocked = card.points >= reward.pointsRequired;
                      return (
                        <div key={reward.id}
                          className="flex-shrink-0 flex flex-col items-center gap-1 px-3 py-2 rounded-xl border min-w-[80px] text-center"
                          style={unlocked
                            ? { borderColor: `${cardAccentColor}60`, background: `${cardAccentColor}20` }
                            : { borderColor: `${cardFgColor}15`, background: "rgba(0,0,0,0.15)" }
                          }
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke={unlocked ? cardAccentColor : `${cardFgColor}50`} strokeWidth={1.5} className="w-5 h-5">
                            <polyline points="20 12 20 22 4 22 4 12" />
                            <rect x="2" y="7" width="20" height="5" rx="1" />
                            <line x1="12" y1="22" x2="12" y2="7" />
                            <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
                            <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
                          </svg>
                          <span className="text-xs font-bold leading-tight" style={{ color: unlocked ? cardAccentColor : `${cardFgColor}60` }}>
                            {reward.pointsRequired} pts
                          </span>
                          <span className="text-xs leading-tight line-clamp-2" style={{ color: unlocked ? cardFgColor : `${cardFgColor}50` }}>
                            {reward.name}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Stats rapides */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "Visites", value: card.scanCount },
                    { label: "Points cumulés", value: card.totalPointsEarned },
                    { label: "Depuis", value: new Date(card.issuedAt).toLocaleDateString("fr-FR", { month: "short", year: "2-digit" }) },
                  ].map(({ label, value }) => (
                    <div key={label} className="rounded-xl py-2.5 px-3 text-center" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                      <p className="text-white font-bold text-sm">{value}</p>
                      <p className="text-slate-500 text-xs mt-0.5">{label}</p>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <button
                  onClick={() => setActiveQR(card)}
                  className="w-full py-3.5 rounded-2xl flex items-center justify-center gap-2 font-semibold text-sm hover:opacity-90 active:scale-95 transition-all"
                  style={{ background: cardAccentColor, color: cardBgColor }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4">
                    <rect x="3" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="3" width="7" height="7" rx="1" />
                    <rect x="3" y="14" width="7" height="7" rx="1" />
                    <path d="M14 14h2v2h-2zM18 14h3v2h-3zM14 18h2v3h-2zM18 18h3v3h-3z" fill="currentColor" stroke="none" />
                  </svg>
                  Afficher mon QR code
                </button>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
