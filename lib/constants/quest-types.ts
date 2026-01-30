export interface QuestTypeInfo {
  id: string;
  name: string;
  description: string;
  baseXp: number;
  icon: string;
  color: string;
}

export const QUEST_TYPES: Record<string, QuestTypeInfo> = {
  cardio: {
    id: "cardio",
    name: "Cardio",
    description: "Corrida, caminhada, ciclismo, natação",
    baseXp: 50,
    icon: "heart-pulse",
    color: "text-health",
  },
  strength: {
    id: "strength",
    name: "Força",
    description: "Musculação, calistenia, crossfit",
    baseXp: 60,
    icon: "dumbbell",
    color: "text-primary-500",
  },
  flexibility: {
    id: "flexibility",
    name: "Flexibilidade",
    description: "Yoga, alongamento, pilates",
    baseXp: 40,
    icon: "stretch",
    color: "text-accent-500",
  },
  sports: {
    id: "sports",
    name: "Esportes",
    description: "Futebol, basquete, tênis, etc.",
    baseXp: 55,
    icon: "trophy",
    color: "text-xp",
  },
  outdoor: {
    id: "outdoor",
    name: "Ar Livre",
    description: "Trilha, escalada, aventura",
    baseXp: 45,
    icon: "mountain",
    color: "text-secondary-500",
  },
  challenge: {
    id: "challenge",
    name: "Desafio Especial",
    description: "Desafios únicos e épicos",
    baseXp: 100,
    icon: "star",
    color: "text-primary-400",
  },
};

export const QUEST_TYPE_LIST = Object.values(QUEST_TYPES);

export function calculateQuestXp(
  questTypeId: string,
  difficulty: "easy" | "medium" | "hard" = "medium"
): number {
  const questType = QUEST_TYPES[questTypeId];
  if (!questType) return 50;

  const multiplier = { easy: 0.8, medium: 1.0, hard: 1.5 }[difficulty];
  return Math.round(questType.baseXp * multiplier);
}
