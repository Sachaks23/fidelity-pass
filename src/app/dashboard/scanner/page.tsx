"use client";
import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";

interface ScanResult {
  success: boolean;
  rewardEarned?: boolean;
  stampCount?: number;
  totalStamps?: number;
  customerName?: string;
  message: string;
}

export default function ScannerPage() {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState("");
  const [manualSerial, setManualSerial] = useState("");
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
        await processSerial(decodedText.trim());
      },
      (err: any) => {
        // ignore scan errors
      }
    );

    scannerRef.current = scanner;
    return () => {
      scanner.clear().catch(() => {});
    };
  }, [scanning, Html5QrcodeScanner]);

  async function processSerial(serialNumber: string) {
    setResult(null);
    setError("");
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
        setResult(data);
      }
    } catch {
      setError("Erreur de connexion");
    }
  }

  async function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!manualSerial.trim()) return;
    await processSerial(manualSerial.trim());
    setManualSerial("");
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Scanner une carte</h1>
        <p className="text-slate-400 mt-1">Scannez le QR code de la carte de fidélité d'un client</p>
      </div>

      {/* Result */}
      {result && (
        <div className={`p-6 rounded-2xl border mb-6 ${result.rewardEarned ? "border-green-500/30 bg-green-500/10" : "border-amber-500/30 bg-amber-500/10"}`}>
          <div className="flex items-center gap-4">
            <span className="text-5xl">{result.rewardEarned ? "🎁" : "⭐"}</span>
            <div>
              <p className="text-xl font-bold text-white">{result.customerName}</p>
              <p className={`text-lg font-medium ${result.rewardEarned ? "text-green-400" : "text-amber-400"}`}>
                {result.message}
              </p>
              {!result.rewardEarned && (
                <p className="text-slate-400 text-sm mt-1">
                  Total cumulé : {result.totalStamps} tampon{(result.totalStamps ?? 0) > 1 ? "s" : ""}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => setResult(null)}
            className="mt-4 w-full py-2 rounded-xl border border-white/20 text-slate-400 text-sm hover:bg-white/5 transition-colors"
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
    </div>
  );
}
