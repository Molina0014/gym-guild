"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useCharacter } from "@/hooks/use-character";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AvatarDisplay } from "@/components/character/avatar-display";
import type { Raid, RaidParticipant, Character } from "@/types/database";
import { cn } from "@/lib/utils/cn";
import {
    ChevronLeft,
    Swords,
    Users,
    Flame,
    Camera,
    Sparkles,
} from "lucide-react";

interface ParticipantWithCharacter extends RaidParticipant {
    character?: Character;
}

export default function RaidDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { character } = useCharacter();
    const supabase = createClient();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [raid, setRaid] = useState<Raid | null>(null);
    const [participants, setParticipants] = useState<
        ParticipantWithCharacter[]
    >([]);
    const [myParticipation, setMyParticipation] =
        useState<RaidParticipant | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isJoining, setIsJoining] = useState(false);
    const [isContributing, setIsContributing] = useState(false);
    const [description, setDescription] = useState("");
    const [proofFile, setProofFile] = useState<File | null>(null);

    const raidId = params.id as string;

    const fetchData = async () => {
        // Fetch raid
        const { data: raidData } = await supabase
            .from("raids")
            .select("*")
            .eq("id", raidId)
            .single();

        setRaid(raidData);

        // Fetch participants
        const { data: participantsData } = await supabase
            .from("raid_participants")
            .select("*")
            .eq("raid_id", raidId)
            .order("damage_dealt", { ascending: false });

        if (participantsData) {
            // Fetch characters for each participant
            const userIds = (participantsData as any[]).map(
                (p: any) => p.user_id,
            );
            const { data: characters } = await supabase
                .from("characters")
                .select("*")
                .in("user_id", userIds);

            const withCharacters = (participantsData as any[]).map(
                (p: any) => ({
                    ...p,
                    character: (characters as any[])?.find(
                        (c: any) => c.user_id === p.user_id,
                    ),
                }),
            );

            setParticipants(withCharacters);

            if (character) {
                const myPart = (participantsData as any[]).find(
                    (p: any) => p.user_id === character.user_id,
                );
                setMyParticipation(myPart || null);
            }
        }

        setIsLoading(false);
    };

    useEffect(() => {
        fetchData();

        // Subscribe to raid changes
        const channel = supabase
            .channel(`raid-${raidId}`)
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "raids",
                    filter: `id=eq.${raidId}`,
                },
                () => fetchData(),
            )
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "raid_participants",
                    filter: `raid_id=eq.${raidId}`,
                },
                () => fetchData(),
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [raidId, character]);

    const handleJoin = async () => {
        if (!character || !raid) return;

        setIsJoining(true);

        try {
            await supabase.from("raid_participants").insert({
                raid_id: raid.id,
                user_id: character.user_id,
            });

            await fetchData();
        } catch (error) {
            console.error("Error joining raid:", error);
        } finally {
            setIsJoining(false);
        }
    };

    const handleContribute = async () => {
        if (!character || !raid || !myParticipation || !description.trim())
            return;

        setIsContributing(true);

        try {
            let proofUrl = null;

            // Upload proof if exists
            if (proofFile) {
                const fileExt = proofFile.name.split(".").pop();
                const fileName = `raid-${raid.id}-${Date.now()}.${fileExt}`;

                const { data: uploadData } = await supabase.storage
                    .from("quest-proofs")
                    .upload(fileName, proofFile);

                if (uploadData) {
                    const {
                        data: { publicUrl },
                    } = supabase.storage
                        .from("quest-proofs")
                        .getPublicUrl(uploadData.path);
                    proofUrl = publicUrl;
                }
            }

            // Calculate damage based on character stats
            const baseDamage = 10;
            const statBonus =
                (character.strength + character.constitution) / 20;
            const damage = Math.round(baseDamage * (1 + statBonus));

            // Add contribution
            await supabase.from("raid_contributions").insert({
                raid_id: raid.id,
                participant_id: myParticipation.id,
                description: description.trim(),
                damage_amount: damage,
                proof_image_url: proofUrl,
            });

            // Update participant stats
            await supabase
                .from("raid_participants")
                .update({
                    damage_dealt: myParticipation.damage_dealt + damage,
                    contribution_count: myParticipation.contribution_count + 1,
                })
                .eq("id", myParticipation.id);

            // Update boss health
            const newHealth = Math.max(0, raid.boss_current_health - damage);
            await supabase
                .from("raids")
                .update({ boss_current_health: newHealth })
                .eq("id", raid.id);

            // Award XP
            await supabase.rpc("add_xp", {
                p_user_id: character.user_id,
                p_amount: raid.xp_reward_per_contribution,
                p_source: "raid_contribution",
                p_source_id: raid.id,
                p_description: `Contribuição na raid: ${raid.title}`,
            });

            setDescription("");
            setProofFile(null);
            await fetchData();
        } catch (error) {
            console.error("Error contributing:", error);
        } finally {
            setIsContributing(false);
        }
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

    if (!raid) {
        return (
            <div className="text-center py-8">
                <p className="font-pixel text-sm text-gray-400">
                    Raid não encontrada
                </p>
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="mt-4"
                >
                    Voltar
                </Button>
            </div>
        );
    }

    const healthPercent =
        (raid.boss_current_health / raid.boss_max_health) * 100;
    const isActive = raid.status === "active";
    const isCompleted = raid.status === "completed";

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center gap-3">
                <button
                    onClick={() => router.back()}
                    className="p-2 text-gray-400 hover:text-foreground transition-colors"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <h1 className="font-pixel text-sm text-foreground">
                    {raid.title}
                </h1>
            </div>

            {/* Boss Card */}
            <Card
                className={cn(
                    isActive && "border-health",
                    isCompleted && "border-secondary-500",
                )}
            >
                <CardContent className="pt-4">
                    {/* Boss Display */}
                    <div className="text-center mb-4">
                        <div
                            className={cn(
                                "w-24 h-24 mx-auto mb-3 flex items-center justify-center border-pixel border-black text-5xl",
                                isActive
                                    ? "bg-health/20 animate-shake"
                                    : "bg-gray-200",
                                isCompleted && "opacity-50",
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
                        <h2 className="font-pixel text-lg text-gray-900">
                            {raid.boss_name}
                        </h2>

                        {isCompleted && (
                            <p className="font-pixel text-sm text-secondary-600 mt-2">
                                DERROTADO!
                            </p>
                        )}
                    </div>

                    {/* Health Bar */}
                    <div className="mb-4">
                        <div className="flex items-center justify-between mb-1">
                            <span className="font-pixel text-[10px] text-gray-600">
                                HP do Boss
                            </span>
                            <span className="font-pixel text-[10px] text-health">
                                {raid.boss_current_health}/
                                {raid.boss_max_health}
                            </span>
                        </div>
                        <Progress
                            value={raid.boss_current_health}
                            max={raid.boss_max_health}
                            variant="boss"
                            size="lg"
                            showLabel
                        />
                    </div>

                    {/* Description */}
                    {raid.description && (
                        <p className="font-pixel text-[10px] text-gray-700 p-3 bg-gray-100 border-2 border-black">
                            {raid.description}
                        </p>
                    )}

                    {/* Rewards */}
                    <div className="mt-4 flex items-center justify-center gap-4">
                        <div className="text-center">
                            <Sparkles className="w-5 h-5 mx-auto text-xp mb-1" />
                            <p className="font-pixel text-[8px] text-gray-600">
                                Por ataque
                            </p>
                            <p className="font-pixel text-sm text-xp">
                                +{raid.xp_reward_per_contribution}
                            </p>
                        </div>
                        <div className="text-center">
                            <Flame className="w-5 h-5 mx-auto text-primary-500 mb-1" />
                            <p className="font-pixel text-[8px] text-gray-600">
                                Bônus vitória
                            </p>
                            <p className="font-pixel text-sm text-primary-500">
                                +{raid.completion_bonus_xp}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Join/Contribute */}
            {isActive && character && (
                <>
                    {!myParticipation ? (
                        <Button
                            variant="danger"
                            className="w-full"
                            onClick={handleJoin}
                            isLoading={isJoining}
                        >
                            <Swords className="w-5 h-5" />
                            Entrar na Batalha!
                        </Button>
                    ) : (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Flame className="w-4 h-4 text-health" />
                                    Contribuir com Ataque
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <label className="block mb-1 font-pixel text-[10px] uppercase text-gray-900">
                                        Descreva seu exercício
                                    </label>
                                    <textarea
                                        value={description}
                                        onChange={(e) =>
                                            setDescription(e.target.value)
                                        }
                                        placeholder="Ex: Corri 3km hoje..."
                                        rows={2}
                                        className="w-full px-3 py-2 font-pixel text-xs border-pixel border-black bg-white text-gray-900 shadow-pixel-inset focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                                    />
                                </div>

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) =>
                                        setProofFile(
                                            e.target.files?.[0] || null,
                                        )
                                    }
                                    className="hidden"
                                />

                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full border-2 border-dashed border-gray-400"
                                    onClick={() =>
                                        fileInputRef.current?.click()
                                    }
                                >
                                    <Camera className="w-4 h-4 mr-2" />
                                    {proofFile
                                        ? proofFile.name
                                        : "Foto de prova (opcional)"}
                                </Button>

                                <Button
                                    variant="danger"
                                    className="w-full"
                                    onClick={handleContribute}
                                    disabled={!description.trim()}
                                    isLoading={isContributing}
                                >
                                    <Swords className="w-5 h-5" />
                                    Atacar! (-
                                    {Math.round(
                                        10 *
                                            (1 +
                                                (character.strength +
                                                    character.constitution) /
                                                    20),
                                    )}{" "}
                                    HP)
                                </Button>

                                <p className="font-pixel text-[8px] text-gray-500 text-center">
                                    Você já causou{" "}
                                    {myParticipation.damage_dealt} de dano (
                                    {myParticipation.contribution_count}{" "}
                                    ataques)
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </>
            )}

            {/* Participants */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-primary-500" />
                        Guerreiros ({participants.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {participants.length === 0 ? (
                        <p className="font-pixel text-[10px] text-gray-500 text-center py-4">
                            Nenhum guerreiro ainda. Seja o primeiro!
                        </p>
                    ) : (
                        <div className="space-y-2">
                            {participants.map((p, index) => (
                                <div
                                    key={p.id}
                                    className={cn(
                                        "flex items-center gap-3 p-2 border-2 border-black",
                                        index === 0 && "bg-primary-100",
                                        index > 0 && "bg-gray-100",
                                    )}
                                >
                                    <span className="font-pixel text-xs text-gray-500 w-4">
                                        {index + 1}.
                                    </span>
                                    {p.character && (
                                        <AvatarDisplay
                                            character={p.character}
                                            size="sm"
                                        />
                                    )}
                                    <div className="flex-1">
                                        <p className="font-pixel text-[10px] text-gray-900">
                                            {p.character?.name || "Anônimo"}
                                        </p>
                                        <p className="font-pixel text-[8px] text-gray-600">
                                            {p.contribution_count} ataques
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-pixel text-xs text-health">
                                            {p.damage_dealt}
                                        </p>
                                        <p className="font-pixel text-[8px] text-gray-500">
                                            dano
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
