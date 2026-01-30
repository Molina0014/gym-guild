"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useCharacter } from "@/hooks/use-character";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QUEST_TYPES } from "@/lib/constants/quest-types";
import type { Quest, QuestSupport } from "@/types/database";
import { cn } from "@/lib/utils/cn";
import {
    ChevronLeft,
    CheckCircle,
    Camera,
    Sparkles,
    Heart,
    Zap,
    Gift,
    Trash2,
    Globe,
    Lock,
} from "lucide-react";

const SUPPORT_EMOJIS = ["💪", "🔥", "⭐", "👏", "🎯", "💯"];

export default function QuestDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { character } = useCharacter();
    const supabase = createClient();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [quest, setQuest] = useState<Quest | null>(null);
    const [supports, setSupports] = useState<QuestSupport[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCompleting, setIsCompleting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [proofImage, setProofImage] = useState<File | null>(null);
    const [proofPreview, setProofPreview] = useState<string | null>(null);

    const questId = params.id as string;
    const isOwner = character?.user_id === quest?.creator_id;
    const questType = quest ? QUEST_TYPES[quest.quest_type] : null;

    useEffect(() => {
        const fetchQuest = async () => {
            const { data } = await supabase
                .from("quests")
                .select("*")
                .eq("id", questId)
                .single();

            setQuest(data);
            setIsLoading(false);
        };

        const fetchSupports = async () => {
            const { data } = await supabase
                .from("quest_support")
                .select("*")
                .eq("quest_id", questId);

            setSupports(data || []);
        };

        fetchQuest();
        fetchSupports();
    }, [questId]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setProofImage(file);
            setProofPreview(URL.createObjectURL(file));
        }
    };

    const handleComplete = async () => {
        if (!quest || !character) return;

        setIsCompleting(true);

        try {
            let proofUrl = null;

            // Upload proof image if exists
            if (proofImage) {
                const fileExt = proofImage.name.split(".").pop();
                const fileName = `${quest.id}-${Date.now()}.${fileExt}`;

                const { data: uploadData, error: uploadError } =
                    await supabase.storage
                        .from("quest-proofs")
                        .upload(fileName, proofImage);

                if (!uploadError && uploadData) {
                    const {
                        data: { publicUrl },
                    } = supabase.storage
                        .from("quest-proofs")
                        .getPublicUrl(uploadData.path);
                    proofUrl = publicUrl;
                }
            }

            // Update quest
            const { error: updateError } = await supabase
                .from("quests")
                .update({
                    status: "completed",
                    completed_at: new Date().toISOString(),
                    proof_image_url: proofUrl,
                })
                .eq("id", quest.id);

            if (updateError) throw updateError;

            // Add XP via RPC function
            await supabase.rpc("add_xp", {
                p_user_id: character.user_id,
                p_amount: quest.xp_reward,
                p_source: "quest_complete",
                p_source_id: quest.id,
                p_description: `Quest concluída: ${quest.title}`,
            });

            router.push("/quests");
        } catch (error) {
            console.error("Error completing quest:", error);
        } finally {
            setIsCompleting(false);
        }
    };

    const handleDelete = async () => {
        if (!quest || !confirm("Tem certeza que deseja abandonar esta quest?"))
            return;

        setIsDeleting(true);

        try {
            await supabase.from("quests").delete().eq("id", quest.id);
            router.push("/quests");
        } catch (error) {
            console.error("Error deleting quest:", error);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleSupport = async (emoji: string) => {
        if (!quest || !character || isOwner) return;

        const existingSupport = supports.find(
            (s) =>
                s.supporter_id === character.user_id &&
                s.support_type === "emoji",
        );

        if (existingSupport) {
            // Update existing
            await supabase
                .from("quest_support")
                .update({ content: emoji })
                .eq("id", existingSupport.id);
        } else {
            // Create new
            await supabase.from("quest_support").insert({
                quest_id: quest.id,
                supporter_id: character.user_id,
                support_type: "emoji",
                content: emoji,
            });
        }

        // Refresh supports
        const { data } = await supabase
            .from("quest_support")
            .select("*")
            .eq("quest_id", questId);
        setSupports(data || []);
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

    if (!quest) {
        return (
            <div className="text-center py-8">
                <p className="font-pixel text-sm text-gray-400">
                    Quest não encontrada
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

    const isCompleted = quest.status === "completed";

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
                <div className="flex-1">
                    <h1 className="font-pixel text-sm text-foreground">
                        {quest.title}
                    </h1>
                    <div className="flex items-center gap-2">
                        <span className="font-pixel text-[8px] text-gray-400">
                            {questType?.name}
                        </span>
                        {quest.is_public ? (
                            <Globe className="w-3 h-3 text-gray-400" />
                        ) : (
                            <Lock className="w-3 h-3 text-gray-400" />
                        )}
                    </div>
                </div>
            </div>

            {/* Quest Info */}
            <Card variant="quest">
                <CardContent className="pt-4">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 flex items-center justify-center bg-primary-100 border-pixel border-black">
                            <span className="text-3xl">
                                {quest.quest_type === "cardio" && "❤️"}
                                {quest.quest_type === "strength" && "💪"}
                                {quest.quest_type === "flexibility" && "🧘"}
                                {quest.quest_type === "sports" && "🏆"}
                                {quest.quest_type === "outdoor" && "🏔️"}
                                {quest.quest_type === "challenge" && "⭐"}
                            </span>
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <Sparkles className="w-4 h-4 text-xp" />
                                <span className="font-pixel text-lg text-xp">
                                    +{quest.xp_reward} XP
                                </span>
                            </div>
                            <span
                                className={cn(
                                    "font-pixel text-[10px] px-2 py-1 border border-black",
                                    isCompleted
                                        ? "bg-secondary-500 text-white"
                                        : "bg-primary-100 text-gray-900",
                                )}
                            >
                                {isCompleted ? "Completa" : "Em Progresso"}
                            </span>
                        </div>
                    </div>

                    {quest.description && (
                        <p className="font-pixel text-[10px] text-gray-700 p-3 bg-gray-100 border-2 border-black">
                            {quest.description}
                        </p>
                    )}

                    {/* Proof Image */}
                    {quest.proof_image_url && (
                        <div className="mt-4">
                            <p className="font-pixel text-[8px] text-gray-500 mb-2">
                                Foto de prova:
                            </p>
                            <img
                                src={quest.proof_image_url}
                                alt="Prova"
                                className="w-full border-pixel border-black"
                            />
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Support Section (for public quests, non-owners) */}
            {quest.is_public && !isOwner && !isCompleted && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Heart className="w-4 h-4 text-health" />
                            Enviar Apoio
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {SUPPORT_EMOJIS.map((emoji) => (
                                <button
                                    key={emoji}
                                    onClick={() => handleSupport(emoji)}
                                    className={cn(
                                        "w-10 h-10 text-xl border-2 border-black transition-all",
                                        supports.some(
                                            (s) =>
                                                s.supporter_id ===
                                                    character?.user_id &&
                                                s.content === emoji,
                                        )
                                            ? "bg-primary-500 shadow-pixel-sm translate-x-[2px] translate-y-[2px]"
                                            : "bg-white shadow-pixel hover:bg-primary-100",
                                    )}
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>

                        {supports.length > 0 && (
                            <div className="mt-3 pt-3 border-t-2 border-black/20">
                                <p className="font-pixel text-[8px] text-gray-500">
                                    {supports.length} pessoa(s) apoiando esta
                                    quest!
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Actions for Owner */}
            {isOwner && !isCompleted && (
                <>
                    {/* Photo Proof */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Camera className="w-4 h-4 text-primary-500" />
                                Foto de Prova (opcional)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                capture="environment"
                                onChange={handleFileChange}
                                className="hidden"
                            />

                            {proofPreview ? (
                                <div className="relative">
                                    <img
                                        src={proofPreview}
                                        alt="Preview"
                                        className="w-full border-pixel border-black"
                                    />
                                    <Button
                                        variant="danger"
                                        size="sm"
                                        className="absolute top-2 right-2"
                                        onClick={() => {
                                            setProofImage(null);
                                            setProofPreview(null);
                                        }}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            ) : (
                                <Button
                                    variant="ghost"
                                    className="w-full h-24 border-2 border-dashed border-gray-400"
                                    onClick={() =>
                                        fileInputRef.current?.click()
                                    }
                                >
                                    <Camera className="w-6 h-6 mr-2" />
                                    Tirar Foto
                                </Button>
                            )}
                        </CardContent>
                    </Card>

                    {/* Complete Button */}
                    <Button
                        variant="secondary"
                        className="w-full"
                        onClick={handleComplete}
                        isLoading={isCompleting}
                    >
                        <CheckCircle className="w-5 h-5" />
                        Completar Quest
                    </Button>

                    {/* Delete Button */}
                    <Button
                        variant="danger"
                        className="w-full"
                        onClick={handleDelete}
                        isLoading={isDeleting}
                    >
                        <Trash2 className="w-5 h-5" />
                        Abandonar Quest
                    </Button>
                </>
            )}
        </div>
    );
}
