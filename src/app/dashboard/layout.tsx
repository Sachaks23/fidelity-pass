"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useState, useEffect } from "react";
import PinGate from "@/components/PinGate";

const navItems = [
  { href: "/dashboard", label: "Vue d'ensemble", icon: "📊" },
  { href: "/dashboard/clients", label: "Mes clients", icon: "👥" },
  { href: "/dashboard/scanner", label: "Scanner", icon: "📷" },
  { href: "/dashboard/recompenses", label: "Récompenses", icon: "🎁" },
  { href: "/dashboard/notifications", label: "Notifications", icon: "🔔" },
  { href: "/dashboard/parametres", label: "Paramètres", icon: "⚙️" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userPlan, setUserPlan] = useState<string | null>(null);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/user/plan")
        .then((r) => r.json())
        .then((data) => setUserPlan(data.plan ?? null))
        .catch(() => null);
    }
  }, [status]);

  // Ferme la sidebar quand on change de page
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Ferme la sidebar sur les grands écrans
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setSidebarOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="text-white text-lg animate-pulse">Chargement...</div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    redirect("/login");
  }

  return (
    <PinGate storageKey="pro">
    <div className="min-h-screen bg-[#0f172a] flex">
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed h-full z-30 w-64 border-r border-white/10 flex flex-col transition-transform duration-300 bg-[#0f172a]
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg gold-gradient flex items-center justify-center text-black font-bold text-sm">FC</div>
            <span className="font-bold text-white text-lg">Fidco</span>
          </Link>
          {/* Bouton fermer (mobile) */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 mb-2">
            <div className="w-8 h-8 rounded-full gold-gradient flex items-center justify-center text-black text-xs font-bold">
              {session?.user?.name?.[0]?.toUpperCase() || "?"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-medium truncate">{session?.user?.name || session?.user?.email}</p>
              <p className="text-slate-500 text-xs">Professionnel</p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full text-left px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 text-sm transition-colors"
          >
            🚪 Déconnexion
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top bar mobile */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 border-b border-white/10 sticky top-0 bg-[#0f172a] z-10">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg gold-gradient flex items-center justify-center text-black font-bold text-xs">FC</div>
            <span className="font-bold text-white">Fidco</span>
          </div>
        </div>

        {userPlan === "STARTER" && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2.5 text-center text-sm text-amber-300">
            Passez Pro pour débloquer les notifications et les récompenses illimitées{" "}
            <Link href="/tarifs" className="font-semibold text-amber-400 underline underline-offset-2 hover:text-amber-300 transition-colors">
              → Voir les offres
            </Link>
          </div>
        )}
        <div className="flex-1 p-4 lg:p-8">
          {children}
        </div>
      </main>
    </div>
    </PinGate>
  );
}
