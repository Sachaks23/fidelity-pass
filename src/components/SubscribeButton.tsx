"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface SubscribeButtonProps {
  priceId: string;
  planName: string;
  highlight?: boolean;
}

export default function SubscribeButton({ priceId, planName, highlight = false }: SubscribeButtonProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (status === "loading") return;

    if (!session?.user) {
      router.push("/connexion/pro");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error("Checkout error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`block w-full text-center py-3 px-6 rounded-xl font-semibold text-sm transition-opacity hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed ${
        highlight
          ? "gold-gradient text-black"
          : "border border-white/20 text-white hover:bg-white/5"
      }`}
    >
      {loading ? "Chargement..." : `Souscrire ${planName}`}
    </button>
  );
}
