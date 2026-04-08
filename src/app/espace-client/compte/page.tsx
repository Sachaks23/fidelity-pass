"use client";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";

export default function MonComptePage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState({ firstName: "", lastName: "", email: "", phone: "" });
  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPwd, setLoadingPwd] = useState(false);
  const [msgProfile, setMsgProfile] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [msgPwd, setMsgPwd] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/customer/profile").then(r => r.json()).then(d => {
      setProfile({
        firstName: d.customer?.firstName || "",
        lastName:  d.customer?.lastName  || "",
        email:     d.email               || "",
        phone:     d.customer?.phone     || "",
      });
    });
  }, []);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setLoadingProfile(true);
    setMsgProfile(null);
    const res = await fetch("/api/customer/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    });
    setLoadingProfile(false);
    setMsgProfile(res.ok
      ? { type: "ok", text: "Profil mis à jour ✓" }
      : { type: "err", text: "Erreur lors de la mise à jour" }
    );
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      setMsgPwd({ type: "err", text: "Les nouveaux mots de passe ne correspondent pas" });
      return;
    }
    if (passwords.new.length < 6) {
      setMsgPwd({ type: "err", text: "Le mot de passe doit faire au moins 6 caractères" });
      return;
    }
    setLoadingPwd(true);
    setMsgPwd(null);
    const res = await fetch("/api/customer/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: passwords.current, newPassword: passwords.new }),
    });
    const data = await res.json();
    setLoadingPwd(false);
    if (res.ok) {
      setMsgPwd({ type: "ok", text: "Mot de passe modifié ✓" });
      setPasswords({ current: "", new: "", confirm: "" });
    } else {
      setMsgPwd({ type: "err", text: data.error || "Erreur" });
    }
  }

  const inputClass = "w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors";
  const labelClass = "block text-sm font-medium text-slate-300 mb-2";

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Mon compte</h1>
        <p className="text-slate-400 text-sm mt-1">{session?.user?.email}</p>
      </div>

      {/* Informations personnelles */}
      <form onSubmit={saveProfile} className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-5 space-y-4">
        <h2 className="text-white font-semibold text-base flex items-center gap-2">👤 Informations personnelles</h2>

        {msgProfile && (
          <div className={`p-3 rounded-lg text-sm ${msgProfile.type === "ok"
            ? "bg-green-500/10 border border-green-500/20 text-green-400"
            : "bg-red-500/10 border border-red-500/20 text-red-400"}`}>
            {msgProfile.text}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Prénom</label>
            <input type="text" value={profile.firstName} onChange={e => setProfile(p => ({ ...p, firstName: e.target.value }))}
              className={inputClass} placeholder="Marie" autoComplete="given-name" />
          </div>
          <div>
            <label className={labelClass}>Nom</label>
            <input type="text" value={profile.lastName} onChange={e => setProfile(p => ({ ...p, lastName: e.target.value }))}
              className={inputClass} placeholder="Dupont" autoComplete="family-name" />
          </div>
        </div>
        <div>
          <label className={labelClass}>Email</label>
          <input type="email" value={profile.email} onChange={e => setProfile(p => ({ ...p, email: e.target.value }))}
            className={inputClass} placeholder="marie@email.com" autoComplete="email" />
        </div>
        <div>
          <label className={labelClass}>Téléphone</label>
          <input type="tel" value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))}
            className={inputClass} placeholder="+33 6 12 34 56 78" autoComplete="tel" />
        </div>
        <button type="submit" disabled={loadingProfile}
          className="w-full py-3 rounded-xl gold-gradient text-black font-bold hover:opacity-90 transition-opacity disabled:opacity-50">
          {loadingProfile ? "Enregistrement..." : "Enregistrer"}
        </button>
      </form>

      {/* Changer le mot de passe */}
      <form onSubmit={savePassword} className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-5 space-y-4">
        <h2 className="text-white font-semibold text-base flex items-center gap-2">🔒 Changer le mot de passe</h2>

        {msgPwd && (
          <div className={`p-3 rounded-lg text-sm ${msgPwd.type === "ok"
            ? "bg-green-500/10 border border-green-500/20 text-green-400"
            : "bg-red-500/10 border border-red-500/20 text-red-400"}`}>
            {msgPwd.text}
          </div>
        )}

        <div>
          <label className={labelClass}>Mot de passe actuel</label>
          <input type="password" value={passwords.current} onChange={e => setPasswords(p => ({ ...p, current: e.target.value }))}
            className={inputClass} placeholder="••••••••" autoComplete="current-password" />
        </div>
        <div>
          <label className={labelClass}>Nouveau mot de passe</label>
          <input type="password" value={passwords.new} onChange={e => setPasswords(p => ({ ...p, new: e.target.value }))}
            className={inputClass} placeholder="Minimum 6 caractères" autoComplete="new-password" />
        </div>
        <div>
          <label className={labelClass}>Confirmer le nouveau mot de passe</label>
          <input type="password" value={passwords.confirm} onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))}
            className={inputClass} placeholder="••••••••" autoComplete="new-password" />
        </div>
        <button type="submit" disabled={loadingPwd}
          className="w-full py-3 rounded-xl border border-white/20 text-white font-bold hover:bg-white/5 transition-colors disabled:opacity-50">
          {loadingPwd ? "Modification..." : "Modifier le mot de passe"}
        </button>
      </form>

      {/* Déconnexion */}
      <button onClick={() => signOut({ callbackUrl: "/login" })}
        className="w-full py-3 rounded-xl border border-red-500/20 text-red-400 text-sm hover:bg-red-500/5 transition-colors">
        🚪 Se déconnecter
      </button>
    </>
  );
}
