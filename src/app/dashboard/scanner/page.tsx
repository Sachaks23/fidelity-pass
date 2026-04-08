"use client";
import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";

interface CardInfo {
  customerName: string;
  serialNumber: string;
  points: number;
  totalPointsEarned: number;
}

interface ScanResult {
  success: boolean;
  customerName: string;
  pointsEarned: number;
  newPoints: number;
  newlyUnlocked: Array<{ id: string; name: string; pointsRequired: number }>;
  nextReward: { name: string; pointsRequired: number } | null;
  message: string;
}

export default function ScannerPage() {
  const [scanning, setScanning] = useState(false);
  const [cardInfo, setCardInfo] = useState<CardInfo | null>(null);
  const [amount, setAmount] = useState("");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState("");
  const [manualSerial, setManualSerial] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const scannerRef = useRef<any>(null);
  const [Html5QrcodeScanner, setHtml5QrcodeScanner] = useState<any>(null);

  useEffect(() => {
    import("html5-qrcode").then((mod) => {
      setHtml5QrcodeScanner(() => mod.Html5QrcodeScanner);
    });
  }, []);

  useEffect(() => {
    if (!scanning || !Html5QrcodeScanner) return;

    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    );

    scanner.render(
      async (decodedText: string) => {
        scanner.clear();
        setScanning(false);
        await identifyCard(decodedText.trim());
      },
      () => {}
    );

    scannerRef.current = scanner;
    return () => {
      scanner.clear().catch(() => {});
    };
  }, [scanning, Html5QrcodeScanner]);

  async function identifyCard(serialNumber: string) {
    setResult(null);
    setError("");
    setCardInfo(null);
    try {
      const res = await fetch("/api/cards/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serialNumber }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erreur lors du scan");
      } else {
        setCardInfo(data);
        setAmount("");
      }
    } catch {
      setError("Erreur de connexion");
    }
  }

  async function handleValidateAmount(e: React.FormEvent) {
    e.preventDefault();
    if (!cardInfo || !amount) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/cards/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serialNumber: cardInfo.serialNumber, amount: parseFloat(amount) }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Erreur lors de la validation");
      } else {
        setResult(data);
        setCardInfo(null);
        setAmount("");
      }
    } catch {
      setError("Erreur de connexion");
    }
    setSubmitting(false);
  }

  async function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!manualSerial.trim()) return;
    await identifyCard(manualSerial.trim());
    setManualSerial("");
  }

  function reset() {
    setResult(null);
    setCardInfo(null);
    setError("");
    setAmount("");
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Scanner une carte</h1>
        <p className="text-slate-400 mt-1">Scannez le QR code et entrez le montant de la commande</p>
      </div>

      {/* Step 2: Enter amount */}
      {cardInfo && !result && (
        <div className="p-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 mb-6">
          <div className="flex items-center gap-3 mb-5">
            <span className="text-4xl">👤</span>
            <div>
              <p className="text-xl font-bold text-white">{cardInfo.customerName}</p>
              <p className="text-amber-400 text-sm font-medium">
                {cardInfo.points} points actuels
              </p>
            </div>
          </div>
          <form onSubmit={handleValidateAmount} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                💶 Montant de la commande (€)
              </label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Ex: 24.50"
                autoFocus
                className="w-full px-4 py-4 rounded-xl bg-white/5 border border-white/10 text-white text-xl font-bold placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors text-center"
              />
            </div>
            {amount && parseFloat(amount) > 0 && (
              <div className="text-center p-3 rounded-xl bg-white/5 border border-white/10">
                <p className="text-slate-400 text-sm">Points à ajouter</p>
                <p className="text-2xl font-bold text-amber-400">
                  +{Math.round(parseFloat(amount))} pts
                </p>
              </div>
            )}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={reset}
                className="flex-1 py-3 rounded-xl border border-white/20 text-slate-400 text-sm hover:bg-white/5 transition-colors"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={submitting || !amount || parseFloat(amount) <= 0}
                className="flex-1 py-3 rounded-xl gold-gradient text-black font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {submitting ? "..." : "Valider"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Step 3: Result */}
      {result && (
        <div className={`p-6 rounded-2xl border mb-6 ${result.newlyUnlocked.length > 0 ? "border-green-500/30 bg-green-500/10" : "border-amber-500/30 bg-amber-500/10"}`}>
          <div className="flex items-center gap-4 mb-4">
            <span className="text-5xl">{result.newlyUnlocked.length > 0 ? "🎉" : "⭐"}</span>
            <div>
              <p className="text-xl font-bold text-white">{result.customerName}</p>
              <p className={`text-lg font-medium ${result.newlyUnlocked.length > 0 ? "text-green-400" : "text-amber-400"}`}>
                {result.message}
              </p>
            </div>
          </div>

          {result.newlyUnlocked.length > 0 && (
            <div className="mb-4 p-4 rounded-xl bg-green-500/20 border border-green-500/30">
              <p className="text-green-300 font-bold text-sm mb-2">🏆 Récompense(s) débloquée(s) !</p>
              {result.newlyUnlocked.map((r) => (
                <p key={r.id} className="text-green-200 text-sm">• {r.name} ({r.pointsRequired} pts)</p>
              ))}
            </div>
          )}

          {result.nextReward && (
            <div className="mb-4 p-3 rounded-xl bg-white/5 border border-white/10">
              <p className="text-slate-400 text-xs mb-1">Prochaine récompense</p>
              <div className="flex justify-between items-center">
                <p className="text-white text-sm font-medium">{result.nextReward.name}</p>
                <p className="text-amber-400 text-sm font-bold">
                  {result.nextReward.pointsRequired - result.newPoints} pts restants
                </p>
              </div>
              <div className="h-1.5 rounded-full bg-white/10 mt-2 overflow-hidden">
                <div
                  className="h-full rounded-full bg-amber-400 transition-all"
                  style={{ width: `${Math.min(100, (result.newPoints / result.nextReward.pointsRequired) * 100)}%` }}
                />
              </div>
            </div>
          )}

          <button
            onClick={reset}
            className="w-full py-2 rounded-xl border border-white/20 text-slate-400 text-sm hover:bg-white/5 transition-colors"
          >
            Scanner une autre carte
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 mb-6">
          {error}
          <button onClick={() => setError("")} className="block mt-2 text-sm underline">Réessayer</button>
        </div>
      )}

      {!cardInfo && !result && (
        <>
          {/* Camera scanner */}
          <div className="p-6 rounded-2xl border border-white/10 bg-white/5 mb-6">
            <h2 className="text-lg font-bold text-white mb-4">📷 Scanner avec la caméra</h2>
            {!scanning ? (
              <button
                onClick={() => setScanning(true)}
                className="w-full py-4 rounded-xl gold-gradient text-black font-bold text-lg hover:opacity-90 transition-opacity"
              >
                Activer la caméra
              </button>
            ) : (
              <div>
                <div id="qr-reader" className="overflow-hidden rounded-xl" />
                <button
                  onClick={() => {
                    scannerRef.current?.clear().catch(() => {});
                    setScanning(false);
                  }}
                  className="mt-4 w-full py-2 rounded-xl border border-white/20 text-slate-400 text-sm hover:bg-white/5 transition-colors"
                >
                  Annuler
                </button>
              </div>
            )}
          </div>

          {/* Manual entry */}
          <div className="p-6 rounded-2xl border border-white/10 bg-white/5">
            <h2 className="text-lg font-bold text-white mb-4">⌨️ Saisie manuelle</h2>
            <p className="text-slate-400 text-sm mb-4">Entrez le numéro de série de la carte manuellement</p>
            <form onSubmit={handleManualSubmit} className="flex gap-3">
              <input
                type="text"
                value={manualSerial}
                onChange={(e) => setManualSerial(e.target.value)}
                placeholder="Numéro de série de la carte..."
                className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors font-mono text-sm"
              />
              <button
                type="submit"
                className="px-6 py-3 rounded-xl gold-gradient text-black font-bold hover:opacity-90 transition-opacity"
              >
                Valider
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
