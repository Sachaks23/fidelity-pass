"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import PinGate from "@/components/PinGate";
import { useEffect } from "react";

const tabs = [
  { href: "/espace-client", label: "Mes cartes", icon: "💳" },
  { href: "/espace-client/historique", label: "Historique", icon: "📋" },
  { href: "/espace-client/compte", label: "Mon compte", icon: "👤" },
];

export default function EspaceClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") router.push("/connexion/client");
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="text-4xl animate-pulse">💳</div>
      </div>
    );
  }

  return (
    <PinGate storageKey="client">
    <div className="min-h-screen bg-[#0f172a] flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-white/10 px-4 py-3 flex items-center justify-between bg-[#0f172a]/95 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gold-gradient flex items-center justify-center text-black font-bold text-xs">FC</div>
          <span className="font-bold text-white text-sm">Fidco</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white text-xs font-bold">
            {session?.user?.name?.split(" ")[0]?.[0]?.toUpperCase() ?? "?"}
          </div>
          <span className="text-slate-300 text-sm font-medium">
            {session?.user?.name?.split(" ")[0]}
          </span>
        </div>
      </header>

      {/* Contenu */}
      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-6 pb-24">
        {children}
      </main>

      {/* Barre de navigation bas (style mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 z-10 border-t border-white/10 bg-[#0f172a]/95 backdrop-blur-md">
        <div className="max-w-lg mx-auto flex">
          {tabs.map((tab) => {
            const active = pathname === tab.href;
            return (
              <Link key={tab.href} href={tab.href}
                className={`flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors ${
                  active ? "text-amber-400" : "text-slate-500 hover:text-slate-300"
                }`}>
                <span className="text-xl">{tab.icon}</span>
                <span>{tab.label}</span>
                {active && <div className="w-1 h-1 rounded-full bg-amber-400" />}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
    </PinGate>
  );
}
