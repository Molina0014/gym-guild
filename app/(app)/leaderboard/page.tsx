"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useCharacter } from "@/hooks/use-character";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AvatarDisplay } from "@/components/character/avatar-display";
import { RACES } from "@/lib/constants/races";
import { CLASSES } from "@/lib/constants/classes";
import type { Character } from "@/types/database";
import { cn } from "@/lib/utils/cn";
import { Trophy, Medal, Crown, Star } from "lucide-react";

export default function LeaderboardPage() {
    const { character: myCharacter } = useCharacter();
    const [characters, setCharacters] = useState<Character[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const fetchLeaderboard = async () => {
            const { data } = await supabase
                .from("characters")
                .select("*")
                .order("xp", { ascending: false })
                .limit(50);

            setCharacters(data || []);
            setIsLoading(false);
        };

        fetchLeaderboard();
    }, []);

    const myRank = myCharacter
        ? characters.findIndex((c) => c.user_id === myCharacter.user_id) + 1
        : 0;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <p className="font-pixel text-sm text-gray-400 animate-pulse">
                    Carregando...
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-xp" />
                <h1 className="font-pixel text-lg text-foreground">Ranking</h1>
            </div>

            {/* My Position */}
            {myCharacter && myRank > 0 && (
                <Card className="bg-primary-500/10 border-primary-500">
                    <CardContent className="py-3">
                        <div className="flex items-center gap-3">
                            <div className="w-8 text-center">
                                <span className="font-pixel text-lg text-primary-500">
                                    #{myRank}
                                </span>
                            </div>
                            <AvatarDisplay character={myCharacter} size="sm" />
                            <div className="flex-1">
                                <p className="font-pixel text-[10px] text-gray-900">
                                    {myCharacter.name}
                                </p>
                                <p className="font-pixel text-[8px] text-gray-600">
                                    Sua posição
                                </p>
                            </div>
                            <div className="text-right">
                                <p className="font-pixel text-sm text-xp">
                                    {myCharacter.xp}
                                </p>
                                <p className="font-pixel text-[8px] text-gray-500">
                                    XP
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Top 3 Podium */}
            {characters.length >= 3 && (
                <div className="grid grid-cols-3 gap-2 items-end">
                    {/* 2nd Place */}
                    <div className="text-center">
                        <AvatarDisplay
                            character={characters[1]}
                            size="md"
                            className="mx-auto"
                        />
                        <div className="mt-2 p-2 bg-gray-300 border-2 border-black">
                            <Medal className="w-4 h-4 mx-auto text-gray-600 mb-1" />
                            <p className="font-pixel text-[8px] text-gray-900 truncate">
                                {characters[1].name}
                            </p>
                            <p className="font-pixel text-[10px] text-xp">
                                {characters[1].xp}
                            </p>
                        </div>
                    </div>

                    {/* 1st Place */}
                    <div className="text-center">
                        <Crown className="w-6 h-6 mx-auto text-xp mb-1 animate-bounce-pixel" />
                        <AvatarDisplay
                            character={characters[0]}
                            size="lg"
                            className="mx-auto"
                        />
                        <div className="mt-2 p-2 bg-xp/20 border-2 border-xp">
                            <Trophy className="w-4 h-4 mx-auto text-xp mb-1" />
                            <p className="font-pixel text-[10px] text-gray-900 truncate">
                                {characters[0].name}
                            </p>
                            <p className="font-pixel text-sm text-xp">
                                {characters[0].xp}
                            </p>
                        </div>
                    </div>

                    {/* 3rd Place */}
                    <div className="text-center">
                        <AvatarDisplay
                            character={characters[2]}
                            size="md"
                            className="mx-auto"
                        />
                        <div className="mt-2 p-2 bg-orange-200 border-2 border-black">
                            <Star className="w-4 h-4 mx-auto text-orange-600 mb-1" />
                            <p className="font-pixel text-[8px] text-gray-900 truncate">
                                {characters[2].name}
                            </p>
                            <p className="font-pixel text-[10px] text-xp">
                                {characters[2].xp}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Full List */}
            <Card>
                <CardHeader>
                    <CardTitle>Todos os Guerreiros</CardTitle>
                </CardHeader>
                <CardContent>
                    {characters.length === 0 ? (
                        <p className="font-pixel text-[10px] text-gray-500 text-center py-4">
                            Nenhum guerreiro ainda
                        </p>
                    ) : (
                        <div className="space-y-2">
                            {characters.map((char, index) => {
                                const isMe =
                                    char.user_id === myCharacter?.user_id;
                                const raceInfo = RACES[char.race];
                                const classInfo = CLASSES[char.class];

                                return (
                                    <div
                                        key={char.id}
                                        className={cn(
                                            "flex items-center gap-3 p-2 border-2 border-black",
                                            index === 0 && "bg-xp/10",
                                            index === 1 && "bg-gray-100",
                                            index === 2 && "bg-orange-50",
                                            index > 2 && "bg-white",
                                            isMe && "ring-2 ring-primary-500",
                                        )}
                                    >
                                        {/* Rank */}
                                        <div className="w-6 text-center">
                                            {index === 0 && (
                                                <Trophy className="w-4 h-4 mx-auto text-xp" />
                                            )}
                                            {index === 1 && (
                                                <Medal className="w-4 h-4 mx-auto text-gray-500" />
                                            )}
                                            {index === 2 && (
                                                <Star className="w-4 h-4 mx-auto text-orange-500" />
                                            )}
                                            {index > 2 && (
                                                <span className="font-pixel text-[10px] text-gray-500">
                                                    {index + 1}
                                                </span>
                                            )}
                                        </div>

                                        {/* Avatar */}
                                        <AvatarDisplay
                                            character={char}
                                            size="sm"
                                        />

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <p
                                                className={cn(
                                                    "font-pixel text-[10px] truncate",
                                                    isMe
                                                        ? "text-primary-600"
                                                        : "text-gray-900",
                                                )}
                                            >
                                                {char.name}
                                                {isMe && " (você)"}
                                            </p>
                                            <p className="font-pixel text-[8px] text-gray-500">
                                                {raceInfo.emoji}{" "}
                                                {classInfo.emoji} Nv.
                                                {char.level}
                                            </p>
                                        </div>

                                        {/* XP */}
                                        <div className="text-right">
                                            <p className="font-pixel text-xs text-xp">
                                                {char.xp}
                                            </p>
                                            <p className="font-pixel text-[8px] text-gray-500">
                                                XP
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
