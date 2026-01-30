import type { CharacterClass } from "@/types/database";

export interface ClassInfo {
  id: CharacterClass;
  name: string;
  description: string;
  bonuses: {
    strength?: number;
    agility?: number;
    constitution?: number;
    wisdom?: number;
  };
  emoji: string;
  color: string;
}

export const CLASSES: Record<CharacterClass, ClassInfo> = {
  warrior: {
    id: "warrior",
    name: "Guerreiro",
    description: "Mestre do combate corpo a corpo. Força é sua arma.",
    bonuses: { strength: 3, constitution: 1 },
    emoji: "⚔️",
    color: "text-red-500",
  },
  mage: {
    id: "mage",
    name: "Mago",
    description: "Manipulador de energias arcanas. Sabedoria infinita.",
    bonuses: { wisdom: 3, agility: 1 },
    emoji: "🔮",
    color: "text-purple-500",
  },
  archer: {
    id: "archer",
    name: "Arqueiro",
    description: "Precisão mortal à distância. Agilidade incomparável.",
    bonuses: { agility: 3, strength: 1 },
    emoji: "🏹",
    color: "text-green-500",
  },
  cleric: {
    id: "cleric",
    name: "Clérigo",
    description: "Curandeiro sagrado. Protege e fortalece aliados.",
    bonuses: { wisdom: 2, constitution: 2 },
    emoji: "✨",
    color: "text-yellow-500",
  },
  rogue: {
    id: "rogue",
    name: "Ladino",
    description: "Furtivo e letal. Age nas sombras com precisão.",
    bonuses: { agility: 2, wisdom: 2 },
    emoji: "🗡️",
    color: "text-gray-400",
  },
};

export const CLASS_LIST = Object.values(CLASSES);
