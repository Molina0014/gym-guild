export type AvatarStyle = "pixel" | "anime" | "realistic";

export interface AvatarStyleInfo {
    id: AvatarStyle;
    name: string;
    emoji: string;
    description: string;
    promptTemplate: string;
}

export const AVATAR_STYLES: Record<AvatarStyle, AvatarStyleInfo> = {
    pixel: {
        id: "pixel",
        name: "Pixel Art",
        emoji: "🎮",
        description: "Estilo retrô 16-bit de RPGs clássicos",
        promptTemplate: `Create a pixel art character portrait in 16-bit RPG style.
Character: A {race} {class} fantasy hero. {description}
Style: Retro pixel art with vibrant colors, clean defined pixels, classic fantasy RPG aesthetic like Final Fantasy or Chrono Trigger.
Format: Square portrait, character facing forward, simple gradient or solid color background.
Important: The image must be clearly pixel art style, not realistic.`,
    },
    anime: {
        id: "anime",
        name: "Anime",
        emoji: "🌸",
        description: "Estilo japonês com olhos expressivos",
        promptTemplate: `Create an anime-style character portrait.
Character: A {race} {class} fantasy hero. {description}
Style: Japanese anime art style with expressive eyes, dynamic shading, vibrant colors, fantasy setting similar to Sword Art Online or Fairy Tail.
Format: Square portrait showing upper body, soft gradient background with magical particles.
Important: The image must be clearly anime/manga style.`,
    },
    realistic: {
        id: "realistic",
        name: "Realista",
        emoji: "🎭",
        description: "Pintura digital detalhada e cinematográfica",
        promptTemplate: `Create a realistic fantasy character portrait in digital painting style.
Character: A {race} {class} fantasy hero. {description}
Style: High quality digital painting with detailed textures, dramatic cinematic lighting, medieval fantasy atmosphere like concept art for games or movies.
Format: Square portrait with cinematic composition, atmospheric background with depth.
Important: The image must look like professional concept art or digital painting.`,
    },
};

export const AVATAR_STYLE_LIST = Object.values(AVATAR_STYLES);

export function buildAvatarPrompt(
    style: AvatarStyle,
    race: string,
    characterClass: string,
    userDescription: string,
): string {
    const styleInfo = AVATAR_STYLES[style];

    // Traduzir raça e classe para inglês para melhor resultado
    const raceTranslations: Record<string, string> = {
        human: "human",
        elf: "elf with pointed ears",
        dwarf: "dwarf with a thick beard",
        orc: "orc with green skin and tusks",
        halfling: "halfling (small humanoid)",
    };

    const classTranslations: Record<string, string> = {
        warrior: "warrior with heavy armor and sword",
        mage: "mage with mystical robes and staff",
        archer: "archer with bow and leather armor",
        cleric: "cleric with holy symbols and light armor",
        rogue: "rogue with daggers and hooded cloak",
    };

    const translatedRace = raceTranslations[race] || race;
    const translatedClass = classTranslations[characterClass] || characterClass;

    const prompt = styleInfo.promptTemplate
        .replace("{race}", translatedRace)
        .replace("{class}", translatedClass)
        .replace(
            "{description}",
            userDescription || "heroic and determined expression",
        );

    return prompt;
}
