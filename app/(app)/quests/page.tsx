"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useCharacter } from "@/hooks/use-character";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QUEST_TYPES } from "@/lib/constants/quest-types";
import type { Quest } from "@/types/database";
import { cn } from "@/lib/utils/cn";
import {
    Plus,
    Scroll,
    Globe,
    Lock,
    CheckCircle,
    Clock,
    ChevronRight,
} from "lucide-react";

type TabType = "my" | "public";

export default function QuestsPage() {
    const { character } = useCharacter();
    const [activeTab, setActiveTab] = useState<TabType>("my");
    const [quests, setQuests] = useState<Quest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        if (!character) return;

        const fetchQuests = async () => {
            setIsLoading(true);

            let query = supabase.from("quests").select("*");

            if (activeTab === "my") {
                query = query.eq("creator_id", character.user_id);
            } else {
                query = query
                    .eq("is_public", true)
                    .neq("creator_id", character.user_id);
            }

            const { data } = await query
                .order("created_at", { ascending: false })
                .limit(50);

            setQuests(data || []);
            setIsLoading(false);
        };

        fetchQuests();
    }, [character, activeTab]);

    const activeQuests = quests.filter((q) => q.status === "active");
    const completedQuests = quests.filter((q) => q.status === "completed");

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="font-pixel text-lg text-foreground flex items-center gap-2">
                    <Scroll className="w-5 h-5 text-primary-500" />
                    Quests
                </h1>
                <Link href="/quests/new">
                    <Button variant="primary" size="sm">
                        <Plus className="w-4 h-4" />
                        Nova
                    </Button>
                </Link>
            </div>

            {/* Tabs */}
            <div className="flex gap-2">
                <button
                    onClick={() => setActiveTab("my")}
                    className={cn(
                        "flex-1 py-2 px-3 font-pixel text-[10px] border-pixel border-black transition-all",
                        activeTab === "my"
                            ? "bg-primary-500 text-white shadow-pixel-sm translate-x-[2px] translate-y-[2px]"
                            : "bg-parchment text-gray-900 shadow-pixel hover:bg-primary-100",
                    )}
                >
                    <Lock className="w-3 h-3 inline mr-1" />
                    Minhas
                </button>
                <button
                    onClick={() => setActiveTab("public")}
                    className={cn(
                        "flex-1 py-2 px-3 font-pixel text-[10px] border-pixel border-black transition-all",
                        activeTab === "public"
                            ? "bg-primary-500 text-white shadow-pixel-sm translate-x-[2px] translate-y-[2px]"
                            : "bg-parchment text-gray-900 shadow-pixel hover:bg-primary-100",
                    )}
                >
                    <Globe className="w-3 h-3 inline mr-1" />
                    Públicas
                </button>
            </div>

            {isLoading ? (
                <div className="text-center py-8">
                    <p className="font-pixel text-sm text-gray-400 animate-pulse">
                        Carregando...
                    </p>
                </div>
            ) : quests.length === 0 ? (
                <Card>
                    <CardContent className="py-8 text-center">
                        <Scroll className="w-10 h-10 mx-auto text-gray-400 mb-3" />
                        <p className="font-pixel text-[10px] text-gray-500 mb-4">
                            {activeTab === "my"
                                ? "Você ainda não tem quests"
                                : "Nenhuma quest pública disponível"}
                        </p>
                        {activeTab === "my" && (
                            <Link href="/quests/new">
                                <Button variant="primary" size="sm">
                                    Criar Primeira Quest
                                </Button>
                            </Link>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <>
                    {/* Active Quests */}
                    {activeQuests.length > 0 && (
                        <div className="space-y-2">
                            <h2 className="font-pixel text-xs text-gray-400 flex items-center gap-2">
                                <Clock className="w-3 h-3" />
                                Ativas ({activeQuests.length})
                            </h2>
                            {activeQuests.map((quest) => (
                                <QuestCard key={quest.id} quest={quest} />
                            ))}
                        </div>
                    )}

                    {/* Completed Quests */}
                    {completedQuests.length > 0 && (
                        <div className="space-y-2">
                            <h2 className="font-pixel text-xs text-gray-400 flex items-center gap-2">
                                <CheckCircle className="w-3 h-3" />
                                Completas ({completedQuests.length})
                            </h2>
                            {completedQuests.map((quest) => (
                                <QuestCard key={quest.id} quest={quest} />
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

function QuestCard({ quest }: { quest: Quest }) {
    const questType = QUEST_TYPES[quest.quest_type];
    const isCompleted = quest.status === "completed";

    return (
        <Link href={`/quests/${quest.id}`}>
            <Card
                className={cn(
                    "hover:shadow-pixel-lg transition-all cursor-pointer",
                    isCompleted && "opacity-70",
                )}
            >
                <CardContent className="py-3">
                    <div className="flex items-center gap-3">
                        {/* Quest Type Icon */}
                        <div
                            className={cn(
                                "w-10 h-10 flex items-center justify-center border-2 border-black",
                                isCompleted ? "bg-gray-200" : "bg-primary-100",
                            )}
                        >
                            <span className="text-lg">
                                {quest.quest_type === "cardio" && "❤️"}
                                {quest.quest_type === "strength" && "💪"}
                                {quest.quest_type === "flexibility" && "🧘"}
                                {quest.quest_type === "sports" && "🏆"}
                                {quest.quest_type === "outdoor" && "🏔️"}
                                {quest.quest_type === "challenge" && "⭐"}
                            </span>
                        </div>

                        {/* Quest Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <p
                                    className={cn(
                                        "font-pixel text-[10px] truncate",
                                        isCompleted
                                            ? "text-gray-500 line-through"
                                            : "text-gray-900",
                                    )}
                                >
                                    {quest.title}
                                </p>
                                {!quest.is_public && (
                                    <Lock className="w-3 h-3 text-gray-400 flex-shrink-0" />
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-pixel text-[8px] text-gray-500">
                                    {questType?.name || quest.quest_type}
                                </span>
                                <span className="font-pixel text-[8px] text-xp">
                                    +{quest.xp_reward} XP
                                </span>
                            </div>
                        </div>

                        {/* Status */}
                        {isCompleted ? (
                            <CheckCircle className="w-5 h-5 text-secondary-500 flex-shrink-0" />
                        ) : (
                            <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        )}
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}
