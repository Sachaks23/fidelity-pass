"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import FidcoLogo from "@/components/FidcoLogo";

/* ─── Types ─────────────────────────────────────────────────────────────── */
interface BusinessInfo {
  name: string;
  cardBgColor: string;
  cardAccentColor: string;
  cardLogoUrl: string | null;
  pointsPerEuro: number;
}

interface CardInfo {
  customerName: string;
  serialNumber: string;
  points: number;
}

interface ScanResult {
  customerName: string;
  pointsEarned: number;
  newPoints: number;
  nextReward: { name: string; pointsRequired: number } | null;
  newlyUnlocked: Array<{ id: string; name: string }>;
  activePromotion: { name: string; multiplier: number } | null;
}

type Screen = "idle" | "card_found" | "result_ok" | "result_reward" | "error";

/* ─── Constantes ─────────────────────────────────────────────────────────── */
const RESET_DELAY = 5000; // ms avant retour à l'écran d'accueil

/* ─── Composant principal ────────────────────────────────────────────────── */
export default function BornePage() {
  const [business, setBusiness] = useState<BusinessInfo | null>(null);
  const [screen, setScreen] = useState<Screen>("idle");
  const [cardInfo, setCardInfo] = useState<CardInfo | null>(null);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [amountBuffer, setAmountBuffer] = useState(""); // saisie montant via clavier numérique
  const [submitting, setSubmitting] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [countdown, setCountdown] = useState(0); // barre de progression avant reset

  const usbInputRef = useRef<HTMLInputElement>(null);
  const usbBuffer = useRef(""); // accumule les touches du scanner USB
  const usbTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const scannerRef = useRef<any>(null);

  /* ── Charger les infos commerce ── */
  useEffect(() => {
    fetch("/api/business")
      .then((r) => r.json())
      .then((d) => setBusiness(d))
      .catch(() => null);
  }, []);

  /* ── Focus permanent sur l'input USB ── */
  useEffect(() => {
    const keepFocus = () => {
      if (
        screen === "idle" &&
        document.activeElement !== usbInputRef.current &&
        !cameraOn
      ) {
        usbInputRef.current?.focus();
      }
    };
    const id = setInterval(keepFocus, 500);
    return () => clearInterval(id);
  }, [screen, cameraOn]);

  /* ── Plein écran ── */
  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => null);
    } else {
      document.exitFullscreen().catch(() => null);
    }
  }

  /* ── Reset vers écran idle ── */
  const resetToIdle = useCallback(() => {
    if (resetTimer.current) clearTimeout(resetTimer.current);
    if (countdownInterval.current) clearInterval(countdownInterval.current);
    setScreen("idle");
    setCardInfo(null);
    setResult(null);
    setErrorMsg("");
    setAmountBuffer("");
    setCountdown(0);
    stopCamera();
    usbBuffer.current = "";
    setTimeout(() => usbInputRef.current?.focus(), 100);
  }, []);

  /* ── Lancer le compte à rebours avant reset ── */
  const startResetCountdown = useCallback(() => {
    setCountdown(100);
    const start = Date.now();
    countdownInterval.current = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.max(0, 100 - (elapsed / RESET_DELAY) * 100);
      setCountdown(pct);
      if (pct === 0 && countdownInterval.current) clearInterval(countdownInterval.current);
    }, 50);
    resetTimer.current = setTimeout(resetToIdle, RESET_DELAY);
  }, [resetToIdle]);

  /* ── Scanner USB : accumulation de touches ── */
  function handleUsbKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      const serial = usbBuffer.current.trim();
      usbBuffer.current = "";
      if (usbTimer.current) clearTimeout(usbTimer.current);
      if (serial) identifyCard(serial);
      return;
    }
    if (e.key.length === 1) {
      usbBuffer.current += e.key;
      if (usbTimer.current) clearTimeout(usbTimer.current);
      usbTimer.current = setTimeout(() => {
        const serial = usbBuffer.current.trim();
        usbBuffer.current = "";
        if (serial.length > 4) identifyCard(serial);
      }, 200);
    }
  }

  /* ── Identifier une carte (étape 1 : info sans créditer) ── */
  async function identifyCard(serialNumber: string) {
    if (screen !== "idle") return;
    try {
      const res = await fetch("/api/cards/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serialNumber }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Carte non reconnue");
        setScreen("error");
        startResetCountdown();
      } else {
        setCardInfo(data);
        setAmountBuffer("");
        setScreen("card_found");
      }
    } catch {
      setErrorMsg("Erreur de connexion");
      setScreen("error");
      startResetCountdown();
    }
  }

  /* ── Valider le montant et créditer les points ── */
  async function validateAmount() {
    if (!cardInfo || submitting) return;
    const amount = parseFloat(amountBuffer);
    if (isNaN(amount) || amount <= 0) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/cards/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serialNumber: cardInfo.serialNumber, amount }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Erreur lors de la validation");
        setScreen("error");
        startResetCountdown();
      } else {
        setResult(data);
        setScreen(data.newlyUnlocked?.length > 0 ? "result_reward" : "result_ok");
        startResetCountdown();
      }
    } catch {
      setErrorMsg("Erreur de connexion");
      setScreen("error");
      startResetCountdown();
    }
    setSubmitting(false);
  }

  /* ── Caméra ── */
  async function startCamera() {
    setCameraOn(true);
    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const scanner = new Html5Qrcode("borne-qr-video");
      scannerRef.current = scanner;
      const onScan = async (text: string) => {
        await stopCamera();
        identifyCard(text.trim());
      };
      try {
        await scanner.start({ facingMode: "environment" }, { fps: 15, qrbox: { width: 250, height: 250 } }, onScan, () => {});
      } catch {
        await scanner.start({ facingMode: "user" }, { fps: 15, qrbox: { width: 250, height: 250 } }, onScan, () => {});
      }
    } catch {
      setCameraOn(false);
    }
  }

  async function stopCamera() {
    if (scannerRef.current) {
      try { await scannerRef.current.stop(); await scannerRef.current.clear(); } catch {}
      scannerRef.current = null;
    }
    setCameraOn(false);
  }

  useEffect(() => { return () => { stopCamera(); }; }, []);

  /* ── Couleur accent (du commerce ou fallback or/amber) ── */
  const accent = business?.cardAccentColor || "#f59e0b";

  /* ─────────────────────────────────────────────────────────────────────── */
  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden select-none"
      style={{ background: "#0a0f1e", fontFamily: "ui-sans-serif, system-ui, sans-serif" }}
      onClick={() => { if (screen === "idle") usbInputRef.current?.focus(); }}
    >
      {/* Input USB invisible – toujours présent */}
      <input
        ref={usbInputRef}
        onKeyDown={handleUsbKeyDown}
        readOnly
        aria-hidden
        tabIndex={-1}
        style={{ position: "absolute", opacity: 0, width: 1, height: 1, left: -9999, top: -9999 }}
      />

      {/* Bouton plein écran */}
      <button
        onClick={toggleFullscreen}
        title={isFullscreen ? "Quitter le plein écran" : "Plein écran"}
        style={{
          position: "absolute", top: "1rem", right: "1rem", zIndex: 50,
          background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "0.5rem", padding: "0.5rem", color: "rgba(255,255,255,0.4)", cursor: "pointer",
        }}
      >
        {isFullscreen ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" strokeLinecap="round"/>
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" strokeLinecap="round"/>
          </svg>
        )}
      </button>

      {/* ═══════════════ ÉCRAN IDLE ═══════════════ */}
      {screen === "idle" && (
        <div className="flex flex-col items-center gap-8 w-full max-w-lg px-6 text-center fade-in">
          {/* Logo commerce */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.75rem" }}>
            <FidcoLogo size={64} />
            {business?.name && (
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "1rem", fontWeight: 500, letterSpacing: "0.05em" }}>
                {business.name}
              </p>
            )}
          </div>

          {/* Cercle animé */}
          <div style={{ position: "relative", width: 200, height: 200 }}>
            {/* Anneaux pulsants */}
            <div style={{
              position: "absolute", inset: 0, borderRadius: "50%",
              border: `2px solid ${accent}22`,
              animation: "borne-pulse 2.5s ease-out infinite",
            }} />
            <div style={{
              position: "absolute", inset: "16px", borderRadius: "50%",
              border: `2px solid ${accent}33`,
              animation: "borne-pulse 2.5s ease-out infinite 0.5s",
            }} />
            {/* Cercle central */}
            <div style={{
              position: "absolute", inset: "32px", borderRadius: "50%",
              background: `${accent}15`,
              border: `1.5px solid ${accent}40`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth={1.5}>
                <path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2" strokeLinecap="round"/>
                <rect x="7" y="7" width="4" height="4" rx="0.5"/>
                <rect x="13" y="7" width="4" height="4" rx="0.5"/>
                <rect x="7" y="13" width="4" height="4" rx="0.5"/>
                <path d="M13 13h4v4h-4z"/>
              </svg>
            </div>
          </div>

          <div>
            <p style={{ color: "white", fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>
              Présentez votre carte
            </p>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.9rem" }}>
              Approchez le QR code du scanner
            </p>
          </div>

          {/* Bouton caméra */}
          {!cameraOn ? (
            <button
              onClick={startCamera}
              style={{
                marginTop: "-0.5rem",
                padding: "0.625rem 1.25rem",
                borderRadius: "0.75rem",
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "rgba(255,255,255,0.5)",
                fontSize: "0.8rem",
                cursor: "pointer",
                display: "flex", alignItems: "center", gap: "0.5rem",
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
              Utiliser la caméra
            </button>
          ) : (
            <div style={{ width: "100%", maxWidth: 360 }}>
              <div
                id="borne-qr-video"
                style={{
                  width: "100%", borderRadius: "1rem", overflow: "hidden",
                  border: `2px solid ${accent}40`, minHeight: 280,
                }}
              />
              <button
                onClick={stopCamera}
                style={{
                  marginTop: "0.75rem",
                  width: "100%",
                  padding: "0.625rem",
                  borderRadius: "0.75rem",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.5)",
                  fontSize: "0.8rem", cursor: "pointer",
                }}
              >
                Annuler la caméra
              </button>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════ CARTE TROUVÉE → saisie montant ═══════════════ */}
      {screen === "card_found" && cardInfo && (
        <div className="fade-in w-full max-w-md px-6 flex flex-col items-center gap-6">
          {/* Bonjour */}
          <div style={{ textAlign: "center" }}>
            <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.9rem", marginBottom: "0.25rem" }}>Bienvenue</p>
            <p style={{ color: "white", fontSize: "2.5rem", fontWeight: 800, lineHeight: 1.1 }}>
              {cardInfo.customerName.split(" ")[0]}
            </p>
            <p style={{ color: accent, fontSize: "1rem", fontWeight: 600, marginTop: "0.5rem" }}>
              {cardInfo.points} pts
            </p>
          </div>

          {/* Clavier numérique montant */}
          <div style={{
            width: "100%",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "1rem",
            padding: "1.25rem",
          }}>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.7rem", textAlign: "center", marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              Montant de la commande
            </p>

            {/* Affichage montant */}
            <div style={{
              textAlign: "center",
              color: amountBuffer ? "white" : "rgba(255,255,255,0.2)",
              fontSize: "3rem", fontWeight: 700, marginBottom: "1rem",
              minHeight: "4rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.25rem",
            }}>
              {amountBuffer || "0"}<span style={{ fontSize: "1.5rem", color: "rgba(255,255,255,0.3)" }}>€</span>
            </div>

            {/* Pavé numérique */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.5rem" }}>
              {["1","2","3","4","5","6","7","8","9",".","0","⌫"].map((k) => (
                <button
                  key={k}
                  onClick={() => {
                    if (k === "⌫") setAmountBuffer((v) => v.slice(0, -1));
                    else if (k === "." && amountBuffer.includes(".")) return;
                    else if (amountBuffer.length >= 6) return;
                    else setAmountBuffer((v) => v + k);
                  }}
                  style={{
                    padding: "1rem",
                    borderRadius: "0.75rem",
                    background: k === "⌫" ? "rgba(239,68,68,0.1)" : "rgba(255,255,255,0.06)",
                    border: `1px solid ${k === "⌫" ? "rgba(239,68,68,0.2)" : "rgba(255,255,255,0.08)"}`,
                    color: k === "⌫" ? "#ef4444" : "white",
                    fontSize: "1.3rem", fontWeight: 600, cursor: "pointer",
                    transition: "background 0.1s",
                  }}
                >
                  {k}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: "0.75rem", width: "100%" }}>
            <button
              onClick={resetToIdle}
              style={{
                flex: 1, padding: "0.875rem",
                borderRadius: "0.75rem",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "rgba(255,255,255,0.4)", fontSize: "0.9rem", cursor: "pointer",
              }}
            >
              Annuler
            </button>
            <button
              onClick={validateAmount}
              disabled={submitting || !amountBuffer || parseFloat(amountBuffer) <= 0}
              style={{
                flex: 2, padding: "0.875rem",
                borderRadius: "0.75rem",
                background: amountBuffer && parseFloat(amountBuffer) > 0 ? accent : "rgba(255,255,255,0.05)",
                border: "none",
                color: amountBuffer && parseFloat(amountBuffer) > 0 ? "#000" : "rgba(255,255,255,0.2)",
                fontSize: "1rem", fontWeight: 700, cursor: "pointer",
                opacity: submitting ? 0.6 : 1,
                transition: "background 0.2s, color 0.2s",
              }}
            >
              {submitting ? "..." : "Valider"}
            </button>
          </div>
        </div>
      )}

      {/* ═══════════════ RÉSULTAT OK ═══════════════ */}
      {screen === "result_ok" && result && (
        <div className="fade-in flex flex-col items-center gap-6 w-full max-w-md px-6 text-center">
          {/* Icône check */}
          <div style={{
            width: 100, height: 100, borderRadius: "50%",
            background: `${accent}18`, border: `2px solid ${accent}50`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth={2.5}>
              <polyline points="20 6 9 17 4 12" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          <div>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.9rem", marginBottom: "0.25rem" }}>
              {result.customerName.split(" ")[0]}
            </p>
            <p style={{ color: accent, fontSize: "3rem", fontWeight: 800, lineHeight: 1 }}>
              +{result.pointsEarned}
            </p>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "1rem" }}>points crédités</p>
            <p style={{ color: "white", fontSize: "1.1rem", fontWeight: 600, marginTop: "0.5rem" }}>
              Total : {result.newPoints} pts
            </p>
          </div>

          {/* Promotion active */}
          {result.activePromotion && (
            <div style={{
              padding: "0.625rem 1rem", borderRadius: "0.625rem",
              background: `${accent}12`, border: `1px solid ${accent}30`,
              color: accent, fontSize: "0.8rem", fontWeight: 600,
            }}>
              x{result.activePromotion.multiplier} — {result.activePromotion.name}
            </div>
          )}

          {/* Prochaine récompense */}
          {result.nextReward && (
            <div style={{ width: "100%" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.75rem" }}>{result.nextReward.name}</span>
                <span style={{ color: accent, fontSize: "0.75rem", fontWeight: 600 }}>
                  {result.nextReward.pointsRequired - result.newPoints} pts restants
                </span>
              </div>
              <div style={{ height: 8, borderRadius: 4, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
                <div style={{
                  height: "100%", borderRadius: 4, background: accent,
                  width: `${Math.min(100, (result.newPoints / result.nextReward.pointsRequired) * 100)}%`,
                  transition: "width 0.8s ease",
                }} />
              </div>
            </div>
          )}

          {/* Barre countdown */}
          <CountdownBar pct={countdown} color={accent} />
        </div>
      )}

      {/* ═══════════════ RÉCOMPENSE DÉBLOQUÉE ═══════════════ */}
      {screen === "result_reward" && result && (
        <div className="fade-in flex flex-col items-center gap-5 w-full max-w-md px-6 text-center">
          {/* Étoile animée */}
          <div style={{
            width: 120, height: 120, borderRadius: "50%",
            background: "rgba(251,191,36,0.12)", border: "2px solid rgba(251,191,36,0.4)",
            display: "flex", alignItems: "center", justifyContent: "center",
            animation: "borne-bounce 0.5s ease",
          }}>
            <svg width="60" height="60" viewBox="0 0 24 24" fill="#fbbf24" stroke="none">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          </div>

          <div>
            <p style={{ color: "#fbbf24", fontSize: "1rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.5rem" }}>
              Récompense débloquée !
            </p>
            {result.newlyUnlocked.map((r) => (
              <p key={r.id} style={{ color: "white", fontSize: "1.6rem", fontWeight: 800 }}>
                {r.name}
              </p>
            ))}
          </div>

          <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.9rem" }}>
            {result.customerName.split(" ")[0]} · {result.newPoints} pts
          </div>

          <CountdownBar pct={countdown} color="#fbbf24" />
        </div>
      )}

      {/* ═══════════════ ERREUR ═══════════════ */}
      {screen === "error" && (
        <div className="fade-in flex flex-col items-center gap-6 text-center px-6">
          <div style={{
            width: 100, height: 100, borderRadius: "50%",
            background: "rgba(239,68,68,0.1)", border: "2px solid rgba(239,68,68,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth={2.5}>
              <line x1="18" y1="6" x2="6" y2="18" strokeLinecap="round"/>
              <line x1="6" y1="6" x2="18" y2="18" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <p style={{ color: "#ef4444", fontSize: "1.3rem", fontWeight: 700, marginBottom: "0.25rem" }}>
              Carte non reconnue
            </p>
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.85rem" }}>{errorMsg}</p>
          </div>
          <CountdownBar pct={countdown} color="#ef4444" />
        </div>
      )}

      {/* ─── Keyframes ─── */}
      <style>{`
        @keyframes borne-pulse {
          0% { transform: scale(1); opacity: 0.6; }
          60% { transform: scale(1.35); opacity: 0; }
          100% { transform: scale(1.35); opacity: 0; }
        }
        @keyframes borne-bounce {
          0% { transform: scale(0.4); opacity: 0; }
          60% { transform: scale(1.15); }
          100% { transform: scale(1); opacity: 1; }
        }
        .fade-in { animation: fadeIn 0.3s ease; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}

/* ─── Barre de progression avant reset ──────────────────────────────────── */
function CountdownBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div style={{ width: "100%", maxWidth: 300 }}>
      <div style={{ height: 4, borderRadius: 2, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
        <div style={{
          height: "100%", borderRadius: 2, background: color,
          width: `${pct}%`,
          transition: "width 0.05s linear",
          opacity: 0.6,
        }} />
      </div>
      <p style={{ color: "rgba(255,255,255,0.2)", fontSize: "0.7rem", textAlign: "center", marginTop: "0.5rem" }}>
        Retour automatique…
      </p>
    </div>
  );
}
