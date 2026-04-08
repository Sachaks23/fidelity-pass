"use client";
import { useState, useEffect, useCallback } from "react";

interface Props {
  children: React.ReactNode;
  storageKey: string; // unique per space (client/pro)
}

const SECURITY_QUESTIONS = [
  "Quel est le prénom de votre mère ?",
  "Quel est le prénom de votre père ?",
  "Quelle est la date de naissance de votre père ?",
  "Quelle est la date de naissance de votre mère ?",
  "Quel est le nom de votre animal de compagnie d'enfance ?",
  "Dans quelle ville êtes-vous né(e) ?",
  "Quel est le prénom de votre meilleur(e) ami(e) d'enfance ?",
];

type Screen = "checking" | "enter" | "setup-pin" | "setup-question" | "recovery-answer" | "recovery-newpin" | "none";

export default function PinGate({ children, storageKey }: Props) {
  const [screen, setScreen] = useState<Screen>("checking");
  const [pin, setPin] = useState("");
  const [pinConfirm, setPinConfirm] = useState("");
  const [pinError, setPinError] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [remember, setRemember] = useState(false);

  // Setup
  const [setupPin, setSetupPin] = useState("");
  const [setupPinConfirm, setSetupPinConfirm] = useState("");
  const [setupQuestion, setSetupQuestion] = useState(SECURITY_QUESTIONS[0]);
  const [setupAnswer, setSetupAnswer] = useState("");
  const [setupError, setSetupError] = useState("");

  // Recovery
  const [recoveryAnswer, setRecoveryAnswer] = useState("");
  const [recoveryQuestion, setRecoveryQuestion] = useState("");
  const [newPin, setNewPin] = useState("");
  const [newPinConfirm, setNewPinConfirm] = useState("");
  const [recoveryError, setRecoveryError] = useState("");

  const isPinVerified = useCallback(() => {
    try {
      const val = localStorage.getItem(`${storageKey}_pin_verified`);
      if (!val) return false;
      const { expires } = JSON.parse(val);
      return Date.now() < expires;
    } catch { return false; }
  }, [storageKey]);

  useEffect(() => {
    async function init() {
      // Check if already verified
      if (isPinVerified()) { setScreen("none"); return; }
      // Check if user has PIN
      const res = await fetch("/api/auth/pin");
      if (!res.ok) { setScreen("none"); return; }
      const data = await res.json();
      if (!data.hasPin) { setScreen("setup-pin"); return; }
      setRecoveryQuestion(data.securityQuestion ?? "");
      setScreen("enter");
    }
    init();
  }, [isPinVerified]);

  function markVerified() {
    const duration = remember ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
    localStorage.setItem(`${storageKey}_pin_verified`, JSON.stringify({ expires: Date.now() + duration }));
    setScreen("none");
  }

  async function handleVerify() {
    if (pin.length !== 4) return;
    setPinError("");
    const res = await fetch("/api/auth/pin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin }),
    });
    if (res.ok) {
      markVerified();
    } else {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      setPin("");
      if (newAttempts >= 3) {
        setPinError("Trop de tentatives. Utilisez la récupération.");
      } else {
        setPinError(`PIN incorrect (${3 - newAttempts} essai${3 - newAttempts > 1 ? "s" : ""} restant${3 - newAttempts > 1 ? "s" : ""})`);
      }
    }
  }

  async function handleSetup() {
    setSetupError("");
    if (setupPin.length !== 4 || !/^\d{4}$/.test(setupPin)) {
      setSetupError("Le PIN doit être composé de 4 chiffres");
      return;
    }
    if (setupPin !== setupPinConfirm) {
      setSetupError("Les PINs ne correspondent pas");
      return;
    }
    if (!setupAnswer.trim()) {
      setSetupError("Veuillez répondre à la question secrète");
      return;
    }
    const res = await fetch("/api/auth/pin", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin: setupPin, securityQuestion: setupQuestion, securityAnswer: setupAnswer }),
    });
    if (res.ok) {
      markVerified();
    } else {
      const d = await res.json();
      setSetupError(d.error || "Erreur");
    }
  }

  async function handleRecoveryVerify() {
    setRecoveryError("");
    const res = await fetch("/api/auth/pin/recovery", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ securityAnswer: recoveryAnswer, newPin: "0000" }),
    });
    if (res.ok || (await res.json().then(d => d.error !== "Réponse incorrecte"))) {
      setScreen("recovery-newpin");
    } else {
      setRecoveryError("Réponse incorrecte");
    }
  }

  async function handleCheckAnswer() {
    setRecoveryError("");
    if (!recoveryAnswer.trim()) { setRecoveryError("Veuillez répondre à la question"); return; }
    // Just check the answer by trying with a dummy pin (we'll handle properly)
    const res = await fetch("/api/auth/pin/recovery", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ securityAnswer: recoveryAnswer, newPin: "0000" }),
    });
    const data = await res.json();
    if (res.ok || (data.error && data.error !== "Réponse incorrecte")) {
      setScreen("recovery-newpin");
    } else {
      setRecoveryError("Réponse incorrecte. Réessayez.");
    }
  }

  async function handleRecoveryNewPin() {
    setRecoveryError("");
    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      setRecoveryError("PIN invalide (4 chiffres)");
      return;
    }
    if (newPin !== newPinConfirm) {
      setRecoveryError("Les PINs ne correspondent pas");
      return;
    }
    const res = await fetch("/api/auth/pin/recovery", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ securityAnswer: recoveryAnswer, newPin }),
    });
    if (res.ok) {
      markVerified();
    } else {
      const d = await res.json();
      setRecoveryError(d.error || "Erreur");
    }
  }

  function handlePinInput(digit: string) {
    if (pin.length < 4) {
      const newPin = pin + digit;
      setPin(newPin);
      setPinError("");
      if (newPin.length === 4) {
        setTimeout(() => {
          fetch("/api/auth/pin", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ pin: newPin }),
          }).then(async (res) => {
            if (res.ok) {
              markVerified();
            } else {
              const att = attempts + 1;
              setAttempts(att);
              setPin("");
              if (att >= 3) {
                setPinError("Trop de tentatives. Utilisez la récupération.");
              } else {
                setPinError(`PIN incorrect — ${3 - att} essai${3 - att > 1 ? "s" : ""} restant${3 - att > 1 ? "s" : ""}`);
              }
            }
          });
        }, 100);
      }
    }
  }

  function handleSetupPinInput(digit: string, which: "pin" | "confirm") {
    if (which === "pin" && setupPin.length < 4) setSetupPin(setupPin + digit);
    if (which === "confirm" && setupPinConfirm.length < 4) setSetupPinConfirm(setupPinConfirm + digit);
  }

  function handleNewPinInput(digit: string, which: "pin" | "confirm") {
    if (which === "pin" && newPin.length < 4) setNewPin(newPin + digit);
    if (which === "confirm" && newPinConfirm.length < 4) setNewPinConfirm(newPinConfirm + digit);
  }

  const PinDots = ({ value, length = 4 }: { value: string; length?: number }) => (
    <div className="flex gap-4 justify-center my-6">
      {Array.from({ length }).map((_, i) => (
        <div key={i} className={`w-5 h-5 rounded-full border-2 transition-all ${
          i < value.length ? "bg-amber-400 border-amber-400 scale-110" : "border-white/30"
        }`} />
      ))}
    </div>
  );

  const Numpad = ({ onPress, onDelete }: { onPress: (d: string) => void; onDelete: () => void }) => (
    <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
      {["1","2","3","4","5","6","7","8","9","","0","⌫"].map((k, i) => (
        k === "" ? <div key={i} /> :
        <button key={i} onClick={() => k === "⌫" ? onDelete() : onPress(k)}
          className={`h-16 rounded-2xl text-xl font-bold transition-all active:scale-95 ${
            k === "⌫" ? "bg-white/5 text-slate-400 hover:bg-white/10" : "bg-white/10 text-white hover:bg-white/20"
          }`}>
          {k}
        </button>
      ))}
    </div>
  );

  if (screen === "checking") {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="text-4xl animate-pulse">🔐</div>
      </div>
    );
  }

  if (screen === "none") return <>{children}</>;

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl gold-gradient flex items-center justify-center text-black font-bold text-2xl mx-auto mb-3">FC</div>
          <p className="text-white font-bold text-xl">Fidco</p>
        </div>

        {/* Enter PIN */}
        {screen === "enter" && (
          <>
            <h2 className="text-center text-white font-bold text-xl mb-1">Entrez votre code PIN</h2>
            <p className="text-center text-slate-400 text-sm mb-2">4 chiffres pour accéder à votre espace</p>
            <PinDots value={pin} />
            {pinError && <p className="text-center text-red-400 text-sm mb-3">{pinError}</p>}
            <Numpad onPress={handlePinInput} onDelete={() => setPin(p => p.slice(0, -1))} />
            <div className="flex items-center justify-between mt-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)}
                  className="w-4 h-4 rounded accent-amber-400" />
                <span className="text-slate-400 text-sm">Rester connecté 30 jours</span>
              </label>
              {attempts >= 3 || true ? (
                <button onClick={() => setScreen("recovery-answer")}
                  className="text-amber-400 text-sm hover:text-amber-300">
                  PIN oublié ?
                </button>
              ) : null}
            </div>
          </>
        )}

        {/* Setup PIN */}
        {(screen === "setup-pin" || screen === "setup-question") && (
          <>
            <h2 className="text-center text-white font-bold text-xl mb-1">
              {screen === "setup-pin" ? "Créez votre code PIN" : "Question secrète"}
            </h2>
            <p className="text-center text-slate-400 text-sm mb-2">
              {screen === "setup-pin" ? "Choisissez un code à 4 chiffres" : "Pour récupérer votre PIN si oublié"}
            </p>

            {screen === "setup-pin" && (
              <>
                <p className="text-center text-slate-500 text-xs mb-1">Votre PIN</p>
                <PinDots value={setupPin} />
                <Numpad onPress={(d) => handleSetupPinInput(d, "pin")} onDelete={() => setSetupPin(p => p.slice(0, -1))} />
                {setupPin.length === 4 && (
                  <>
                    <p className="text-center text-slate-500 text-xs mt-4 mb-1">Confirmez le PIN</p>
                    <PinDots value={setupPinConfirm} />
                    <Numpad onPress={(d) => handleSetupPinInput(d, "confirm")} onDelete={() => setSetupPinConfirm(p => p.slice(0, -1))} />
                  </>
                )}
                {setupError && <p className="text-center text-red-400 text-sm mt-3">{setupError}</p>}
                {setupPin.length === 4 && setupPinConfirm.length === 4 && (
                  <button onClick={() => { setSetupError(""); if (setupPin !== setupPinConfirm) { setSetupError("PINs différents"); } else { setScreen("setup-question"); }}}
                    className="w-full mt-4 py-3.5 rounded-xl gold-gradient text-black font-bold hover:opacity-90">
                    Suivant →
                  </button>
                )}
              </>
            )}

            {screen === "setup-question" && (
              <div className="space-y-4 mt-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-2">Question secrète</label>
                  <select value={setupQuestion} onChange={e => setSetupQuestion(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-amber-500">
                    {SECURITY_QUESTIONS.map(q => <option key={q} value={q}>{q}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-2">Votre réponse</label>
                  <input type="text" value={setupAnswer} onChange={e => setSetupAnswer(e.target.value)}
                    placeholder="Répondez ici..."
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500" />
                </div>
                {setupError && <p className="text-red-400 text-sm">{setupError}</p>}
                <button onClick={handleSetup} disabled={!setupAnswer.trim()}
                  className="w-full py-3.5 rounded-xl gold-gradient text-black font-bold hover:opacity-90 disabled:opacity-50">
                  Créer mon PIN
                </button>
                <button onClick={() => setScreen("setup-pin")} className="w-full py-2 text-slate-400 text-sm hover:text-white">
                  ← Retour
                </button>
              </div>
            )}
          </>
        )}

        {/* Recovery — answer question */}
        {screen === "recovery-answer" && (
          <>
            <h2 className="text-center text-white font-bold text-xl mb-1">Récupérer mon PIN</h2>
            <p className="text-center text-slate-400 text-sm mb-6">Répondez à votre question secrète</p>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-slate-300 text-sm font-medium">{recoveryQuestion}</p>
              </div>
              <input type="text" value={recoveryAnswer} onChange={e => setRecoveryAnswer(e.target.value)}
                placeholder="Votre réponse..."
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500" />
              {recoveryError && <p className="text-red-400 text-sm">{recoveryError}</p>}
              <button onClick={handleCheckAnswer} disabled={!recoveryAnswer.trim()}
                className="w-full py-3.5 rounded-xl gold-gradient text-black font-bold hover:opacity-90 disabled:opacity-50">
                Valider
              </button>
              <button onClick={() => setScreen("enter")} className="w-full py-2 text-slate-400 text-sm hover:text-white">
                ← Retour
              </button>
            </div>
          </>
        )}

        {/* Recovery — new PIN */}
        {screen === "recovery-newpin" && (
          <>
            <h2 className="text-center text-white font-bold text-xl mb-1">Nouveau code PIN</h2>
            <p className="text-center text-slate-400 text-sm mb-2">Choisissez un nouveau PIN à 4 chiffres</p>
            <p className="text-center text-slate-500 text-xs mb-1">Nouveau PIN</p>
            <PinDots value={newPin} />
            <Numpad onPress={(d) => handleNewPinInput(d, "pin")} onDelete={() => setNewPin(p => p.slice(0, -1))} />
            {newPin.length === 4 && (
              <>
                <p className="text-center text-slate-500 text-xs mt-4 mb-1">Confirmez</p>
                <PinDots value={newPinConfirm} />
                <Numpad onPress={(d) => handleNewPinInput(d, "confirm")} onDelete={() => setNewPinConfirm(p => p.slice(0, -1))} />
              </>
            )}
            {recoveryError && <p className="text-center text-red-400 text-sm mt-3">{recoveryError}</p>}
            {newPin.length === 4 && newPinConfirm.length === 4 && (
              <button onClick={handleRecoveryNewPin}
                className="w-full mt-4 py-3.5 rounded-xl gold-gradient text-black font-bold hover:opacity-90">
                Enregistrer le nouveau PIN
              </button>
            )}
          </>
        )}

      </div>
    </div>
  );
}
