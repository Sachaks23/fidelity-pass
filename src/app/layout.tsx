import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Fidelity Pass - Cartes de fidélité digitales",
  description: "Créez et gérez votre programme de fidélité digital. Exportez sur Apple Wallet et Google Wallet.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
