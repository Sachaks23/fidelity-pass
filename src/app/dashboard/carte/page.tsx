"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";

const PRESET_COLORS = [
  { label: "Nuit", bg: "#0f172a", fg: "#ffffff", accent: "#f59e0b" },
  { label: "Or", bg: "#1c1400", fg: "#ffffff", accent: "#f59e0b" },
  { label: "Marine", bg: "#0c1a3a", fg: "#ffffff", accent: "#3b82f6" },
  { label: "Bordeaux", bg: "#1a0010", fg: "#ffffff", accent: "#e11d48" },
  { label: "Forêt", bg: "#0a1f0a", fg: "#ffffff", accent: "#22c55e" },
  { label: "Violet", bg: "#120a2e", fg: "#ffffff", accent: "#a855f7" },
  { label: "Ardoise", bg: "#1e293b", fg: "#ffffff", accent: "#94a3b8" },
  { label: "Blanc", bg: "#ffffff", fg: "#0f172a", accent: "#0f172a" },
];

// Mini QR code placeholder SVG
function QRPlaceholder({ size = 80, color = "#000" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg" fill={color}>
      <rect x="0" y="0" width="7" height="7" rx="1" opacity="0.9" />
      <rect x="1" y="1" width="5" height="5" rx="0.5" fill="white" />
      <rect x="2" y="2" width="3" height="3" rx="0.3" />
      <rect x="14" y="0" width="7" height="7" rx="1" opacity="0.9" />
      <rect x="15" y="1" width="5" height="5" rx="0.5" fill="white" />
      <rect x="16" y="2" width="3" height="3" rx="0.3" />
      <rect x="0" y="14" width="7" height="7" rx="1" opacity="0.9" />
      <rect x="1" y="15" width="5" height="5" rx="0.5" fill="white" />
      <rect x="2" y="16" width="3" height="3" rx="0.3" />
      <rect x="9" y="0" width="2" height="2" />
      <rect x="12" y="0" width="2" height="2" />
      <rect x="9" y="3" width="2" height="2" />
      <rect x="12" y="3" width="2" height="2" />
      <rect x="9" y="6" width="2" height="2" />
      <rect x="14" y="9" width="2" height="2" />
      <rect x="17" y="9" width="2" height="2" />
      <rect x="20" y="9" width="1" height="2" />
      <rect x="14" y="12" width="2" height="2" />
      <rect x="17" y="12" width="4" height="2" />
      <rect x="9" y="9" width="4" height="2" />
      <rect x="9" y="12" width="2" height="2" />
      <rect x="12" y="12" width="2" height="4" />
      <rect x="9" y="15" width="2" height="2" />
      <rect x="14" y="15" width="2" height="2" />
      <rect x="17" y="15" width="2" height="6" />
      <rect x="14" y="18" width="2" height="3" />
      <rect x="9" y="18" width="2" height="3" />
      <rect x="0" y="9" width="2" height="2" />
      <rect x="3" y="9" width="2" height="2" />
      <rect x="6" y="9" width="2" height="2" />
      <rect x="0" y="12" width="2" height="2" />
      <rect x="3" y="12" width="4" height="2" />
      <rect x="0" y="15" width="2" height="6" />
      <rect x="3" y="18" width="4" height="3" />
    </svg>
  );
}

// Card preview component (exact same layout as espace-client)
function CardPreview({
  bgColor,
  fgColor,
  accentColor,
  logoUrl,
  businessName,
}: {
  bgColor: string;
  fgColor: string;
  accentColor: string;
  logoUrl: string | null;
  businessName: string;
}) {
  const isDark = bgColor !== "#ffffff";
  const qrBg = isDark ? "rgba(255,255,255,0.95)" : "rgba(0,0,0,0.05)";
  const qrColor = isDark ? "#0f172a" : "#0f172a";

  return (
    <div
      className="relative rounded-2xl overflow-hidden shadow-2xl select-none"
      style={{
        background: `linear-gradient(135deg, ${bgColor}, ${bgColor}cc)`,
        width: "100%",
        maxWidth: 340,
        aspectRatio: "1.586 / 1",
      }}
    >
      {/* Shine effect */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          background: "linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 50%, rgba(0,0,0,0.2) 100%)",
        }}
      />

      {/* Top center: logo */}
      <div className="absolute top-4 left-0 right-0 flex flex-col items-center gap-1">
        {logoUrl ? (
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-white/10 flex items-center justify-center shadow-lg">
            <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
          </div>
        ) : (
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shadow-lg"
            style={{ background: accentColor, color: bgColor }}
          >
            {businessName?.[0]?.toUpperCase() || "F"}
          </div>
        )}
        <p className="text-xs font-bold tracking-wide opacity-80" style={{ color: fgColor }}>
          {businessName || "Votre commerce"}
        </p>
      </div>

      {/* Center: QR code */}
      <div className="absolute inset-0 flex items-center justify-center mt-6">
        <div
          className="rounded-xl p-2 shadow-lg"
          style={{ background: qrBg }}
        >
          <QRPlaceholder size={70} color={qrColor} />
        </div>
      </div>

      {/* Bottom: name left, points right */}
      <div className="absolute bottom-0 left-0 right-0 px-4 py-3 flex items-end justify-between">
        <div>
          <p className="text-xs opacity-40 mb-0.5 leading-none" style={{ color: fgColor }}>
            CLIENT
          </p>
          <p className="text-sm font-bold leading-tight" style={{ color: fgColor }}>
            Prénom NOM
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs opacity-40 mb-0.5 leading-none" style={{ color: fgColor }}>
            POINTS
          </p>
          <p className="text-lg font-black leading-tight" style={{ color: accentColor }}>
            250 pts
          </p>
        </div>
      </div>

      {/* Bottom accent line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-0.5 opacity-40"
        style={{ background: accentColor }}
      />
    </div>
  );
}

export default function CartePage() {
  const [business, setBusiness] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [bgColor, setBgColor] = useState("#0f172a");
  const [fgColor, setFgColor] = useState("#ffffff");
  const [accentColor, setAccentColor] = useState("#f59e0b");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoUploading, setLogoUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/business")
      .then((r) => r.json())
      .then((b) => {
        setBusiness(b);
        setBgColor(b.cardBgColor || "#0f172a");
        setFgColor(b.cardFgColor || "#ffffff");
        setAccentColor(b.cardAccentColor || "#f59e0b");
        setLogoUrl(b.cardLogoUrl || null);
        setLoading(false);
      });
  }, []);

  function applyPreset(preset: (typeof PRESET_COLORS)[0]) {
    setBgColor(preset.bg);
    setFgColor(preset.fg);
    setAccentColor(preset.accent);
  }

  function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Veuillez sélectionner une image (PNG, JPG, SVG...)");
      return;
    }
    if (file.size > 500 * 1024) {
      alert("Le logo doit faire moins de 500 Ko");
      return;
    }

    setLogoUploading(true);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setLogoUrl(ev.target?.result as string);
      setLogoUploading(false);
    };
    reader.readAsDataURL(file);
  }

  function removeLogo() {
    setLogoUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSave() {
    setSaving(true);
    await fetch("/api/business", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: business.name,
        address: business.address,
        phone: business.phone,
        description: business.description,
        cardBgColor: bgColor,
        cardFgColor: fgColor,
        cardAccentColor: accentColor,
        cardLogoUrl: logoUrl,
      }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-4xl animate-pulse">💳</div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Personnaliser ma carte</h1>
        <p className="text-slate-400 text-sm mt-1">
          Choisissez les couleurs et le logo de votre carte de fidélité
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LEFT — Controls */}
        <div className="space-y-6">

          {/* Presets */}
          <div className="bg-[#1e293b] rounded-2xl p-5 border border-white/10">
            <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
              <span>🎨</span> Thèmes prédéfinis
            </h2>
            <div className="grid grid-cols-4 gap-2">
              {PRESET_COLORS.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => applyPreset(preset)}
                  className="flex flex-col items-center gap-1.5 p-2 rounded-xl border border-white/10 hover:border-white/30 transition-all group"
                  title={preset.label}
                >
                  <div
                    className="w-8 h-8 rounded-lg border border-white/10"
                    style={{ background: preset.bg }}
                  >
                    <div
                      className="w-full h-full rounded-lg opacity-50"
                      style={{ background: `linear-gradient(135deg, transparent 60%, ${preset.accent})` }}
                    />
                  </div>
                  <span className="text-xs text-slate-400 group-hover:text-white transition-colors">
                    {preset.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom colors */}
          <div className="bg-[#1e293b] rounded-2xl p-5 border border-white/10">
            <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
              <span>🖌️</span> Couleurs personnalisées
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">Fond</p>
                  <p className="text-xs text-slate-400">Couleur principale de la carte</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400 font-mono">{bgColor}</span>
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">Texte</p>
                  <p className="text-xs text-slate-400">Couleur du texte sur la carte</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400 font-mono">{fgColor}</span>
                  <input
                    type="color"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">Accent</p>
                  <p className="text-xs text-slate-400">Points et éléments mis en valeur</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400 font-mono">{accentColor}</span>
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Logo upload */}
          <div className="bg-[#1e293b] rounded-2xl p-5 border border-white/10">
            <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
              <span>🖼️</span> Logo
            </h2>

            {logoUrl ? (
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-white/10 flex items-center justify-center overflow-hidden border border-white/10">
                  <img src={logoUrl} alt="Logo" className="w-full h-full object-contain p-1" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-white font-medium mb-1">Logo chargé ✅</p>
                  <p className="text-xs text-slate-400 mb-3">Il apparaîtra en haut au centre de la carte</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs px-3 py-1.5 rounded-lg bg-white/10 text-white hover:bg-white/15 transition-colors"
                    >
                      Changer
                    </button>
                    <button
                      onClick={removeLogo}
                      className="text-xs px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={logoUploading}
                className="w-full border-2 border-dashed border-white/20 rounded-xl py-8 flex flex-col items-center gap-3 hover:border-amber-500/40 hover:bg-amber-500/5 transition-all group"
              >
                {logoUploading ? (
                  <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-xl group-hover:bg-amber-500/10 transition-colors">
                    📁
                  </div>
                )}
                <div className="text-center">
                  <p className="text-sm font-medium text-white">
                    {logoUploading ? "Chargement..." : "Cliquez pour importer votre logo"}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">PNG, JPG, SVG — max 500 Ko</p>
                </div>
              </button>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoUpload}
            />
          </div>

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-4 rounded-2xl font-bold text-black transition-all text-sm disabled:opacity-60"
            style={{ background: saved ? "#22c55e" : accentColor || "#f59e0b" }}
          >
            {saving ? "Enregistrement..." : saved ? "✅ Modifications sauvegardées !" : "Enregistrer la carte"}
          </button>
        </div>

        {/* RIGHT — Live preview */}
        <div className="flex flex-col items-center gap-6">
          <div className="w-full">
            <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
              <span>👁️</span> Aperçu en temps réel
            </h2>
            <div className="flex justify-center">
              <CardPreview
                bgColor={bgColor}
                fgColor={fgColor}
                accentColor={accentColor}
                logoUrl={logoUrl}
                businessName={business?.name || "Votre commerce"}
              />
            </div>
          </div>

          {/* Info box */}
          <div className="w-full bg-[#1e293b] rounded-2xl p-4 border border-white/10">
            <p className="text-xs text-slate-400 text-center leading-relaxed">
              💡 C&apos;est exactement comme ça que vos clients verront leur carte dans l&apos;espace client.
              Le QR code réel s&apos;affiche à la place du placeholder.
            </p>
          </div>

          {/* Card anatomy guide */}
          <div className="w-full bg-[#1e293b] rounded-2xl p-4 border border-white/10">
            <p className="text-xs font-semibold text-white mb-3">Anatomie de la carte</p>
            <div className="space-y-2">
              {[
                { zone: "Haut centre", content: "Logo + nom du commerce", icon: "🔝" },
                { zone: "Centre", content: "QR code unique du client", icon: "📷" },
                { zone: "Bas gauche", content: "Prénom et NOM du client", icon: "👤" },
                { zone: "Bas droite", content: "Points cumulés", icon: "⭐" },
              ].map((item) => (
                <div key={item.zone} className="flex items-center gap-3">
                  <span className="text-sm">{item.icon}</span>
                  <div>
                    <span className="text-xs font-medium text-white">{item.zone}</span>
                    <span className="text-xs text-slate-400 ml-2">— {item.content}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
