"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useState, useEffect } from "react";
import PinGate from "@/components/PinGate";

// SVG Icons
function Icon({ name, className = "w-4 h-4" }: { name: string; className?: string }) {
  const icons: Record<string, React.ReactNode> = {
    dashboard: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className={className}>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
    users: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className={className}>
        <circle cx="9" cy="7" r="4" />
        <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" strokeLinecap="round" />
        <path d="M21 21v-2a4 4 0 0 0-3-3.87" strokeLinecap="round" />
      </svg>
    ),
    scan: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className={className}>
        <path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2" strokeLinecap="round" />
        <rect x="7" y="7" width="3" height="3" rx="0.5" />
        <rect x="14" y="7" width="3" height="3" rx="0.5" />
        <rect x="7" y="14" width="3" height="3" rx="0.5" />
        <path d="M14 14h3v3h-3z" />
      </svg>
    ),
    card: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className={className}>
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <path d="M2 10h20" strokeLinecap="round" />
        <path d="M6 15h4" strokeLinecap="round" />
      </svg>
    ),
    gift: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className={className}>
        <polyline points="20 12 20 22 4 22 4 12" />
        <rect x="2" y="7" width="20" height="5" rx="1" />
        <line x1="12" y1="22" x2="12" y2="7" />
        <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
        <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
      </svg>
    ),
    bell: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className={className}>
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" strokeLinecap="round" />
      </svg>
    ),
    settings: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className={className}>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
    logout: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className={className}>
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" strokeLinecap="round" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" strokeLinecap="round" />
      </svg>
    ),
    menu: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className={className}>
        <line x1="3" y1="6" x2="21" y2="6" strokeLinecap="round" />
        <line x1="3" y1="12" x2="21" y2="12" strokeLinecap="round" />
        <line x1="3" y1="18" x2="21" y2="18" strokeLinecap="round" />
      </svg>
    ),
    close: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className={className}>
        <line x1="18" y1="6" x2="6" y2="18" strokeLinecap="round" />
        <line x1="6" y1="6" x2="18" y2="18" strokeLinecap="round" />
      </svg>
    ),
    chevron: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className={className}>
        <polyline points="9 18 15 12 9 6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  };
  return <>{icons[name] || null}</>;
}

const navItems = [
  { href: "/dashboard", label: "Vue d'ensemble", icon: "dashboard", exact: true },
  { href: "/dashboard/clients", label: "Clients", icon: "users" },
  { href: "/dashboard/scanner", label: "Scanner", icon: "scan" },
  { href: "/dashboard/carte", label: "Ma carte", icon: "card" },
  { href: "/dashboard/recompenses", label: "Récompenses", icon: "gift" },
  { href: "/dashboard/notifications", label: "Notifications", icon: "bell" },
  { href: "/dashboard/parametres", label: "Paramètres", icon: "settings" },
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

  useEffect(() => { setSidebarOpen(false); }, [pathname]);

  useEffect(() => {
    const handleResize = () => { if (window.innerWidth >= 1024) setSidebarOpen(false); };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}>
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-slate-400 text-sm">Chargement...</span>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    redirect("/login");
  }

  const initials = session?.user?.name
    ? session.user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : session?.user?.email?.[0]?.toUpperCase() || "?";

  return (
    <PinGate storageKey="pro">
      <div className="min-h-screen flex" style={{ background: "var(--bg)" }}>

        {/* Overlay mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-20 lg:hidden"
            style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed h-full z-30 w-60 flex flex-col transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
          style={{ background: "var(--surface-1)", borderRight: "1px solid var(--border)" }}
        >
          {/* Logo */}
          <div className="px-5 h-14 flex items-center justify-between flex-shrink-0" style={{ borderBottom: "1px solid var(--border)" }}>
            <Link href="/dashboard" className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg gold-gradient flex items-center justify-center text-black font-bold text-xs">FC</div>
              <span className="font-semibold text-white text-sm tracking-tight">Fidco</span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded-md text-slate-500 hover:text-white transition-colors"
            >
              <Icon name="close" className="w-4 h-4" />
            </button>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
            {navItems.map((item) => {
              const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                    active
                      ? "text-white"
                      : "text-slate-500 hover:text-slate-200 hover:bg-white/5"
                  }`}
                  style={active ? { background: "var(--surface-3)", color: "white" } : {}}
                >
                  <span className={active ? "text-amber-400" : "text-slate-600 group-hover:text-slate-400 transition-colors"}>
                    <Icon name={item.icon} className="w-4 h-4" />
                  </span>
                  {item.label}
                  {active && (
                    <span className="ml-auto w-1 h-1 rounded-full bg-amber-400" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User footer */}
          <div className="px-3 py-3 flex-shrink-0" style={{ borderTop: "1px solid var(--border)" }}>
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1" style={{ background: "var(--surface-2)" }}>
              <div className="w-7 h-7 rounded-full gold-gradient flex items-center justify-center text-black text-xs font-bold flex-shrink-0">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-xs font-medium truncate leading-tight">
                  {session?.user?.name || session?.user?.email}
                </p>
                <p className="text-slate-500 text-xs leading-tight mt-0.5">
                  {userPlan === "PRO" ? "Pro" : "Starter"}
                </p>
              </div>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-slate-500 hover:text-slate-200 text-xs font-medium transition-colors hover:bg-white/5"
            >
              <Icon name="logout" className="w-3.5 h-3.5" />
              Déconnexion
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 lg:ml-60 flex flex-col min-h-screen">
          {/* Top bar */}
          <div className="lg:hidden flex items-center gap-3 px-4 h-14 flex-shrink-0 sticky top-0 z-10" style={{ background: "var(--surface-1)", borderBottom: "1px solid var(--border)" }}>
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors"
              style={{ background: "var(--surface-2)" }}
            >
              <Icon name="menu" className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md gold-gradient flex items-center justify-center text-black font-bold text-xs">FC</div>
              <span className="font-semibold text-white text-sm">Fidco</span>
            </div>
          </div>

          {/* Upgrade banner */}
          {userPlan === "STARTER" && (
            <div className="px-6 py-2.5 text-center text-xs flex items-center justify-center gap-2" style={{ background: "rgba(245,158,11,0.08)", borderBottom: "1px solid rgba(245,158,11,0.15)" }}>
              <span className="text-amber-400/80">Passez Pro pour débloquer toutes les fonctionnalités</span>
              <Link href="/tarifs" className="text-amber-400 font-semibold hover:text-amber-300 transition-colors underline underline-offset-2">
                7 jours gratuits →
              </Link>
            </div>
          )}

          <div className="flex-1 p-6 lg:p-8 fade-in">
            {children}
          </div>
        </main>
      </div>
    </PinGate>
  );
}
