"use client";
import { useState, useEffect } from "react";

type Tab = "push" | "email";

interface PushNotification {
  id: string;
  title: string;
  body: string;
  sentAt: string;
  status: string;
  sentCount: number;
}

interface EmailNotification {
  id: string;
  subject: string;
  body: string;
  sentAt: string;
  sentCount: number;
  status: string;
}

export default function NotificationsPage() {
  const [tab, setTab] = useState<Tab>("email");

  // Push state
  const [pushTitle, setPushTitle] = useState("");
  const [pushMessage, setPushMessage] = useState("");
  const [pushSending, setPushSending] = useState(false);
  const [pushSent, setPushSent] = useState<{ sentCount: number } | null>(null);
  const [pushError, setPushError] = useState("");
  const [pushHistory, setPushHistory] = useState<PushNotification[]>([]);

  // Email state
  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [emailSending, setEmailSending] = useState(false);
  const [emailSent, setEmailSent] = useState<{ sentCount: number } | null>(null);
  const [emailError, setEmailError] = useState("");
  const [emailHistory, setEmailHistory] = useState<EmailNotification[]>([]);

  useEffect(() => {
    fetch("/api/notifications").then((r) => r.json()).then(setPushHistory).catch(console.error);
    fetch("/api/notifications/email").then((r) => r.json()).then(setEmailHistory).catch(console.error);
  }, []);

  async function handleSendPush(e: React.FormEvent) {
    e.preventDefault();
    setPushSending(true);
    setPushError("");
    setPushSent(null);
    const res = await fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: pushTitle, message: pushMessage }),
    });
    const data = await res.json();
    if (!res.ok) {
      setPushError(data.error || "Erreur lors de l'envoi");
    } else {
      setPushSent(data);
      setPushTitle("");
      setPushMessage("");
      fetch("/api/notifications").then((r) => r.json()).then(setPushHistory).catch(console.error);
    }
    setPushSending(false);
  }

  async function handleSendEmail(e: React.FormEvent) {
    e.preventDefault();
    setEmailSending(true);
    setEmailError("");
    setEmailSent(null);
    const res = await fetch("/api/notifications/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject: emailSubject, message: emailMessage }),
    });
    const data = await res.json();
    if (!res.ok) {
      setEmailError(data.error || "Erreur lors de l'envoi");
    } else {
      setEmailSent(data);
      setEmailSubject("");
      setEmailMessage("");
      fetch("/api/notifications/email").then((r) => r.json()).then(setEmailHistory).catch(console.error);
    }
    setEmailSending(false);
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Notifications</h1>
        <p className="text-slate-400 mt-1">Envoyez des messages à tous vos clients</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 p-1 bg-white/5 rounded-xl border border-white/10 w-fit">
        <button
          onClick={() => setTab("email")}
          className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            tab === "email" ? "gold-gradient text-black" : "text-slate-400 hover:text-white"
          }`}
        >
          📧 Email
        </button>
        <button
          onClick={() => setTab("push")}
          className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            tab === "push" ? "gold-gradient text-black" : "text-slate-400 hover:text-white"
          }`}
        >
          🔔 Push
        </button>
      </div>

      {/* ─── Email Tab ─── */}
      {tab === "email" && (
        <>
          <div className="p-6 rounded-2xl border border-white/10 bg-white/5 mb-8">
            <h2 className="text-lg font-bold text-white mb-1">📧 Envoyer un email</h2>
            <p className="text-slate-400 text-sm mb-5">Vos clients recevront l&apos;email sur leur adresse d&apos;inscription.</p>

            {emailSent && (
              <div className="p-4 rounded-xl border border-green-500/20 bg-green-500/10 text-green-400 mb-5">
                ✓ Email envoyé à {emailSent.sentCount} client{emailSent.sentCount > 1 ? "s" : ""}
              </div>
            )}
            {emailError && (
              <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 mb-5">
                {emailError}
              </div>
            )}

            <form onSubmit={handleSendEmail} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Objet de l&apos;email</label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  required
                  maxLength={100}
                  placeholder="Offre spéciale ce week-end !"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Message <span className="text-slate-500">({emailMessage.length}/500)</span>
                </label>
                <textarea
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}
                  required
                  maxLength={500}
                  rows={5}
                  placeholder="Bonjour ! Profitez de -20% sur toute la carte ce samedi. Présentez votre carte de fidélité en caisse pour en bénéficier."
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors resize-none"
                />
              </div>

              {/* Preview */}
              {(emailSubject || emailMessage) && (
                <div className="p-4 rounded-xl border border-white/10 bg-slate-800">
                  <p className="text-xs text-slate-500 mb-3 uppercase tracking-widest">Aperçu</p>
                  <div className="bg-[#1e293b] rounded-lg overflow-hidden border border-white/10">
                    <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2 flex items-center gap-2">
                      <span className="font-black text-black text-sm">FP</span>
                      <span className="text-black font-bold text-sm">Fidelity Pass</span>
                    </div>
                    <div className="p-4">
                      <p className="text-white font-bold text-sm mb-1">{emailSubject || "Objet de l'email"}</p>
                      <p className="text-slate-400 text-xs leading-relaxed">{emailMessage || "Votre message..."}</p>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={emailSending || !emailSubject || !emailMessage}
                className="w-full py-3 rounded-xl gold-gradient text-black font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {emailSending ? "Envoi en cours..." : "Envoyer l'email à tous mes clients"}
              </button>
            </form>
          </div>

          {/* Email History */}
          <h2 className="text-lg font-bold text-white mb-4">Historique des emails</h2>
          {emailHistory.length === 0 ? (
            <p className="text-slate-500 text-center py-8">Aucun email envoyé</p>
          ) : (
            <div className="space-y-3">
              {emailHistory.map((notif) => (
                <div key={notif.id} className="p-5 rounded-2xl border border-white/10 bg-white/5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-white font-semibold">{notif.subject}</p>
                      <p className="text-slate-400 text-sm mt-1 line-clamp-2">{notif.body}</p>
                    </div>
                    <div className="text-right ml-4 flex-shrink-0">
                      <span className="text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-400">✓ Envoyé</span>
                      <p className="text-slate-500 text-xs mt-2">{notif.sentCount} destinataire{notif.sentCount > 1 ? "s" : ""}</p>
                    </div>
                  </div>
                  <p className="text-slate-600 text-xs mt-3">
                    {new Date(notif.sentAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ─── Push Tab ─── */}
      {tab === "push" && (
        <>
          <div className="p-6 rounded-2xl border border-white/10 bg-white/5 mb-8">
            <h2 className="text-lg font-bold text-white mb-1">🔔 Notification push</h2>
            <p className="text-slate-400 text-sm mb-5">Envoyez une notification instantanée aux clients ayant activé les alertes.</p>

            {pushSent && (
              <div className="p-4 rounded-xl border border-green-500/20 bg-green-500/10 text-green-400 mb-5">
                ✓ Notification envoyée à {pushSent.sentCount} client{pushSent.sentCount > 1 ? "s" : ""}
              </div>
            )}
            {pushError && (
              <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 mb-5">{pushError}</div>
            )}

            <form onSubmit={handleSendPush} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Titre</label>
                <input
                  type="text"
                  value={pushTitle}
                  onChange={(e) => setPushTitle(e.target.value)}
                  required
                  maxLength={65}
                  placeholder="Offre spéciale ce week-end !"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Message <span className="text-slate-500">({pushMessage.length}/200)</span>
                </label>
                <textarea
                  value={pushMessage}
                  onChange={(e) => setPushMessage(e.target.value)}
                  required
                  maxLength={200}
                  rows={4}
                  placeholder="Profitez de -20% sur toute la carte ce samedi !"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors resize-none"
                />
              </div>
              {(pushTitle || pushMessage) && (
                <div className="p-4 rounded-xl border border-white/10 bg-slate-800">
                  <p className="text-xs text-slate-500 mb-2 uppercase tracking-widest">Aperçu</p>
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-xl gold-gradient flex items-center justify-center text-black font-bold text-sm flex-shrink-0">FP</div>
                    <div>
                      <p className="text-white font-semibold text-sm">{pushTitle || "Titre"}</p>
                      <p className="text-slate-400 text-xs mt-1">{pushMessage || "Message..."}</p>
                    </div>
                  </div>
                </div>
              )}
              <button
                type="submit"
                disabled={pushSending || !pushTitle || !pushMessage}
                className="w-full py-3 rounded-xl gold-gradient text-black font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {pushSending ? "Envoi en cours..." : "Envoyer la notification push"}
              </button>
            </form>
          </div>

          <h2 className="text-lg font-bold text-white mb-4">Historique push</h2>
          {pushHistory.length === 0 ? (
            <p className="text-slate-500 text-center py-8">Aucune notification envoyée</p>
          ) : (
            <div className="space-y-3">
              {pushHistory.map((notif) => (
                <div key={notif.id} className="p-5 rounded-2xl border border-white/10 bg-white/5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-white font-semibold">{notif.title}</p>
                      <p className="text-slate-400 text-sm mt-1">{notif.body}</p>
                    </div>
                    <div className="text-right ml-4 flex-shrink-0">
                      <span className={`text-xs px-2 py-1 rounded-full ${notif.status === "SENT" ? "bg-green-500/10 text-green-400" : "bg-slate-500/10 text-slate-400"}`}>
                        {notif.status === "SENT" ? "✓ Envoyé" : notif.status}
                      </span>
                      <p className="text-slate-500 text-xs mt-2">{notif.sentCount} destinataire{notif.sentCount > 1 ? "s" : ""}</p>
                    </div>
                  </div>
                  <p className="text-slate-600 text-xs mt-3">
                    {new Date(notif.sentAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
