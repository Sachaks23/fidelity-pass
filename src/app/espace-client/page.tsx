"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";

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
  business: {
    name: string;
    category: string;
    address: string | null;
    cardBgColor: string;
    cardFgColor: string;
    cardAccentColor: string;
    pointsPerEuro: number;
    rewards: Reward[];
  };
}

function QRModal({ card, onClose }: { card: LoyaltyCard; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end justify-center"
      onClick={onClose}
    >
      <div
        className="bg-[#1e293b] rounded-t-3xl w-full max-w-sm border-t border-x border-white/10 p-6 pb-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mb-5" />
        <h3 className="text-white font-bold text-lg text-center mb-1">Votre QR code</h3>
        <p className="text-slate-400 text-sm text-center mb-5">{card.business.name}</p>
        <div className="bg-white rounded-2xl p-5 flex flex-col items-center mb-4">
          <Image
            src={`/api/cards/${card.id}/qr`}
            alt="QR Code"
            width={220}
            height={220}
            className="rounded-xl"
            unoptimized
          />
          <p className="text-slate-600 text-xs mt-3 text-center font-medium">
            Présentez ce code en caisse
          </p>
        </div>
        <p className="text-slate-500 text-xs text-center mb-5">
          📸 Faites une capture d&apos;écran pour l&apos;avoir toujours sous la main
        </p>
        <button
          onClick={onClose}
          className="w-full py-3.5 rounded-2xl bg-white/10 text-white font-semibold hover:bg-white/15 transition-colors"
        >
          Fermer
        </button>
      </div>
    </div>
  );
}

export default function MesCartesPage() {
  const { data: session } = useSession();
  const [cards, setCards] = useState<LoyaltyCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeQR, setActiveQR] = useState<LoyaltyCard | null>(null);

  useEffect(() => {
    fetch("/api/cards")
      .then((r) => r.json())
      .then((d) => {
        setCards(Array.isArray(d) ? d : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-4xl animate-pulse">💳</div>
      </div>
    );

  return (
    <>
      {activeQR && <QRModal card={activeQR} onClose={() => setActiveQR(null)} />}

      <div className="mb-5">
        <h1 className="text-2xl font-bold text-white">Mes cartes</h1>
        <p className="text-slate-400 text-sm mt-0.5">
          {cards.length === 0
            ? "Aucune carte"
            : `${cards.length} carte${cards.length > 1 ? "s" : ""} de fidélité`}
        </p>
      </div>

      {cards.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border border-dashed border-white/10">
          <div className="text-5xl mb-4">💳</div>
          <h2 className="text-lg font-bold text-white mb-2">Aucune carte</h2>
          <p className="text-slate-400 text-sm">Scannez le QR code d&apos;un commerce partenaire.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {cards.map((card) => {
            const rewards = card.business.rewards;
            const nextReward = rewards.find((r) => r.pointsRequired > card.points);
            const unlockedRewards = rewards.filter((r) => r.pointsRequired <= card.points);
            const progressToNext = nextReward
              ? Math.min(100, (card.points / nextReward.pointsRequired) * 100)
              : 100;

            return (
              <div
                key={card.id}
                className="rounded-2xl overflow-hidden border border-white/10 shadow-xl"
                style={{
                  background: `linear-gradient(135deg, ${card.business.cardBgColor}, ${card.business.cardBgColor}cc)`,
                }}
              >
                {/* Header */}
                <div className="px-5 pt-5 flex items-start justify-between">
                  <div>
                    <p
                      className="text-xs uppercase tracking-widest opacity-50 mb-0.5"
                      style={{ color: card.business.cardFgColor }}
                    >
                      Carte de fidélité
                    </p>
                    <p className="text-xl font-bold" style={{ color: card.business.cardFgColor }}>
                      {card.business.name}
                    </p>
                    {card.business.address && (
                      <p className="text-xs opacity-40 mt-0.5" style={{ color: card.business.cardFgColor }}>
                        📍 {card.business.address}
                      </p>
                    )}
                  </div>
                  {/* QR button */}
                  <button
                    onClick={() => setActiveQR(card)}
                    className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl border-2 hover:scale-105 active:scale-95 transition-transform"
                    style={{
                      borderColor: `${card.business.cardAccentColor}60`,
                      background: `${card.business.cardAccentColor}20`,
                    }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-6 h-6" style={{ color: card.business.cardAccentColor }}>
                      <rect x="3" y="3" width="7" height="7" rx="1" />
                      <rect x="14" y="3" width="7" height="7" rx="1" />
                      <rect x="3" y="14" width="7" height="7" rx="1" />
                      <path d="M14 14h2v2h-2zM18 14h3v2h-3zM14 18h2v3h-2zM18 18h3v3h-3z" fill="currentColor" stroke="none" />
                    </svg>
                    <span className="text-xs font-bold" style={{ color: card.business.cardAccentColor }}>
                      Scanner
                    </span>
                  </button>
                </div>

                {/* Points display */}
                <div className="px-5 pt-4 pb-3">
                  <div className="flex items-end gap-1 mb-1">
                    <span className="text-4xl font-black" style={{ color: card.business.cardAccentColor }}>
                      {card.points}
                    </span>
                    <span className="text-lg font-bold mb-1 opacity-70" style={{ color: card.business.cardAccentColor }}>
                      pts
                    </span>
                    <span className="text-xs opacity-40 mb-1.5 ml-1" style={{ color: card.business.cardFgColor }}>
                      {session?.user?.name}
                    </span>
                  </div>

                  {/* Progress to next reward */}
                  {nextReward ? (
                    <div className="mb-2">
                      <div className="flex justify-between items-center mb-1">
                        <p className="text-xs opacity-50" style={{ color: card.business.cardFgColor }}>
                          Prochaine récompense
                        </p>
                        <p className="text-xs font-bold" style={{ color: card.business.cardAccentColor }}>
                          {nextReward.pointsRequired - card.points} pts restants
                        </p>
                      </div>
                      <div className="h-2 rounded-full bg-black/20 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${progressToNext}%`, background: card.business.cardAccentColor }}
                        />
                      </div>
                      <p className="text-xs mt-1 font-medium" style={{ color: card.business.cardFgColor + "aa" }}>
                        🎯 {nextReward.name}
                      </p>
                    </div>
                  ) : rewards.length > 0 ? (
                    <p className="text-xs font-bold text-green-400 mb-2">
                      🎉 Toutes les récompenses débloquées !
                    </p>
                  ) : null}
                </div>

                {/* Reward tiers */}
                {rewards.length > 0 && (
                  <div className="px-5 pb-3">
                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                      {rewards.map((reward) => {
                        const unlocked = card.points >= reward.pointsRequired;
                        return (
                          <div
                            key={reward.id}
                            className="flex-shrink-0 flex flex-col items-center gap-1 px-3 py-2 rounded-xl border min-w-[80px] text-center"
                            style={
                              unlocked
                                ? {
                                    borderColor: `${card.business.cardAccentColor}60`,
                                    background: `${card.business.cardAccentColor}20`,
                                  }
                                : { borderColor: `${card.business.cardFgColor}15`, background: "rgba(0,0,0,0.15)" }
                            }
                          >
                            <span className="text-lg">{unlocked ? "🏆" : "🔒"}</span>
                            <span
                              className="text-xs font-bold leading-tight"
                              style={{ color: unlocked ? card.business.cardAccentColor : card.business.cardFgColor + "60" }}
                            >
                              {reward.pointsRequired} pts
                            </span>
                            <span
                              className="text-xs leading-tight line-clamp-2"
                              style={{ color: unlocked ? card.business.cardFgColor : card.business.cardFgColor + "50" }}
                            >
                              {reward.name}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Bottom CTAs */}
                <div className="mx-4 mb-4 flex flex-col gap-2">
                  <div
                    className="rounded-2xl py-3.5 flex items-center justify-center gap-2 font-semibold text-sm cursor-pointer hover:opacity-90 active:scale-95 transition-all"
                    style={{ background: card.business.cardAccentColor, color: "#000" }}
                    onClick={() => setActiveQR(card)}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4">
                      <rect x="3" y="3" width="7" height="7" rx="1" />
                      <rect x="14" y="3" width="7" height="7" rx="1" />
                      <rect x="3" y="14" width="7" height="7" rx="1" />
                      <path d="M14 14h2v2h-2zM18 14h3v2h-3zM14 18h2v3h-2zM18 18h3v3h-3z" fill="currentColor" stroke="none" />
                    </svg>
                    Afficher mon QR code
                  </div>

                  <div className="flex gap-2">
                    <div className="flex-1 rounded-xl py-3 flex items-center justify-center gap-2 bg-black border border-white/15 cursor-not-allowed opacity-60 relative group">
                      <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4">
                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                      </svg>
                      <span className="text-white text-xs font-semibold">Apple Wallet</span>
                      <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-800 text-slate-300 text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-white/10">
                        Bientôt disponible
                      </span>
                    </div>
                    <div className="flex-1 rounded-xl py-3 flex items-center justify-center gap-2 bg-[#1a73e8] border border-[#1a73e8] cursor-not-allowed opacity-60 relative group">
                      <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4">
                        <path d="M21.56 10.738l-.008-.05H12.25v3.027h5.322c-.23 1.22-.93 2.254-1.98 2.942v2.44h3.207c1.876-1.727 2.96-4.274 2.96-7.302 0-.36-.02-.716-.198-1.057z"/>
                        <path d="M12.25 22c2.67 0 4.911-.883 6.55-2.396l-3.207-2.44c-.89.6-2.03.95-3.343.95-2.573 0-4.753-1.737-5.532-4.072H3.4v2.52C5.03 20.108 8.432 22 12.25 22z"/>
                        <path d="M6.718 14.042A6.75 6.75 0 0 1 6.33 12c0-.706.12-1.39.338-2.03V7.45H3.4A9.992 9.992 0 0 0 2.25 12c0 1.61.386 3.133 1.07 4.482l3.398-2.44z"/>
                        <path d="M12.25 5.898c1.45 0 2.75.498 3.773 1.476l2.83-2.83C17.154 2.896 14.915 2 12.25 2 8.432 2 5.03 3.892 3.4 7.45l3.318 2.52c.779-2.335 2.96-4.072 5.532-4.072z"/>
                      </svg>
                      <span className="text-white text-xs font-semibold">Google Wallet</span>
                      <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-800 text-slate-300 text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-white/10">
                        Bientôt disponible
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
