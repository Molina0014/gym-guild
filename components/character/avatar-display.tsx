"use client";

import { cn } from "@/lib/utils/cn";
import type { Character } from "@/types/database";

interface AvatarDisplayProps {
    character: Character;
    size?: "sm" | "md" | "lg" | "xl";
    showLevel?: boolean;
    className?: string;
}

export function AvatarDisplay({
    character,
    size = "md",
    showLevel = false,
    className,
}: AvatarDisplayProps) {
    // Use custom avatar URL if available, otherwise fall back to DiceBear
    let avatarUrl: string;

    if (character.avatar_url) {
        // Custom avatar (uploaded or AI-generated)
        avatarUrl = character.avatar_url;
    } else {
        // Generate DiceBear pixel-art avatar URL as fallback
        const avatarConfig = character.avatar_config as {
            seed?: string;
        } | null;
        const seed = avatarConfig?.seed || character.user_id;

        // Map class to accessories/features
        const classStyles: Record<string, string> = {
            warrior: "backgroundColor=b6e3f4",
            mage: "backgroundColor=c0aede",
            archer: "backgroundColor=d1f4d1",
            cleric: "backgroundColor=fff4b8",
            rogue: "backgroundColor=d4d4d4",
        };

        const classStyle =
            classStyles[character.class] || "backgroundColor=b6e3f4";
        avatarUrl = `https://api.dicebear.com/9.x/pixel-art/svg?seed=${seed}&${classStyle}`;
    }

    const sizes = {
        sm: "w-10 h-10",
        md: "w-16 h-16",
        lg: "w-24 h-24",
        xl: "w-32 h-32",
    };

    const levelBadgeSizes = {
        sm: "w-4 h-4 text-[6px]",
        md: "w-6 h-6 text-[8px]",
        lg: "w-8 h-8 text-[10px]",
        xl: "w-10 h-10 text-xs",
    };

    // Determine if we should use pixelated rendering (only for DiceBear SVGs)
    const isPixelArt =
        !character.avatar_url || character.avatar_style === "pixel";

    return (
        <div className={cn("relative inline-block", className)}>
            <div
                className={cn(
                    "border-pixel border-black overflow-hidden bg-gray-200",
                    sizes[size],
                )}
            >
                <img
                    src={avatarUrl}
                    alt={character.name}
                    className={cn(
                        "w-full h-full object-cover",
                        isPixelArt && "pixel-art",
                    )}
                    style={
                        isPixelArt ? { imageRendering: "pixelated" } : undefined
                    }
                />
            </div>

            {showLevel && (
                <div
                    className={cn(
                        "absolute -bottom-1 -right-1 flex items-center justify-center",
                        "rounded-full border-2 border-black bg-primary-500 text-white font-pixel",
                        levelBadgeSizes[size],
                    )}
                >
                    {character.level}
                </div>
            )}
        </div>
    );
}
