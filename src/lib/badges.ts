export interface Badge {
  id: string;
  label: string;
  description: string;
  unlocked: boolean;
  color: string;
  bg: string;
  border: string;
  svgPath: string;
}

export function computeBadges(params: {
  scanCount: number;
  totalPointsEarned: number;
  hasReferral: boolean;
  cardCount: number;
}): Badge[] {
  const { scanCount, totalPointsEarned, hasReferral, cardCount } = params;

  return [
    {
      id: "welcome",
      label: "Bienvenue",
      description: "Vous avez rejoint le programme",
      unlocked: true, // toujours débloqué
      color: "#60a5fa",
      bg: "rgba(96,165,250,0.12)",
      border: "rgba(96,165,250,0.25)",
      svgPath: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
    },
    {
      id: "regular",
      label: "Habitué",
      description: "5 visites effectuées",
      unlocked: scanCount >= 5,
      color: "#34d399",
      bg: "rgba(52,211,153,0.12)",
      border: "rgba(52,211,153,0.25)",
      svgPath: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
    },
    {
      id: "loyal",
      label: "Fidèle",
      description: "10 visites effectuées",
      unlocked: scanCount >= 10,
      color: "#f59e0b",
      bg: "rgba(245,158,11,0.12)",
      border: "rgba(245,158,11,0.25)",
      svgPath: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
    },
    {
      id: "vip",
      label: "VIP",
      description: "300 points cumulés ou 20 visites",
      unlocked: totalPointsEarned >= 300 || scanCount >= 20,
      color: "#e879f9",
      bg: "rgba(232,121,249,0.12)",
      border: "rgba(232,121,249,0.25)",
      svgPath: "M11.562 3.322A2 2 0 0 1 13.5 2.1h3a2 2 0 0 1 2 1.8l.3 2.4A2 2 0 0 0 21 8.1v1.8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8.1a2 2 0 0 0 2.2-1.8l.3-2.4A2 2 0 0 1 7.5 2.1h4.062zM7 14l-2 8h14l-2-8",
    },
    {
      id: "referral",
      label: "Parrain",
      description: "Vous avez parrainé un ami",
      unlocked: hasReferral,
      color: "#fb923c",
      bg: "rgba(251,146,60,0.12)",
      border: "rgba(251,146,60,0.25)",
      svgPath: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM19 8v6M22 11h-6",
    },
    {
      id: "collector",
      label: "Collectionneur",
      description: "Cartes dans 2 commerces ou plus",
      unlocked: cardCount >= 2,
      color: "#a78bfa",
      bg: "rgba(167,139,250,0.12)",
      border: "rgba(167,139,250,0.25)",
      svgPath: "M2 5h20v14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5zM2 10h20M7 15h4",
    },
  ];
}
