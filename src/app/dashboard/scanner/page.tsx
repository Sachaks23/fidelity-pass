"use client";
import { useState, useEffect, useRef } from "react";

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
  const [cameraError, setCameraError] = useState("");
  const scannerRef = useRef<any>(null);
  const videoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  async function startScanner() {
    setCameraError("");
    setError("");
    setScanning(true);
    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const scanner = new Html5Qrcode("qr-video");
      scannerRef.current = scanner;

      const onScan = async (decodedText: string) => {
        await stopScanner();
        setScanning(false);
        await identifyCard(decodedText.trim());
      };

      // Essai caméra arrière d'abord, puis avant en fallback
      try {
        await scanner.start(
          { facingMode: "environment" },
          { fps: 15, qrbox: { width: 220, height: 220 } },
          onScan,
          () => {}
        );
      } catch {
        await scanner.start(
          { facingMode: "user" },
          { fps: 15, qrbox: { width: 220, height: 220 } },
          onScan,
          () => {}
        );
      }
    } catch (err: any) {
      setScanning(false);
      const msg = err?.message ?? "";
      if (msg.includes("NotAllowedError") || msg.includes("Permission") || msg.includes("permission")) {
        setCameraError("permission_denied");
      } else if (msg.includes("NotFoundError") || msg.includes("not found")) {
        setCameraError("no_camera");
      } else {
        setCameraError("other");
      }
    }
  }

  async function stopScanner() {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        await scannerRef.current.clear();
      } catch {}
      scannerRef.current = null;
    }
  }

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
    <div className="max-w-lg mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Scanner</h1>
        <p className="text-slate-400 text-sm mt-0.5">Scannez la carte et entrez le montant</p>
      </div>

      {/* Étape 2 : saisie montant */}
      {cardInfo && !result && (
        <div className="p-5 rounded-2xl border border-amber-500/30 bg-amber-500/10 mb-4">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-12 h-12 rounded-full gold-gradient flex items-center justify-center text-black font-bold text-lg">
              {cardInfo.customerName[0]}
            </div>
            <div>
              <p className="text-lg font-bold text-white">{cardInfo.customerName}</p>
              <p className="text-amber-400 text-sm">{cardInfo.points} points</p>
            </div>
          </div>
          <form onSubmit={handleValidateAmount} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Montant de la commande (€)
              </label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                autoFocus
                className="w-full px-4 py-4 rounded-xl bg-white/5 border border-white/10 text-white text-3xl font-bold placeholder-slate-600 focus:outline-none focus:border-amber-500 transition-colors text-center"
              />
            </div>
            {amount && parseFloat(amount) > 0 && (
              <div className="text-center p-3 rounded-xl bg-white/5 border border-white/10">
                <p className="text-slate-400 text-xs mb-1">Points à ajouter</p>
                <p className="text-3xl font-black text-amber-400">+{Math.round(parseFloat(amount))} pts</p>
              </div>
            )}
            <div className="flex gap-3">
              <button type="button" onClick={reset}
                className="flex-1 py-3.5 rounded-xl border border-white/20 text-slate-400 font-medium hover:bg-white/5 transition-colors">
                Annuler
              </button>
              <button type="submit" disabled={submitting || !amount || parseFloat(amount) <= 0}
                className="flex-1 py-3.5 rounded-xl gold-gradient text-black font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-50">
                {submitting ? "..." : "Valider"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Résultat */}
      {result && (
        <div className={`p-5 rounded-2xl border mb-4 ${result.newlyUnlocked.length > 0 ? "border-green-500/30 bg-green-500/10" : "border-amber-500/30 bg-amber-500/10"}`}>
          <div className="flex items-center gap-4 mb-4">
            <span className="text-5xl">{result.newlyUnlocked.length > 0 ? "🎉" : "⭐"}</span>
            <div>
              <p className="text-xl font-bold text-white">{result.customerName}</p>
              <p className={`text-base font-medium ${result.newlyUnlocked.length > 0 ? "text-green-400" : "text-amber-400"}`}>
                {result.message}
              </p>
            </div>
          </div>
          {result.newlyUnlocked.length > 0 && (
            <div className="mb-4 p-4 rounded-xl bg-green-500/20 border border-green-500/30">
              <p className="text-green-300 font-bold text-sm mb-2">🏆 Récompense débloquée !</p>
              {result.newlyUnlocked.map((r) => (
                <p key={r.id} className="text-green-200 text-sm">• {r.name}</p>
              ))}
            </div>
          )}
          {result.nextReward && (
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 mb-4">
              <div className="flex justify-between mb-1">
                <p className="text-slate-400 text-xs">Prochaine récompense</p>
                <p className="text-amber-400 text-xs font-bold">
                  {result.nextReward.pointsRequired - result.newPoints} pts restants
                </p>
              </div>
              <p className="text-white text-sm font-medium">{result.nextReward.name}</p>
              <div className="h-1.5 rounded-full bg-white/10 mt-2 overflow-hidden">
                <div className="h-full rounded-full bg-amber-400 transition-all"
                  style={{ width: `${Math.min(100, (result.newPoints / result.nextReward.pointsRequired) * 100)}%` }} />
              </div>
            </div>
          )}
          <button onClick={reset}
            className="w-full py-3 rounded-xl border border-white/20 text-slate-400 text-sm hover:bg-white/5 transition-colors">
            Scanner une autre carte
          </button>
        </div>
      )}

      {/* Erreur caméra */}
      {cameraError && (
        <div className="p-5 rounded-2xl border border-red-500/20 bg-red-500/10 mb-4">
          {cameraError === "permission_denied" && (
            <>
              <p className="text-red-400 font-bold mb-2">🚫 Accès à la caméra refusé</p>
              <p className="text-slate-300 text-sm mb-3">Pour autoriser la caméra :</p>
              <div className="space-y-1.5 text-sm text-slate-400 mb-4">
                <p>• <strong className="text-white">iPhone</strong> → Réglages → Safari → Caméra → Autoriser</p>
                <p>• <strong className="text-white">Android</strong> → Paramètres → Applis → Chrome → Autorisations → Caméra</p>
                <p>• <strong className="text-white">Sur la page</strong> → appuyez sur l&apos;icône 🔒 dans la barre d&apos;adresse</p>
              </div>
            </>
          )}
          {cameraError === "no_camera" && (
            <>
              <p className="text-red-400 font-bold mb-2">📷 Aucune caméra détectée</p>
              <p className="text-slate-400 text-sm mb-3">Utilisez la saisie manuelle du numéro de série ci-dessous.</p>
            </>
          )}
          {cameraError === "other" && (
            <>
              <p className="text-red-400 font-bold mb-2">❌ Erreur caméra</p>
              <p className="text-slate-400 text-sm mb-3">Vérifiez que la caméra n&apos;est pas utilisée par une autre application.</p>
            </>
          )}
          <button onClick={() => setCameraError("")}
            className="w-full py-2.5 rounded-xl bg-white/10 text-white text-sm font-medium hover:bg-white/20 transition-colors">
            Réessayer
          </button>
        </div>
      )}

      {/* Erreur scan */}
      {error && (
        <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 mb-4 text-sm">
          {error}
          <button onClick={() => setError("")} className="block mt-2 underline">Réessayer</button>
        </div>
      )}

      {!cardInfo && !result && (
        <>
          {/* Caméra */}
          <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden mb-4">
            {!scanning ? (
              <button onClick={startScanner}
                className="w-full py-16 flex flex-col items-center justify-center gap-3 hover:bg-white/5 transition-colors">
                <span className="text-6xl">📷</span>
                <span className="text-white font-bold text-lg">Scanner un QR code</span>
                <span className="text-slate-400 text-sm">Appuyez pour activer la caméra</span>
              </button>
            ) : (
              <div className="relative">
                <div id="qr-video" className="w-full" style={{ minHeight: "300px" }} />
                {/* Viseur */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-52 h-52 relative">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-amber-400 rounded-tl-lg" />
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-amber-400 rounded-tr-lg" />
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-amber-400 rounded-bl-lg" />
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-amber-400 rounded-br-lg" />
                  </div>
                </div>
                <button onClick={() => { stopScanner(); setScanning(false); }}
                  className="absolute top-3 right-3 px-4 py-2 rounded-xl bg-black/60 text-white text-sm font-medium backdrop-blur-sm">
                  Annuler
                </button>
                <p className="absolute bottom-4 left-0 right-0 text-center text-white/70 text-sm">
                  Centrez le QR code dans le cadre
                </p>
              </div>
            )}
          </div>

          {/* Saisie manuelle */}
          <div className="p-5 rounded-2xl border border-white/10 bg-white/5">
            <h2 className="text-sm font-bold text-slate-400 mb-3 uppercase tracking-wider">Saisie manuelle</h2>
            <form onSubmit={handleManualSubmit} className="flex gap-2">
              <input
                type="text"
                value={manualSerial}
                onChange={(e) => setManualSerial(e.target.value)}
                placeholder="Numéro de série..."
                className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors font-mono text-sm"
              />
              <button type="submit"
                className="px-5 py-3 rounded-xl gold-gradient text-black font-bold hover:opacity-90 transition-opacity">
                OK
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
