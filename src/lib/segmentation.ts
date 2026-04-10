export type Segment = "nouveau" | "régulier" | "vip" | "inactif";

export function computeSegment(params: {
  scanCount: number;
  totalPointsEarned: number;
  issuedAt: Date;
  lastScanDate: Date | null;
}): Segment {
  const { scanCount, totalPointsEarned, issuedAt, lastScanDate } = params;
  const now = new Date();
  const daysSinceJoined = (now.getTime() - issuedAt.getTime()) / (1000 * 60 * 60 * 24);
  const daysSinceLastScan = lastScanDate
    ? (now.getTime() - lastScanDate.getTime()) / (1000 * 60 * 60 * 24)
    : daysSinceJoined;

  // VIP: 10+ scans OU 300+ points cumulés
  if (scanCount >= 10 || totalPointsEarned >= 300) return "vip";

  // Inactif: dernière visite > 60 jours (et pas nouveau)
  if (daysSinceLastScan > 60 && scanCount > 0) return "inactif";

  // Nouveau: < 3 scans ou inscrit il y a moins de 14 jours
  if (scanCount < 3 || daysSinceJoined < 14) return "nouveau";

  // Régulier
  return "régulier";
}

export const segmentConfig: Record<
  Segment,
  { label: string; color: string; bg: string; border: string }
> = {
  nouveau: {
    label: "Nouveau",
    color: "#60a5fa",
    bg: "rgba(96,165,250,0.1)",
    border: "rgba(96,165,250,0.2)",
  },
  régulier: {
    label: "Régulier",
    color: "#34d399",
    bg: "rgba(52,211,153,0.1)",
    border: "rgba(52,211,153,0.2)",
  },
  vip: {
    label: "VIP",
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.1)",
    border: "rgba(245,158,11,0.2)",
  },
  inactif: {
    label: "Inactif",
    color: "#94a3b8",
    bg: "rgba(148,163,184,0.1)",
    border: "rgba(148,163,184,0.2)",
  },
};
