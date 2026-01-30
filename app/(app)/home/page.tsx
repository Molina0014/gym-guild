"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useCharacter } from "@/hooks/use-character";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AvatarDisplay } from "@/components/character/avatar-display";
import { RACES } from "@/lib/constants/races";
import { CLASSES } from "@/lib/constants/classes";
import type { Quest, Raid } from "@/types/database";
import {
    Scroll,
    Swords,
    Plus,
    ChevronRight,
    Flame,
    Target,
    Users,
} from "lucide-react";

export default function HomePage() {
    const { character, isLoading } = useCharacter();
    const [activeQuests, setActiveQuests] = useState<Quest[]>([]);
    const [activeRaid, setActiveRaid] = useState<Raid | null>(null);
    const supabase = createClient();

    useEffect(() => {
        if (!character) return;

        // Fetch active quests
        const fetchQuests = async () => {
            const { data } = await supabase
                .from("quests")
                .select("*")
                .eq("creator_id", character.user_id)
                .eq("status", "active")
                .order("created_at", { ascending: false })
                .limit(3);

            if (data) setActiveQuests(data);
        };

        // Fetch active raid
        const fetchRaid = async () => {
            const { data } = await supabase
                .from("raids")
                .select("*")
                .eq("status", "active")
                .single();

            if (data) setActiveRaid(data);
        };

        fetchQuests();
        fetchRaid();
    }, [character]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="font-pixel text-sm text-gray-400 animate-pulse">
                    Carregando...
                </div>
            </div>
        );
    }

    if (!character) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
                <p className="font-pixel text-sm text-gray-400 mb-4">
                    Personagem não encontrado
                </p>
                <Link href="/onboarding">
                    <Button variant="primary">Criar Personagem</Button>
                </Link>
            </div>
        );
    }

    const raceInfo = RACES[character.race];
    const classInfo = CLASSES[character.class];

    return (
        <div className="space-y-4">
            {/* Character Card */}
            <Card>
                <CardContent className="pt-4">
                    <div className="flex items-center gap-4">
                        <AvatarDisplay
                            character={character}
                            size="lg"
                            showLevel
                        />

                        <div className="flex-1">
                            <h2 className="font-pixel text-sm text-gray-900">
                                {character.name}
                            </h2>
                            <p className="font-pixel text-[10px] text-gray-600">
                                {raceInfo.emoji} {raceInfo.name}{" "}
                                {classInfo.emoji} {classInfo.name}
                            </p>

                            <div className="mt-2">
                                <div className="flex items-center justify-between mb-1">
                                    <span className="font-pixel text-[8px] text-gray-500">
                                        XP
                                    </span>
                                    <span className="font-pixel text-[8px] text-xp">
                                        {character.xp}
                                    </span>
                                </div>
                                <Progress
                                    value={character.xp}
                                    max={10000}
                                    variant="xp"
                                    size="sm"
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3">
                <Link href="/quests/new">
                    <Card className="hover:shadow-pixel-lg transition-shadow cursor-pointer">
                        <CardContent className="pt-4 text-center">
                            <div className="w-10 h-10 mx-auto mb-2 flex items-center justify-center bg-primary-100 border-2 border-black">
                                <Plus className="w-5 h-5 text-primary-600" />
                            </div>
                            <p className="font-pixel text-[10px] text-gray-700">
                                Nova Quest
                            </p>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/chat">
                    <Card className="hover:shadow-pixel-lg transition-shadow cursor-pointer">
                        <CardContent className="pt-4 text-center">
                            <div className="w-10 h-10 mx-auto mb-2 flex items-center justify-center bg-secondary-100 border-2 border-black">
                                <Users className="w-5 h-5 text-secondary-600" />
                            </div>
                            <p className="font-pixel text-[10px] text-gray-700">
                                Chat da Guilda
                            </p>
                        </CardContent>
                    </Card>
                </Link>
            </div>

            {/* Active Raid */}
            {activeRaid && (
                <Card variant="quest">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-health">
                            <Swords className="w-4 h-4" />
                            Raid Ativa!
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between mb-2">
                            <span className="font-pixel text-xs text-gray-900">
                                {activeRaid.boss_name}
                            </span>
                            <span className="font-pixel text-[10px] text-gray-600">
                                {activeRaid.boss_current_health}/
                                {activeRaid.boss_max_health} HP
                            </span>
                        </div>
                        <Progress
                            value={activeRaid.boss_current_health}
                            max={activeRaid.boss_max_health}
                            variant="boss"
                            size="md"
                        />
                        <Link href={`/raids/${activeRaid.id}`}>
                            <Button
                                variant="danger"
                                size="sm"
                                className="w-full mt-3"
                            >
                                <Flame className="w-4 h-4" />
                                Atacar!
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            )}

            {/* Active Quests */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Scroll className="w-4 h-4 text-primary-500" />
                            Suas Quests
                        </CardTitle>
                        <Link
                            href="/quests"
                            className="font-pixel text-[8px] text-primary-500 hover:underline"
                        >
                            Ver todas
                        </Link>
                    </div>
                </CardHeader>
                <CardContent>
                    {activeQuests.length === 0 ? (
                        <div className="text-center py-4">
                            <Target className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                            <p className="font-pixel text-[10px] text-gray-500">
                                Nenhuma quest ativa
                            </p>
                            <Link href="/quests/new">
                                <Button
                                    variant="primary"
                                    size="sm"
                                    className="mt-2"
                                >
                                    Criar Quest
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {activeQuests.map((quest) => (
                                <Link
                                    key={quest.id}
                                    href={`/quests/${quest.id}`}
                                    className="flex items-center justify-between p-2 bg-gray-100 border-2 border-black hover:bg-gray-200 transition-colors"
                                >
                                    <div>
                                        <p className="font-pixel text-[10px] text-gray-900">
                                            {quest.title}
                                        </p>
                                        <p className="font-pixel text-[8px] text-xp">
                                            +{quest.xp_reward} XP
                                        </p>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-gray-400" />
                                </Link>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Stats Summary */}
            <Card>
                <CardHeader>
                    <CardTitle>Atributos</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-4 gap-2 text-center">
                        <div>
                            <div className="font-pixel text-lg text-red-500">
                                {character.strength}
                            </div>
                            <div className="font-pixel text-[8px] text-gray-600">
                                FOR
                            </div>
                        </div>
                        <div>
                            <div className="font-pixel text-lg text-green-500">
                                {character.agility}
                            </div>
                            <div className="font-pixel text-[8px] text-gray-600">
                                AGI
                            </div>
                        </div>
                        <div>
                            <div className="font-pixel text-lg text-orange-500">
                                {character.constitution}
                            </div>
                            <div className="font-pixel text-[8px] text-gray-600">
                                CON
                            </div>
                        </div>
                        <div>
                            <div className="font-pixel text-lg text-purple-500">
                                {character.wisdom}
                            </div>
                            <div className="font-pixel text-[8px] text-gray-600">
                                SAB
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
