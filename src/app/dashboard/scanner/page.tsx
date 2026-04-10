"use client";
import { useState, useEffect, useRef } from "react";

interface CardInfo {
  customerName: string;
  serialNumber: string;
  points: number;
  totalPointsEarned: number;
}

interface Reward {
  id: string;
  name: string;
  pointsRequired: number;
}

interface ScanResult {
  success: boolean;
  cardId: string;
  customerName: string;
  pointsEarned: number;
  newPoints: number;
  newlyUnlocked: Array<{ id: string; name: string; pointsRequired: number }>;
  redeemableRewards: Reward[];
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
  const [redeemingId, setRedeemingId] = useState<string | null>(null);
  const [redeemMsg, setRedeemMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const scannerRef = useRef<any>(null);

  useEffect(() => { return () => { stopScanner(); }; }, []);

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
      try {
        await scanner.start({ facingMode: "environment" }, { fps: 15, qrbox: { width: 220, height: 220 } }, onScan, () => {});
      } catch {
        await scanner.start({ facingMode: "user" }, { fps: 15, qrbox: { width: 220, height: 220 } }, onScan, () => {});
      }
    } catch (err: any) {
      setScanning(false);
      const msg = err?.message ?? "";
      if (msg.includes("NotAllowedError") || msg.includes("permission")) setCameraError("permission_denied");
      else if (msg.includes("NotFoundError") || msg.includes("not found")) setCameraError("no_camera");
      else setCameraError("other");
    }
  }

  async function stopScanner() {
    if (scannerRef.current) {
      try { await scannerRef.current.stop(); await scannerRef.current.clear(); } catch {}
      scannerRef.current = null;
    }
  }

  async function identifyCard(serialNumber: string) {
    setResult(null); setError(""); setCardInfo(null); setRedeemMsg(null);
    try {
      const res = await fetch("/api/cards/scan", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ serialNumber }) });
      const data = await res.json();
      if (!res.ok) setError(data.error || "Carte non reconnue");
      else { setCardInfo(data); setAmount(""); }
    } catch { setError("Erreur de connexion"); }
  }

  async function handleValidateAmount(e: React.FormEvent) {
    e.preventDefault();
    if (!cardInfo || !amount) return;
    setSubmitting(true);
    setRedeemMsg(null);
    try {
      const res = await fetch("/api/cards/scan", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ serialNumber: cardInfo.serialNumber, amount: parseFloat(amount) }) });
      const data = await res.json();
      if (!res.ok) setError(data.error || "Erreur lors de la validation");
      else { setResult(data); setCardInfo(null); setAmount(""); }
    } catch { setError("Erreur de connexion"); }
    setSubmitting(false);
  }

  async function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!manualSerial.trim()) return;
    await identifyCard(manualSerial.trim());
    setManualSerial("");
  }

  async function handleRedeem(rewardId: string) {
    if (!result) return;
    setRedeemingId(rewardId);
    setRedeemMsg(null);
    const res = await fetch("/api/cards/redeem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cardId: result.cardId, rewardId }),
    });
    const data = await res.json();
    if (res.ok) {
      setRedeemMsg({ type: "ok", text: `Récompense « ${data.rewardName} » validée` });
      // Mettre à jour les points et retirer la récompense utilisée
      setResult((prev) =>
        prev
          ? {
              ...prev,
              newPoints: data.newPoints,
              redeemableRewards: prev.redeemableRewards.filter((r) => r.id !== rewardId),
            }
          : prev
      );
    } else {
      setRedeemMsg({ type: "err", text: data.error || "Erreur lors de la validation" });
    }
    setRedeemingId(null);
  }

  function reset() { setResult(null); setCardInfo(null); setError(""); setAmount(""); setRedeemMsg(null); }

  return (
    <div className="max-w-md mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-white">Scanner</h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>Scannez la carte QR du client et saisissez le montant</p>
      </div>

      {/* Étape 2 : saisie montant */}
      {cardInfo && !result && (
        <div className="rounded-xl p-5 mb-4 fade-in" style={{ background: "var(--surface-1)", border: "1px solid rgba(245,158,11,0.2)" }}>
          <div className="flex items-center gap-3 mb-5 pb-4" style={{ borderBottom: "1px solid var(--border)" }}>
            <div className="w-10 h-10 rounded-full gold-gradient flex items-center justify-center text-black font-bold">
              {cardInfo.customerName[0]}
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{cardInfo.customerName}</p>
              <p className="text-xs mt-0.5" style={{ color: "#f59e0b" }}>{cardInfo.points} points</p>
            </div>
          </div>

          <form onSubmit={handleValidateAmount} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>
                Montant de la commande
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  autoFocus
                  className="w-full px-4 py-4 rounded-xl text-white text-4xl font-bold text-center transition-colors"
                  style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-lg font-bold" style={{ color: "var(--text-muted)" }}>€</span>
              </div>
            </div>

            {amount && parseFloat(amount) > 0 && (
              <div className="rounded-lg px-4 py-3 text-center" style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.15)" }}>
                <p className="text-xs mb-1" style={{ color: "var(--text-muted)" }}>Points à créditer</p>
                <p className="text-2xl font-bold" style={{ color: "#f59e0b" }}>+{Math.round(parseFloat(amount))} pts</p>
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={reset}
                className="flex-1 py-3 rounded-xl text-sm font-medium transition-colors"
                style={{ background: "var(--surface-2)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={submitting || !amount || parseFloat(amount) <= 0}
                className="flex-1 py-3 rounded-xl gold-gradient text-black text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-40"
              >
                {submitting ? "..." : "Valider"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Résultat */}
      {result && (
        <div className="rounded-xl p-5 mb-4 fade-in" style={{
          background: "var(--surface-1)",
          border: `1px solid ${result.newlyUnlocked.length > 0 ? "rgba(34,197,94,0.25)" : "rgba(245,158,11,0.2)"}`,
        }}>
          {/* En-tête résultat */}
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center font-bold flex-shrink-0"
              style={{
                background: result.newlyUnlocked.length > 0 ? "rgba(34,197,94,0.15)" : "rgba(245,158,11,0.15)",
                color: result.newlyUnlocked.length > 0 ? "#22c55e" : "#f59e0b",
              }}
            >
              {result.newlyUnlocked.length > 0 ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                  <polyline points="20 6 9 17 4 12" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                  <polyline points="20 6 9 17 4 12" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{result.customerName}</p>
              <p className="text-xs mt-0.5" style={{ color: result.newlyUnlocked.length > 0 ? "#22c55e" : "#f59e0b" }}>
                {result.message}
              </p>
            </div>
          </div>

          {/* Récompense débloquée */}
          {result.newlyUnlocked.length > 0 && (
            <div className="rounded-lg p-3 mb-4" style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)" }}>
              <p className="text-xs font-semibold mb-1.5" style={{ color: "#22c55e" }}>Récompense débloquée</p>
              {result.newlyUnlocked.map((r) => (
                <p key={r.id} className="text-xs text-white">• {r.name}</p>
              ))}
            </div>
          )}

          {/* Message récompense utilisée */}
          {redeemMsg && (
            <div
              className="rounded-lg px-3 py-2.5 mb-4 text-xs font-medium"
              style={{
                background: redeemMsg.type === "ok" ? "rgba(52,211,153,0.08)" : "rgba(239,68,68,0.08)",
                border: `1px solid ${redeemMsg.type === "ok" ? "rgba(52,211,153,0.2)" : "rgba(239,68,68,0.2)"}`,
                color: redeemMsg.type === "ok" ? "#34d399" : "#ef4444",
              }}
            >
              {redeemMsg.text}
            </div>
          )}

          {/* Récompenses disponibles à utiliser */}
          {result.redeemableRewards.length > 0 && (
            <div className="rounded-lg p-3 mb-4" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
              <p className="text-xs font-semibold mb-2.5" style={{ color: "var(--text-muted)" }}>
                Récompenses disponibles ({result.newPoints} pts)
              </p>
              <div className="space-y-2">
                {result.redeemableRewards.map((r) => (
                  <div key={r.id} className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-white truncate">{r.name}</p>
                      <p className="text-xs" style={{ color: "#f59e0b" }}>{r.pointsRequired} pts</p>
                    </div>
                    <button
                      onClick={() => handleRedeem(r.id)}
                      disabled={redeemingId !== null}
                      className="flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-40"
                      style={{ background: "rgba(52,211,153,0.12)", color: "#34d399", border: "1px solid rgba(52,211,153,0.2)" }}
                    >
                      {redeemingId === r.id ? "..." : "Utiliser"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Prochaine récompense */}
          {result.nextReward && (
            <div className="rounded-lg p-3 mb-4" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
              <div className="flex justify-between items-center mb-1.5">
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>Prochaine récompense</p>
                <p className="text-xs font-semibold" style={{ color: "#f59e0b" }}>
                  {result.nextReward.pointsRequired - result.newPoints} pts restants
                </p>
              </div>
              <p className="text-xs font-medium text-white mb-2">{result.nextReward.name}</p>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${Math.min(100, (result.newPoints / result.nextReward.pointsRequired) * 100)}%`, background: "#f59e0b" }}
                />
              </div>
            </div>
          )}

          <button
            onClick={reset}
            className="w-full py-2.5 rounded-xl text-xs font-medium transition-colors"
            style={{ background: "var(--surface-2)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}
          >
            Scanner une autre carte
          </button>
        </div>
      )}

      {/* Erreur caméra */}
      {cameraError && (
        <div className="rounded-xl p-4 mb-4" style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)" }}>
          {cameraError === "permission_denied" && (
            <>
              <p className="text-sm font-semibold text-red-400 mb-2">Accès caméra refusé</p>
              <div className="space-y-1 text-xs mb-3" style={{ color: "var(--text-secondary)" }}>
                <p>• iPhone → Réglages → Safari → Caméra → Autoriser</p>
                <p>• Android → Paramètres → Chrome → Autorisations → Caméra</p>
              </div>
            </>
          )}
          {cameraError === "no_camera" && (
            <p className="text-sm font-semibold text-red-400 mb-2">Aucune caméra détectée — utilisez la saisie manuelle</p>
          )}
          {cameraError === "other" && (
            <p className="text-sm font-semibold text-red-400 mb-2">Erreur caméra — vérifiez qu&apos;elle n&apos;est pas utilisée</p>
          )}
          <button
            onClick={() => setCameraError("")}
            className="w-full py-2 rounded-lg text-xs font-medium transition-colors"
            style={{ background: "var(--surface-2)", color: "var(--text-secondary)" }}
          >
            Réessayer
          </button>
        </div>
      )}

      {/* Erreur scan */}
      {error && (
        <div className="rounded-lg p-3 mb-4 text-xs text-red-400" style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)" }}>
          {error}
          <button onClick={() => setError("")} className="block mt-1 underline" style={{ color: "var(--text-muted)" }}>Réessayer</button>
        </div>
      )}

      {!cardInfo && !result && (
        <>
          {/* Caméra */}
          <div className="rounded-xl overflow-hidden mb-4" style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}>
            {!scanning ? (
              <button
                onClick={startScanner}
                className="w-full py-14 flex flex-col items-center justify-center gap-4 hover:bg-white/[0.025] transition-colors"
              >
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "var(--surface-3)", color: "#f59e0b" }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-7 h-7">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-white">Activer la caméra</p>
                  <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Scanner le QR code du client</p>
                </div>
              </button>
            ) : (
              <div className="relative">
                <div id="qr-video" className="w-full" style={{ minHeight: "300px" }} />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-52 h-52 relative">
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-amber-400 rounded-tl-md" />
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-amber-400 rounded-tr-md" />
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-amber-400 rounded-bl-md" />
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-amber-400 rounded-br-md" />
                  </div>
                </div>
                <button
                  onClick={() => { stopScanner(); setScanning(false); }}
                  className="absolute top-3 right-3 px-3 py-1.5 rounded-lg text-xs font-medium backdrop-blur-sm"
                  style={{ background: "rgba(0,0,0,0.6)", color: "white", border: "1px solid rgba(255,255,255,0.15)" }}
                >
                  Annuler
                </button>
                <p className="absolute bottom-4 left-0 right-0 text-center text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>
                  Centrez le QR code dans le cadre
                </p>
              </div>
            )}
          </div>

          {/* Saisie manuelle */}
          <div className="rounded-xl p-4" style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-muted)" }}>
              Saisie manuelle
            </p>
            <form onSubmit={handleManualSubmit} className="flex gap-2">
              <input
                type="text"
                value={manualSerial}
                onChange={(e) => setManualSerial(e.target.value)}
                placeholder="Numéro de série..."
                className="flex-1 px-3 py-2.5 rounded-lg text-white text-sm font-mono transition-colors"
                style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-lg gold-gradient text-black text-sm font-bold hover:opacity-90 transition-opacity"
              >
                OK
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
