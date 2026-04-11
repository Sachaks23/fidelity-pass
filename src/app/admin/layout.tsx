import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import FidcoLogo from "@/components/FidcoLogo";
import Link from "next/link";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || (session.user as any).role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", color: "white" }}>
      {/* Topbar */}
      <header
        style={{
          borderBottom: "1px solid var(--border)",
          background: "var(--surface-1)",
          position: "sticky",
          top: 0,
          zIndex: 50,
        }}
      >
        <div
          className="flex items-center justify-between px-6 py-3"
          style={{ maxWidth: "1280px", margin: "0 auto" }}
        >
          <div className="flex items-center gap-3">
            <FidcoLogo size={32} />
            <div className="flex items-center gap-2">
              <span className="text-white font-semibold text-sm">Fidco</span>
              <span style={{ color: "var(--border)" }}>/</span>
              <span className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                Interface Admin
              </span>
            </div>
            <span
              className="text-xs font-bold px-2 py-0.5 rounded"
              style={{ background: "rgba(239,68,68,0.15)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.3)" }}
            >
              ADMIN
            </span>
          </div>

          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
            style={{
              background: "var(--surface-2)",
              color: "var(--text-secondary)",
              border: "1px solid var(--border)",
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} className="w-3.5 h-3.5">
              <path d="M19 12H5M5 12l7-7M5 12l7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Retour dashboard
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="px-6 py-8" style={{ maxWidth: "1280px", margin: "0 auto" }}>
        {children}
      </main>
    </div>
  );
}
