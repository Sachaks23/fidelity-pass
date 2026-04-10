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
    cardLogoUrl: string | null;
    pointsPerEuro: number;
    rewards: Reward[];
  };
}

function QRModal({ card, customerName, onClose }: { card: LoyaltyCard; customerName: string; onClose: () => void }) {
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

// The loyalty card visual
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
      className="relative rounded-2xl overflow-hidden shadow-2xl cursor-pointer active:scale-95 transition-transform"
      style={{
        background: `linear-gradient(135deg, ${cardBgColor}, ${cardBgColor}cc)`,
        width: "100%",
        aspectRatio: "1.586 / 1",
      }}
      onClick={onShowQR}
    >
      {/* Shine */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          background: "linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 50%, rgba(0,0,0,0.2) 100%)",
        }}
      />

      {/* Top center: logo + nom commerce */}
      <div className="absolute top-4 left-0 right-0 flex flex-col items-center gap-1 px-4">
        {cardLogoUrl ? (
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-white/10 flex items-center justify-center shadow-md">
            <img src={cardLogoUrl} alt="Logo" className="w-full h-full object-contain p-0.5" />
          </div>
        ) : (
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shadow-md"
            style={{ background: cardAccentColor, color: cardBgColor }}
          >
            {name?.[0]?.toUpperCase() || "F"}
          </div>
        )}
        <p className="text-xs font-bold tracking-wide" style={{ color: `${cardFgColor}cc` }}>
          {name}
        </p>
      </div>

      {/* Center: QR code tap hint */}
      <div className="absolute inset-0 flex items-center justify-center mt-8">
        <div
          className="rounded-xl p-2 shadow-lg flex flex-col items-center gap-1"
          style={{ background: qrBg }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke={cardBgColor} strokeWidth={2} className="w-12 h-12 opacity-80">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <path d="M14 14h2v2h-2zM18 14h3v2h-3zM14 18h2v3h-2zM18 18h3v3h-3z" fill={cardBgColor} stroke="none" />
          </svg>
          <p className="text-xs font-bold px-2 pb-1" style={{ color: cardBgColor }}>
            Appuyez pour scanner
          </p>
        </div>
      </div>

      {/* Bottom: name left, points right */}
      <div className="absolute bottom-0 left-0 right-0 px-4 py-3 flex items-end justify-between">
        <div>
          <p className="text-xs opacity-40 mb-0.5 leading-none uppercase tracking-wider" style={{ color: cardFgColor }}>
            Client
          </p>
          <p className="text-sm font-bold leading-tight" style={{ color: cardFgColor }}>
            {customerName}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs opacity-40 mb-0.5 leading-none uppercase tracking-wider" style={{ color: cardFgColor }}>
            Points
          </p>
          <p className="text-xl font-black leading-tight" style={{ color: cardAccentColor }}>
            {card.points} <span className="text-sm font-bold opacity-70">pts</span>
          </p>
        </div>
      </div>

      {/* Bottom accent line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-0.5 opacity-30"
        style={{ background: cardAccentColor }}
      />
    </div>
  );
}

export default function MesCartesPage() {
  const { data: session } = useSession();
  const [cards, setCards] = useState<LoyaltyCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeQR, setActiveQR] = useState<LoyaltyCard | null>(null);

  const customerName = session?.user?.name || "Client";

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
      {activeQR && (
        <QRModal
          card={activeQR}
          customerName={customerName}
          onClose={() => setActiveQR(null)}
        />
      )}

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
        <div className="space-y-6">
          {cards.map((card) => {
            const rewards = card.business.rewards;
            const nextReward = rewards.find((r) => r.pointsRequired > card.points);
            const progressToNext = nextReward
              ? Math.min(100, (card.points / nextReward.pointsRequired) * 100)
              : 100;
            const { cardBgColor, cardFgColor, cardAccentColor } = card.business;

            return (
              <div key={card.id} className="space-y-3">
                {/* The card visual */}
                <LoyaltyCardVisual
                  card={card}
                  customerName={customerName}
                  onShowQR={() => setActiveQR(card)}
                />

                {/* Progress to next reward */}
                {nextReward && (
                  <div
                    className="rounded-xl px-4 py-3 border border-white/10"
                    style={{ background: `${cardBgColor}33` }}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-xs text-slate-400">Prochaine récompense</p>
                      <p className="text-xs font-bold" style={{ color: cardAccentColor }}>
                        {nextReward.pointsRequired - card.points} pts restants
                      </p>
                    </div>
                    <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${progressToNext}%`, background: cardAccentColor }}
                      />
                    </div>
                    <p className="text-xs mt-1.5 font-medium text-slate-400">
                      🎯 {nextReward.name}
                    </p>
                  </div>
                )}

                {rewards.length > 0 && !nextReward && (
                  <p className="text-xs font-bold text-green-400 text-center py-2">
                    🎉 Toutes les récompenses débloquées !
                  </p>
                )}

                {/* Reward tiers */}
                {rewards.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {rewards.map((reward) => {
                      const unlocked = card.points >= reward.pointsRequired;
                      return (
                        <div
                          key={reward.id}
                          className="flex-shrink-0 flex flex-col items-center gap-1 px-3 py-2 rounded-xl border min-w-[80px] text-center"
                          style={
                            unlocked
                              ? {
                                  borderColor: `${cardAccentColor}60`,
                                  background: `${cardAccentColor}20`,
                                }
                              : { borderColor: `${cardFgColor}15`, background: "rgba(0,0,0,0.15)" }
                          }
                        >
                          <span className="text-lg">{unlocked ? "🏆" : "🔒"}</span>
                          <span
                            className="text-xs font-bold leading-tight"
                            style={{ color: unlocked ? cardAccentColor : cardFgColor + "60" }}
                          >
                            {reward.pointsRequired} pts
                          </span>
                          <span
                            className="text-xs leading-tight line-clamp-2"
                            style={{ color: unlocked ? cardFgColor : cardFgColor + "50" }}
                          >
                            {reward.name}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* CTA button */}
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

                {/* Wallet buttons */}
                <div className="flex gap-2">
                  <div className="flex-1 rounded-xl py-3 flex items-center justify-center gap-2 bg-black border border-white/15 cursor-not-allowed opacity-50 relative group">
                    <svg viewBox="0 0 24 24" fill="white" className="w-4 h-4">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                    </svg>
                    <span className="text-white text-xs font-semibold">Apple Wallet</span>
                    <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-800 text-slate-300 text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border border-white/10">
                      Bientôt disponible
                    </span>
                  </div>
                  <div className="flex-1 rounded-xl py-3 flex items-center justify-center gap-2 bg-[#1a73e8] cursor-not-allowed opacity-50 relative group">
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
            );
          })}
        </div>
      )}
    </>
  );
}
