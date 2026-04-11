"use client";

import { useState } from "react";
import Link from "next/link";
import SubscribeButton from "@/components/SubscribeButton";
import { PLANS } from "@/lib/plans";

const gratuitFeatures = [
  { text: "Jusqu'à 30 clients", included: true },
  { text: "Scanner QR code illimité", included: true },
  { text: "Fiche client & historique", included: true },
  { text: "1 récompense active", included: true },
  { text: "Campagnes automatiques", included: false },
  { text: "Analytics & segmentation", included: false },
  { text: "Promotions & parrainage", included: false },
  { text: "Notifications push", included: false },
];

const proFeatures = [
  { text: "Clients illimités", included: true },
  { text: "Scanner QR code illimité", included: true },
  { text: "Fiche client & historique", included: true },
  { text: "Récompenses illimitées", included: true },
  { text: "Campagnes automatiques ciblées", included: true },
  { text: "Analytics & segmentation clients", included: true },
  { text: "Promotions (points multipliés)", included: true },
  { text: "Parrainage configurable", included: true },
  { text: "Gamification (badges)", included: true },
  { text: "Avis Google intégré", included: true },
  { text: "Notifications push", included: true },
  { text: "Support email", included: true },
];

export default function PricingSection() {
  const [annual, setAnnual] = useState(false);

  const priceId = annual
    ? PLANS.PRO_ANNUAL.priceId || PLANS.PRO.priceId
    : PLANS.PRO.priceId;

  return (
    <section id="tarifs" className="py-24 px-4 sm:px-6 border-t border-white/5">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-amber-400 font-semibold uppercase tracking-widest text-sm mb-3">
            Tarifs
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
            Simple et transparent
          </h2>
          <p className="text-slate-400 text-lg">
            Commencez gratuitement. Passez Pro quand vous êtes prêt.
          </p>
        </div>

        {/* Billing toggle */}
        <div className="flex items-center justify-center gap-4 mb-10">
          <span className={`text-sm font-medium transition-colors ${!annual ? "text-white" : "text-slate-500"}`}>
            Mensuel
          </span>
          <button
            onClick={() => setAnnual(!annual)}
            aria-label="Basculer vers annuel"
            className={`relative w-12 h-6 rounded-full transition-colors focus:outline-none ${annual ? "bg-amber-500" : "bg-slate-700"}`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${annual ? "translate-x-6" : "translate-x-0"}`}
            />
          </button>
          <span className={`text-sm font-medium transition-colors ${annual ? "text-white" : "text-slate-500"}`}>
            Annuel
            <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400">
              −20 %
            </span>
          </span>
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-2 gap-6 items-start">

          {/* Gratuit */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-7 flex flex-col">
            <div className="mb-6">
              <h3 className="text-lg font-bold mb-1">Gratuit</h3>
              <p className="text-slate-400 text-sm mb-5">Pour découvrir Fidco, sans engagement.</p>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-extrabold">0 €</span>
                <span className="text-slate-500 text-sm mb-1">pour toujours</span>
              </div>
            </div>

            <ul className="space-y-3 mb-8 flex-1">
              {gratuitFeatures.map((f, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm">
                  {f.included ? (
                    <span className="text-amber-400 mt-0.5 flex-shrink-0 font-bold">✓</span>
                  ) : (
                    <span className="text-slate-700 mt-0.5 flex-shrink-0">✕</span>
                  )}
                  <span className={f.included ? "text-slate-200" : "text-slate-600"}>
                    {f.text}
                  </span>
                </li>
              ))}
            </ul>

            <Link
              href="/register"
              className="block text-center py-3 px-6 rounded-xl font-semibold text-sm border border-white/20 text-white hover:bg-white/5 transition-colors"
            >
              Commencer gratuitement
            </Link>
          </div>

          {/* Pro */}
          <div className="relative rounded-2xl border border-amber-500/50 bg-gradient-to-b from-amber-500/10 to-transparent shadow-xl shadow-amber-500/10 p-7 flex flex-col">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <span className="px-4 py-1 rounded-full gold-gradient text-black text-xs font-bold whitespace-nowrap">
                Populaire
              </span>
            </div>

            <div className="mb-6 mt-2">
              <h3 className="text-lg font-bold mb-1">Pro</h3>
              <p className="text-slate-400 text-sm mb-5">
                Accès à toutes les fonctionnalités.
              </p>
              <div className="flex items-end gap-2">
                <span className="text-4xl font-extrabold">
                  {annual ? "47" : "59"} €
                </span>
                <span className="text-slate-500 text-sm mb-1">/mois</span>
              </div>
              <p className="text-slate-500 text-xs mt-1.5">
                {annual
                  ? "Facturé 564 € en une fois · Engagement 12 mois"
                  : "Sans engagement · Résiliation à tout moment"}
              </p>
            </div>

            <ul className="space-y-3 mb-8 flex-1">
              {proFeatures.map((f, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm">
                  <span className="text-amber-400 mt-0.5 flex-shrink-0 font-bold">✓</span>
                  <span className="text-slate-200">{f.text}</span>
                </li>
              ))}
            </ul>

            <SubscribeButton
              priceId={priceId}
              planName={annual ? "Pro Annuel" : "Pro"}
              highlight={true}
            />
          </div>
        </div>

        <p className="text-center text-slate-500 text-sm mt-6">
          Aucune carte bancaire requise pour le plan gratuit
        </p>
      </div>
    </section>
  );
}
