"use client";

import { AVATAR_STYLE_LIST, type AvatarStyle } from "@/lib/constants/avatar-styles";
import { cn } from "@/lib/utils/cn";

interface StyleSelectorProps {
  selectedStyle: AvatarStyle | null;
  onSelect: (style: AvatarStyle) => void;
}

export function StyleSelector({ selectedStyle, onSelect }: StyleSelectorProps) {
  return (
    <div className="space-y-3">
      {AVATAR_STYLE_LIST.map((style) => (
        <button
          key={style.id}
          onClick={() => onSelect(style.id)}
          className={cn(
            "w-full p-4 border-pixel border-black text-left transition-all",
            selectedStyle === style.id
              ? "bg-primary-500 text-white shadow-pixel-sm translate-x-1 translate-y-1"
              : "bg-parchment text-gray-900 shadow-pixel hover:bg-primary-100"
          )}
        >
          <div className="flex items-center gap-3">
            <span className="text-3xl">{style.emoji}</span>
            <div>
              <div className="font-pixel text-sm">{style.name}</div>
              <div className="font-pixel text-[8px] opacity-80">
                {style.description}
              </div>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
