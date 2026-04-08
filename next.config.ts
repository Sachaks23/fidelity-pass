import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Autorise l'accès depuis l'IP locale (téléphones sur le même WiFi)
  allowedDevOrigins: ["192.168.1.10"],
};

export default nextConfig;
