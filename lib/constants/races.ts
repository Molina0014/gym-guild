import type { Race } from "@/types/database";

export interface RaceInfo {
  id: Race;
  name: string;
  description: string;
  bonuses: {
    strength?: number;
    agility?: number;
    constitution?: number;
    wisdom?: number;
  };
  emoji: string;
}

export const RACES: Record<Race, RaceInfo> = {
  human: {
    id: "human",
    name: "Humano",
    description: "Versáteis e adaptáveis, equilibrados em todos os aspectos.",
    bonuses: { strength: 1, agility: 1, constitution: 1, wisdom: 1 },
    emoji: "🧑",
  },
  elf: {
    id: "elf",
    name: "Elfo",
    description: "Ágeis e sábios, mestres em precisão e conhecimento.",
    bonuses: { agility: 2, wisdom: 2 },
    emoji: "🧝",
  },
  dwarf: {
    id: "dwarf",
    name: "Anão",
    description: "Resistentes e fortes, inabaláveis como montanhas.",
    bonuses: { strength: 2, constitution: 2 },
    emoji: "🧔",
  },
  orc: {
    id: "orc",
    name: "Orc",
    description: "Brutais e poderosos, força acima de tudo.",
    bonuses: { strength: 3, constitution: 1 },
    emoji: "👹",
  },
  halfling: {
    id: "halfling",
    name: "Halfling",
    description: "Pequenos mas ágeis, sorte é seu maior trunfo.",
    bonuses: { agility: 3, wisdom: 1 },
    emoji: "🧒",
  },
};

export const RACE_LIST = Object.values(RACES);
