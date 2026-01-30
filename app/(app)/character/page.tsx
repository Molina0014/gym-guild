"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useCharacter } from "@/hooks/use-character";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AvatarDisplay } from "@/components/character/avatar-display";
import { RACES } from "@/lib/constants/races";
import { CLASSES } from "@/lib/constants/classes";
import { cn } from "@/lib/utils/cn";
import {
    User,
    Shield,
    Swords,
    Heart,
    Zap,
    Brain,
    LogOut,
    Trophy,
} from "lucide-react";

const LEVEL_THRESHOLDS = [
    0, 100, 300, 600, 1000, 1500, 2200, 3000, 4000, 5500, 7500, 10000,
];
const LEVEL_TITLES = [
    "Novato",
    "Aprendiz",
    "Iniciado",
    "Adepto",
    "Veterano",
    "Guerreiro",
    "Especialista",
    "Mestre",
    "Campeão",
    "Herói",
    "Lenda",
    "Mítico",
];

export default function CharacterPage() {
    const { character, isLoading } = useCharacter();
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleLogout = async () => {
        setIsLoggingOut(true);
        await supabase.auth.signOut();
        router.push("/login");
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <p className="font-pixel text-sm text-gray-400 animate-pulse">
                    Carregando...
                </p>
            </div>
        );
    }

    if (!character) {
        return (
            <div className="text-center py-8">
                <p className="font-pixel text-sm text-gray-400">
                    Personagem não encontrado
                </p>
            </div>
        );
    }

    const raceInfo = RACES[character.race];
    const classInfo = CLASSES[character.class];

    const currentLevel = character.level;
    const currentThreshold = LEVEL_THRESHOLDS[currentLevel - 1] || 0;
    const nextThreshold =
        LEVEL_THRESHOLDS[currentLevel] ||
        LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
    const xpInLevel = character.xp - currentThreshold;
    const xpNeeded = nextThreshold - currentThreshold;
    const xpPercent = Math.min((xpInLevel / xpNeeded) * 100, 100);
    const levelTitle = LEVEL_TITLES[currentLevel - 1] || "Mítico";

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary-500" />
                <h1 className="font-pixel text-lg text-foreground">
                    Meu Herói
                </h1>
            </div>

            {/* Character Card */}
            <Card>
                <CardContent className="pt-4">
                    <div className="flex flex-col items-center text-center">
                        {/* Avatar */}
                        <AvatarDisplay
                            character={character}
                            size="xl"
                            showLevel
                        />

                        {/* Name & Title */}
                        <h2 className="font-pixel text-lg text-gray-900 mt-4">
                            {character.name}
                        </h2>
                        <p className="font-pixel text-[10px] text-primary-500">
                            {levelTitle}
                        </p>

                        {/* Race & Class */}
                        <div className="flex items-center gap-4 mt-2">
                            <span className="font-pixel text-[10px] text-gray-600">
                                {raceInfo.emoji} {raceInfo.name}
                            </span>
                            <span className="font-pixel text-[10px] text-gray-600">
                                {classInfo.emoji} {classInfo.name}
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* XP Progress */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-xp" />
                        Experiência
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center mb-3">
                        <span className="font-pixel text-2xl text-xp">
                            {character.xp}
                        </span>
                        <span className="font-pixel text-sm text-gray-500">
                            {" "}
                            XP
                        </span>
                    </div>

                    <div className="mb-2">
                        <div className="flex items-center justify-between mb-1">
                            <span className="font-pixel text-[8px] text-gray-500">
                                Nível {currentLevel}
                            </span>
                            <span className="font-pixel text-[8px] text-gray-500">
                                Nível {currentLevel + 1}
                            </span>
                        </div>
                        <Progress
                            value={xpPercent}
                            max={100}
                            variant="xp"
                            size="md"
                        />
                    </div>

                    <p className="font-pixel text-[8px] text-gray-500 text-center">
                        {xpInLevel}/{xpNeeded} XP para o próximo nível
                    </p>

                    {/* Level milestones */}
                    <div className="mt-4 grid grid-cols-6 gap-1">
                        {LEVEL_THRESHOLDS.slice(0, 12).map(
                            (threshold, index) => (
                                <div
                                    key={index}
                                    className={cn(
                                        "aspect-square flex items-center justify-center border-2 border-black font-pixel text-[8px]",
                                        index + 1 <= currentLevel
                                            ? "bg-primary-500 text-white"
                                            : "bg-gray-200 text-gray-500",
                                    )}
                                >
                                    {index + 1}
                                </div>
                            ),
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Attributes */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-primary-500" />
                        Atributos
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {/* Strength */}
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 flex items-center justify-center bg-red-100 border-2 border-black">
                                <Swords className="w-4 h-4 text-red-600" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="font-pixel text-[10px] text-gray-900">
                                        Força
                                    </span>
                                    <span className="font-pixel text-sm text-red-600">
                                        {character.strength}
                                    </span>
                                </div>
                                <Progress
                                    value={character.strength}
                                    max={30}
                                    variant="hp"
                                    size="sm"
                                />
                            </div>
                        </div>

                        {/* Agility */}
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 flex items-center justify-center bg-green-100 border-2 border-black">
                                <Zap className="w-4 h-4 text-green-600" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="font-pixel text-[10px] text-gray-900">
                                        Agilidade
                                    </span>
                                    <span className="font-pixel text-sm text-green-600">
                                        {character.agility}
                                    </span>
                                </div>
                                <Progress
                                    value={character.agility}
                                    max={30}
                                    variant="stamina"
                                    size="sm"
                                />
                            </div>
                        </div>

                        {/* Constitution */}
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 flex items-center justify-center bg-orange-100 border-2 border-black">
                                <Heart className="w-4 h-4 text-orange-600" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="font-pixel text-[10px] text-gray-900">
                                        Constituição
                                    </span>
                                    <span className="font-pixel text-sm text-orange-600">
                                        {character.constitution}
                                    </span>
                                </div>
                                <Progress
                                    value={character.constitution}
                                    max={30}
                                    variant="xp"
                                    size="sm"
                                />
                            </div>
                        </div>

                        {/* Wisdom */}
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 flex items-center justify-center bg-purple-100 border-2 border-black">
                                <Brain className="w-4 h-4 text-purple-600" />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="font-pixel text-[10px] text-gray-900">
                                        Sabedoria
                                    </span>
                                    <span className="font-pixel text-sm text-purple-600">
                                        {character.wisdom}
                                    </span>
                                </div>
                                <Progress
                                    value={character.wisdom}
                                    max={30}
                                    variant="mana"
                                    size="sm"
                                />
                            </div>
                        </div>
                    </div>

                    <p className="font-pixel text-[8px] text-gray-500 text-center mt-4">
                        Atributos são baseados na sua raça e classe
                    </p>
                </CardContent>
            </Card>

            {/* Race & Class Info */}
            <div className="grid grid-cols-2 gap-3">
                <Card>
                    <CardContent className="py-3 text-center">
                        <span className="text-2xl">{raceInfo.emoji}</span>
                        <p className="font-pixel text-[10px] text-gray-900 mt-1">
                            {raceInfo.name}
                        </p>
                        <p className="font-pixel text-[8px] text-gray-500 mt-1">
                            {raceInfo.description}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="py-3 text-center">
                        <span className="text-2xl">{classInfo.emoji}</span>
                        <p
                            className={cn(
                                "font-pixel text-[10px] mt-1",
                                classInfo.color,
                            )}
                        >
                            {classInfo.name}
                        </p>
                        <p className="font-pixel text-[8px] text-gray-500 mt-1">
                            {classInfo.description}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Logout */}
            <Button
                variant="ghost"
                className="w-full text-gray-500"
                onClick={handleLogout}
                isLoading={isLoggingOut}
            >
                <LogOut className="w-4 h-4" />
                Sair da Guilda
            </Button>
        </div>
    );
}
