"use client";
import { useState, useEffect } from "react";

type Tab = "email" | "push";

interface PushNotification {
  id: string; title: string; body: string; sentAt: string; status: string; sentCount: number;
}
interface EmailNotification {
  id: string; subject: string; body: string; sentAt: string; sentCount: number; status: string;
}

const inputClass = "w-full px-3.5 py-2.5 rounded-lg text-sm text-white placeholder-slate-600 transition-colors focus:outline-none";
const inputStyle = { background: "var(--surface-2)", border: "1px solid var(--border)" };

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function NotificationsPage() {
  const [tab, setTab] = useState<Tab>("email");

  const [pushTitle, setPushTitle] = useState("");
  const [pushMessage, setPushMessage] = useState("");
  const [pushSending, setPushSending] = useState(false);
  const [pushSent, setPushSent] = useState<{ sentCount: number } | null>(null);
  const [pushError, setPushError] = useState("");
  const [pushHistory, setPushHistory] = useState<PushNotification[]>([]);

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
    setPushSending(true); setPushError(""); setPushSent(null);
    const res = await fetch("/api/notifications", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: pushTitle, message: pushMessage }) });
    const data = await res.json();
    if (!res.ok) setPushError(data.error || "Erreur lors de l'envoi");
    else { setPushSent(data); setPushTitle(""); setPushMessage(""); fetch("/api/notifications").then((r) => r.json()).then(setPushHistory); }
    setPushSending(false);
  }

  async function handleSendEmail(e: React.FormEvent) {
    e.preventDefault();
    setEmailSending(true); setEmailError(""); setEmailSent(null);
    const res = await fetch("/api/notifications/email", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ subject: emailSubject, message: emailMessage }) });
    const data = await res.json();
    if (!res.ok) setEmailError(data.error || "Erreur lors de l'envoi");
    else { setEmailSent(data); setEmailSubject(""); setEmailMessage(""); fetch("/api/notifications/email").then((r) => r.json()).then(setEmailHistory); }
    setEmailSending(false);
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-white">Notifications</h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>Envoyez des messages à tous vos clients</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 rounded-lg w-fit" style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}>
        {[
          { key: "email", label: "Email", icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-3.5 h-3.5">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
          )},
          { key: "push", label: "Push", icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-3.5 h-3.5">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" strokeLinecap="round" />
            </svg>
          )},
        ].map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => setTab(key as Tab)}
            className="flex items-center gap-2 px-4 py-2 rounded-md text-xs font-semibold transition-all"
            style={tab === key
              ? { background: "var(--surface-3)", color: "white" }
              : { color: "var(--text-muted)" }
            }
          >
            {icon}{label}
          </button>
        ))}
      </div>

      {/* Email */}
      {tab === "email" && (
        <>
          <div className="rounded-xl p-5 mb-4" style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>Composer un email</p>
            <p className="text-sm text-white font-medium mb-4">Envoyé sur l&apos;adresse d&apos;inscription de chaque client</p>

            {emailSent && (
              <div className="rounded-lg p-3 mb-4 text-xs font-medium" style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", color: "#22c55e" }}>
                Email envoyé à {emailSent.sentCount} client{emailSent.sentCount > 1 ? "s" : ""}
              </div>
            )}
            {emailError && (
              <div className="rounded-lg p-3 mb-4 text-xs" style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444" }}>
                {emailError}
              </div>
            )}

            <form onSubmit={handleSendEmail} className="space-y-3">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Objet</label>
                <input type="text" value={emailSubject} onChange={(e) => setEmailSubject(e.target.value)} required maxLength={100}
                  placeholder="Offre spéciale ce week-end !" className={inputClass} style={inputStyle} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                  Message <span style={{ color: "var(--text-muted)" }}>({emailMessage.length}/500)</span>
                </label>
                <textarea value={emailMessage} onChange={(e) => setEmailMessage(e.target.value)} required maxLength={500} rows={5}
                  placeholder="Bonjour ! Profitez de -20% sur toute la carte ce samedi..."
                  className={inputClass + " resize-none"} style={inputStyle} />
              </div>

              {(emailSubject || emailMessage) && (
                <div className="rounded-lg p-3" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                  <p className="text-xs uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>Aperçu</p>
                  <div className="rounded-lg overflow-hidden" style={{ border: "1px solid var(--border)" }}>
                    <div className="px-3 py-2 flex items-center gap-2 gold-gradient">
                      <span className="font-bold text-black text-xs">FC</span>
                      <span className="text-black text-xs font-semibold">Fidco</span>
                    </div>
                    <div className="p-3" style={{ background: "var(--surface-1)" }}>
                      <p className="text-white text-xs font-semibold mb-1">{emailSubject || "Objet de l'email"}</p>
                      <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>{emailMessage || "Votre message..."}</p>
                    </div>
                  </div>
                </div>
              )}

              <button type="submit" disabled={emailSending || !emailSubject || !emailMessage}
                className="w-full py-2.5 rounded-lg text-sm font-semibold gold-gradient text-black hover:opacity-90 transition-opacity disabled:opacity-40">
                {emailSending ? "Envoi en cours..." : "Envoyer à tous mes clients"}
              </button>
            </form>
          </div>

          {/* Historique email */}
          {emailHistory.length > 0 && (
            <>
              <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-muted)" }}>Historique</p>
              <div className="space-y-2">
                {emailHistory.map((notif) => (
                  <div key={notif.id} className="rounded-xl p-4 flex items-start gap-4" style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{notif.subject}</p>
                      <p className="text-xs mt-0.5 line-clamp-1" style={{ color: "var(--text-muted)" }}>{notif.body}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="inline-block text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: "rgba(34,197,94,0.1)", color: "#22c55e" }}>
                        {notif.sentCount} envoi{notif.sentCount > 1 ? "s" : ""}
                      </span>
                      <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{formatDate(notif.sentAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}

      {/* Push */}
      {tab === "push" && (
        <>
          <div className="rounded-xl p-5 mb-4" style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>Notification push</p>
            <p className="text-sm text-white font-medium mb-4">Envoyée aux clients ayant activé les alertes</p>

            {pushSent && (
              <div className="rounded-lg p-3 mb-4 text-xs font-medium" style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)", color: "#22c55e" }}>
                Notification envoyée à {pushSent.sentCount} client{pushSent.sentCount > 1 ? "s" : ""}
              </div>
            )}
            {pushError && (
              <div className="rounded-lg p-3 mb-4 text-xs" style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)", color: "#ef4444" }}>
                {pushError}
              </div>
            )}

            <form onSubmit={handleSendPush} className="space-y-3">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Titre</label>
                <input type="text" value={pushTitle} onChange={(e) => setPushTitle(e.target.value)} required maxLength={65}
                  placeholder="Offre spéciale ce week-end !" className={inputClass} style={inputStyle} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                  Message <span style={{ color: "var(--text-muted)" }}>({pushMessage.length}/200)</span>
                </label>
                <textarea value={pushMessage} onChange={(e) => setPushMessage(e.target.value)} required maxLength={200} rows={3}
                  placeholder="Profitez de -20% sur toute la carte ce samedi !"
                  className={inputClass + " resize-none"} style={inputStyle} />
              </div>

              {(pushTitle || pushMessage) && (
                <div className="rounded-lg p-3" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                  <p className="text-xs uppercase tracking-wider mb-2" style={{ color: "var(--text-muted)" }}>Aperçu</p>
                  <div className="flex gap-3 items-start">
                    <div className="w-9 h-9 rounded-xl gold-gradient flex items-center justify-center text-black font-bold text-xs flex-shrink-0">FC</div>
                    <div>
                      <p className="text-sm font-semibold text-white leading-tight">{pushTitle || "Titre"}</p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{pushMessage || "Message..."}</p>
                    </div>
                  </div>
                </div>
              )}

              <button type="submit" disabled={pushSending || !pushTitle || !pushMessage}
                className="w-full py-2.5 rounded-lg text-sm font-semibold gold-gradient text-black hover:opacity-90 transition-opacity disabled:opacity-40">
                {pushSending ? "Envoi en cours..." : "Envoyer la notification"}
              </button>
            </form>
          </div>

          {/* Historique push */}
          {pushHistory.length > 0 && (
            <>
              <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--text-muted)" }}>Historique</p>
              <div className="space-y-2">
                {pushHistory.map((notif) => (
                  <div key={notif.id} className="rounded-xl p-4 flex items-start gap-4" style={{ background: "var(--surface-1)", border: "1px solid var(--border)" }}>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white">{notif.title}</p>
                      <p className="text-xs mt-0.5 line-clamp-1" style={{ color: "var(--text-muted)" }}>{notif.body}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${notif.status === "SENT" ? "" : ""}`}
                        style={notif.status === "SENT"
                          ? { background: "rgba(34,197,94,0.1)", color: "#22c55e" }
                          : { background: "var(--surface-2)", color: "var(--text-muted)" }
                        }
                      >
                        {notif.sentCount} envoi{notif.sentCount > 1 ? "s" : ""}
                      </span>
                      <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{formatDate(notif.sentAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
