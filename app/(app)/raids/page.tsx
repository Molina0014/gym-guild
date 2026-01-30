"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { Raid } from "@/types/database";
import { cn } from "@/lib/utils/cn";
import {
    Swords,
    Clock,
    CheckCircle,
    XCircle,
    Flame,
    Users,
    ChevronRight,
} from "lucide-react";

export default function RaidsPage() {
    const [raids, setRaids] = useState<Raid[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        const fetchRaids = async () => {
            const { data } = await supabase
                .from("raids")
                .select("*")
                .order("created_at", { ascending: false });

            setRaids(data || []);
            setIsLoading(false);
        };

        fetchRaids();

        // Subscribe to changes
        const channel = supabase
            .channel("raids-changes")
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "raids" },
                () => fetchRaids(),
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const activeRaids = raids.filter((r) => r.status === "active");
    const upcomingRaids = raids.filter((r) => r.status === "upcoming");
    const pastRaids = raids.filter(
        (r) => r.status === "completed" || r.status === "failed",
    );

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
                <Swords className="w-5 h-5 text-health" />
                <h1 className="font-pixel text-lg text-foreground">Raids</h1>
            </div>

            {raids.length === 0 ? (
                <Card>
                    <CardContent className="py-8 text-center">
                        <Swords className="w-10 h-10 mx-auto text-gray-600 mb-3" />
                        <p className="font-pixel text-[10px] text-gray-500">
                            Nenhuma raid disponível no momento.
                            <br />
                            Aguarde o próximo desafio épico!
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <>
                    {/* Active Raids */}
                    {activeRaids.length > 0 && (
                        <div className="space-y-3">
                            <h2 className="font-pixel text-xs text-health flex items-center gap-2">
                                <Flame className="w-4 h-4" />
                                Raids Ativas!
                            </h2>
                            {activeRaids.map((raid) => (
                                <RaidCard key={raid.id} raid={raid} />
                            ))}
                        </div>
                    )}

                    {/* Upcoming Raids */}
                    {upcomingRaids.length > 0 && (
                        <div className="space-y-3">
                            <h2 className="font-pixel text-xs text-gray-400 flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                Em Breve
                            </h2>
                            {upcomingRaids.map((raid) => (
                                <RaidCard key={raid.id} raid={raid} />
                            ))}
                        </div>
                    )}

                    {/* Past Raids */}
                    {pastRaids.length > 0 && (
                        <div className="space-y-3">
                            <h2 className="font-pixel text-xs text-gray-500 flex items-center gap-2">
                                Histórico
                            </h2>
                            {pastRaids.slice(0, 5).map((raid) => (
                                <RaidCard key={raid.id} raid={raid} />
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

function RaidCard({ raid }: { raid: Raid }) {
    const healthPercent =
        (raid.boss_current_health / raid.boss_max_health) * 100;
    const isActive = raid.status === "active";
    const isCompleted = raid.status === "completed";
    const isFailed = raid.status === "failed";

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <Link href={`/raids/${raid.id}`}>
            <Card
                className={cn(
                    "hover:shadow-pixel-lg transition-all cursor-pointer",
                    isActive && "border-health animate-pulse-glow",
                    (isCompleted || isFailed) && "opacity-70",
                )}
            >
                <CardContent className="py-4">
                    <div className="flex items-center gap-4">
                        {/* Boss Icon */}
                        <div
                            className={cn(
                                "w-14 h-14 flex items-center justify-center border-pixel border-black text-3xl",
                                isActive ? "bg-health/20" : "bg-gray-200",
                            )}
                        >
                            {raid.boss_image_url ? (
                                <img
                                    src={raid.boss_image_url}
                                    alt={raid.boss_name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                "🐉"
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-pixel text-xs text-gray-900">
                                    {raid.boss_name}
                                </h3>
                                {isCompleted && (
                                    <CheckCircle className="w-4 h-4 text-secondary-500" />
                                )}
                                {isFailed && (
                                    <XCircle className="w-4 h-4 text-gray-500" />
                                )}
                            </div>

                            <p className="font-pixel text-[8px] text-gray-600 mb-2">
                                {raid.title}
                            </p>

                            {/* Health Bar */}
                            {(isActive || raid.status === "upcoming") && (
                                <div>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="font-pixel text-[8px] text-gray-500">
                                            HP
                                        </span>
                                        <span className="font-pixel text-[8px] text-health">
                                            {raid.boss_current_health}/
                                            {raid.boss_max_health}
                                        </span>
                                    </div>
                                    <Progress
                                        value={raid.boss_current_health}
                                        max={raid.boss_max_health}
                                        variant="boss"
                                        size="sm"
                                    />
                                </div>
                            )}

                            {/* Status */}
                            {raid.status === "upcoming" && (
                                <p className="font-pixel text-[8px] text-gray-500 mt-2">
                                    Começa: {formatDate(raid.starts_at)}
                                </p>
                            )}

                            {isCompleted && (
                                <p className="font-pixel text-[8px] text-secondary-600 mt-1">
                                    Vitória! +{raid.completion_bonus_xp} XP
                                    bônus
                                </p>
                            )}

                            {isFailed && (
                                <p className="font-pixel text-[8px] text-gray-500 mt-1">
                                    O boss escapou...
                                </p>
                            )}
                        </div>

                        <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}
