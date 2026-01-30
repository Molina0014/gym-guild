"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useCharacter } from "@/hooks/use-character";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QUEST_TYPE_LIST, calculateQuestXp } from "@/lib/constants/quest-types";
import { cn } from "@/lib/utils/cn";
import { ChevronLeft, Scroll, Globe, Lock, Sparkles } from "lucide-react";

export default function NewQuestPage() {
    const { character } = useCharacter();
    const router = useRouter();
    const supabase = createClient();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [questType, setQuestType] = useState<string>("");
    const [isPublic, setIsPublic] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const xpReward = questType ? calculateQuestXp(questType) : 0;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!character || !title.trim() || !questType) return;

        setIsLoading(true);
        setError(null);

        try {
            const { data, error: insertError } = await supabase
                .from("quests")
                .insert({
                    creator_id: character.user_id,
                    title: title.trim(),
                    description: description.trim() || null,
                    quest_type: questType,
                    is_public: isPublic,
                    xp_reward: xpReward,
                    status: "active",
                })
                .select()
                .single();

            if (insertError) {
                setError(insertError.message);
                return;
            }

            router.push(`/quests/${data.id}`);
        } catch (err) {
            setError("Erro ao criar quest. Tente novamente.");
        } finally {
            setIsLoading(false);
        }
    };

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
                <h1 className="font-pixel text-lg text-foreground flex items-center gap-2">
                    <Scroll className="w-5 h-5 text-primary-500" />
                    Nova Quest
                </h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Title */}
                <Card>
                    <CardContent className="pt-4">
                        <Input
                            label="Título da Quest"
                            placeholder="Ex: Correr 5km no parque"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            maxLength={50}
                            required
                        />
                    </CardContent>
                </Card>

                {/* Description */}
                <Card>
                    <CardContent className="pt-4">
                        <label className="block mb-1 font-pixel text-[10px] uppercase text-gray-900">
                            Descrição (opcional)
                        </label>
                        <textarea
                            placeholder="Detalhes sobre sua quest..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            maxLength={200}
                            rows={3}
                            className="w-full px-3 py-2 font-pixel text-xs border-pixel border-black bg-white text-gray-900 shadow-pixel-inset focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                        />
                    </CardContent>
                </Card>

                {/* Quest Type */}
                <Card>
                    <CardHeader>
                        <CardTitle>Tipo de Atividade</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {QUEST_TYPE_LIST.map((type) => (
                            <button
                                key={type.id}
                                type="button"
                                onClick={() => setQuestType(type.id)}
                                className={cn(
                                    "w-full p-3 border-pixel border-black text-left transition-all",
                                    questType === type.id
                                        ? "bg-primary-500 text-white shadow-pixel-sm translate-x-[2px] translate-y-[2px]"
                                        : "bg-white text-gray-900 shadow-pixel hover:bg-primary-100",
                                )}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className="text-lg">
                                            {type.id === "cardio" && "❤️"}
                                            {type.id === "strength" && "💪"}
                                            {type.id === "flexibility" && "🧘"}
                                            {type.id === "sports" && "🏆"}
                                            {type.id === "outdoor" && "🏔️"}
                                            {type.id === "challenge" && "⭐"}
                                        </span>
                                        <div>
                                            <div className="font-pixel text-[10px]">
                                                {type.name}
                                            </div>
                                            <div className="font-pixel text-[8px] opacity-70">
                                                {type.description}
                                            </div>
                                        </div>
                                    </div>
                                    <div
                                        className={cn(
                                            "font-pixel text-[10px]",
                                            questType === type.id
                                                ? "text-white"
                                                : "text-xp",
                                        )}
                                    >
                                        +{type.baseXp} XP
                                    </div>
                                </div>
                            </button>
                        ))}
                    </CardContent>
                </Card>

                {/* Visibility */}
                <Card>
                    <CardHeader>
                        <CardTitle>Visibilidade</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <button
                            type="button"
                            onClick={() => setIsPublic(true)}
                            className={cn(
                                "w-full p-3 border-pixel border-black text-left transition-all",
                                isPublic
                                    ? "bg-secondary-500 text-white shadow-pixel-sm translate-x-[2px] translate-y-[2px]"
                                    : "bg-white text-gray-900 shadow-pixel hover:bg-secondary-100",
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <Globe className="w-5 h-5" />
                                <div>
                                    <div className="font-pixel text-[10px]">
                                        Pública
                                    </div>
                                    <div className="font-pixel text-[8px] opacity-70">
                                        Todos podem ver e enviar apoio
                                    </div>
                                </div>
                            </div>
                        </button>

                        <button
                            type="button"
                            onClick={() => setIsPublic(false)}
                            className={cn(
                                "w-full p-3 border-pixel border-black text-left transition-all",
                                !isPublic
                                    ? "bg-gray-600 text-white shadow-pixel-sm translate-x-[2px] translate-y-[2px]"
                                    : "bg-white text-gray-900 shadow-pixel hover:bg-gray-100",
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <Lock className="w-5 h-5" />
                                <div>
                                    <div className="font-pixel text-[10px]">
                                        Privada
                                    </div>
                                    <div className="font-pixel text-[8px] opacity-70">
                                        Apenas você pode ver
                                    </div>
                                </div>
                            </div>
                        </button>
                    </CardContent>
                </Card>

                {/* XP Preview */}
                {questType && (
                    <Card className="bg-xp/10 border-xp">
                        <CardContent className="py-4 text-center">
                            <Sparkles className="w-6 h-6 mx-auto text-xp mb-2" />
                            <p className="font-pixel text-[10px] text-gray-700">
                                Recompensa ao completar:
                            </p>
                            <p className="font-pixel text-xl text-xp">
                                +{xpReward} XP
                            </p>
                        </CardContent>
                    </Card>
                )}

                {/* Error */}
                {error && (
                    <div className="p-3 bg-red-100 border-2 border-black font-pixel text-[10px] text-red-800">
                        {error}
                    </div>
                )}

                {/* Submit */}
                <Button
                    type="submit"
                    variant="primary"
                    className="w-full"
                    disabled={!title.trim() || !questType}
                    isLoading={isLoading}
                >
                    Criar Quest
                </Button>
            </form>
        </div>
    );
}
