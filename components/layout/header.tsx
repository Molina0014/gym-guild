"use client";

import Link from "next/link";
import { Swords, Trophy } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import type { Character } from "@/types/database";

interface HeaderProps {
  character?: Character | null;
}

export function Header({ character }: HeaderProps) {
  // Calculate XP progress to next level
  const levelThresholds = [0, 100, 300, 600, 1000, 1500, 2200, 3000, 4000, 5500, 7500, 10000];
  const currentLevel = character?.level || 1;
  const currentXp = character?.xp || 0;
  const currentThreshold = levelThresholds[currentLevel - 1] || 0;
  const nextThreshold = levelThresholds[currentLevel] || levelThresholds[levelThresholds.length - 1];
  const xpInLevel = currentXp - currentThreshold;
  const xpNeeded = nextThreshold - currentThreshold;
  const xpPercentage = Math.min((xpInLevel / xpNeeded) * 100, 100);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#1a1a2e] border-b-4 border-primary-700">
      <div className="flex items-center justify-between h-14 px-4 max-w-lg mx-auto">
        {/* Logo */}
        <Link href="/home" className="flex items-center gap-2">
          <Swords className="w-6 h-6 text-primary-500" />
          <span className="font-pixel text-xs text-primary-400 hidden sm:block">
            GYM GUILD
          </span>
        </Link>

        {/* XP Bar */}
        {character && (
          <div className="flex items-center gap-3 flex-1 max-w-[200px] mx-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="font-pixel text-[8px] text-gray-400">
                  Nv.{currentLevel}
                </span>
                <span className="font-pixel text-[8px] text-xp">
                  {currentXp} XP
                </span>
              </div>
              <Progress value={xpPercentage} max={100} variant="xp" size="sm" />
            </div>
          </div>
        )}

        {/* Leaderboard Link */}
        <Link
          href="/leaderboard"
          className="flex items-center gap-1 text-gray-400 hover:text-primary-400 transition-colors"
        >
          <Trophy className="w-5 h-5" />
        </Link>
      </div>
    </header>
  );
}
