"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useCharacter } from "@/hooks/use-character";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AvatarGenerator } from "@/components/avatar/avatar-generator";
import { AvatarUploader } from "@/components/avatar/avatar-uploader";
import { type AvatarStyle } from "@/lib/constants/avatar-styles";
import {
    ArrowLeft,
    Camera,
    Sparkles,
    History,
    Check,
    ImageIcon,
} from "lucide-react";

type Tab = "generate" | "upload" | "history";

interface AvatarHistoryItem {
    id: string;
    file_name: string;
    avatar_url: string;
    style: string | null;
    description: string | null;
    is_active: boolean;
    created_at: string;
}

export default function EditAvatarPage() {
    const router = useRouter();
    const { character, refetch: refreshCharacter } = useCharacter();
    const [activeTab, setActiveTab] = useState<Tab>("generate");
    const [avatarHistory, setAvatarHistory] = useState<AvatarHistoryItem[]>([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [userId, setUserId] = useState<string>("");
    const [userEmail, setUserEmail] = useState<string>("");
    const supabase = createClient();

    // Fetch user info
    useEffect(() => {
        const fetchUser = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (user) {
                setUserId(user.id);
                setUserEmail(user.email || "");
            }
        };
        fetchUser();
    }, [supabase]);

    // Fetch avatar history
    useEffect(() => {
        const fetchHistory = async () => {
            if (!userId) return;

            setIsLoadingHistory(true);
            const { data, error } = await supabase
                .from("avatar_history")
                .select("*")
                .eq("user_id", userId)
                .order("created_at", { ascending: false });

            if (!error && data) {
                setAvatarHistory(data);
            }
            setIsLoadingHistory(false);
        };

        fetchHistory();
    }, [userId, supabase]);

    const handleAvatarGenerated = async (
        avatarUrl: string,
        style: AvatarStyle,
    ) => {
        // Update character's avatar_url
        if (character) {
            await supabase
                .from("characters")
                .update({
                    avatar_url: avatarUrl,
                    avatar_style: style,
                })
                .eq("id", character.id);

            // Refresh history
            const { data } = await supabase
                .from("avatar_history")
                .select("*")
                .eq("user_id", userId)
                .order("created_at", { ascending: false });

            if (data) {
                setAvatarHistory(data);
            }

            refreshCharacter();
        }
    };

    const handleAvatarUploaded = async (avatarUrl: string) => {
        if (character) {
            // Save to history
            await supabase.from("avatar_history").insert({
                user_id: userId,
                file_name: `${userId}/${Date.now()}`,
                avatar_url: avatarUrl,
                style: "upload",
                is_active: true,
            });

            // Deactivate previous
            await supabase
                .from("avatar_history")
                .update({ is_active: false })
                .eq("user_id", userId)
                .neq("avatar_url", avatarUrl);

            // Update character
            await supabase
                .from("characters")
                .update({
                    avatar_url: avatarUrl,
                    avatar_style: "upload",
                })
                .eq("id", character.id);

            // Refresh history
            const { data } = await supabase
                .from("avatar_history")
                .select("*")
                .eq("user_id", userId)
                .order("created_at", { ascending: false });

            if (data) {
                setAvatarHistory(data);
            }

            refreshCharacter();
        }
    };

    const handleSelectFromHistory = async (historyItem: AvatarHistoryItem) => {
        if (!character || historyItem.is_active) return;

        setIsUpdating(true);

        // Deactivate all
        await supabase
            .from("avatar_history")
            .update({ is_active: false })
            .eq("user_id", userId);

        // Activate selected
        await supabase
            .from("avatar_history")
            .update({ is_active: true })
            .eq("id", historyItem.id);

        // Update character
        await supabase
            .from("characters")
            .update({
                avatar_url: historyItem.avatar_url,
                avatar_style: historyItem.style as AvatarStyle,
            })
            .eq("id", character.id);

        // Refresh
        setAvatarHistory((prev) =>
            prev.map((item) => ({
                ...item,
                is_active: item.id === historyItem.id,
            })),
        );

        refreshCharacter();
        setIsUpdating(false);
    };

    const getStyleLabel = (style: string | null) => {
        switch (style) {
            case "pixel":
                return "Pixel Art";
            case "anime":
                return "Anime";
            case "realistic":
                return "Realista";
            case "upload":
                return "Upload";
            default:
                return "Desconhecido";
        }
    };

    if (!character) {
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
            <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" onClick={() => router.back()}>
                    <ArrowLeft className="w-4 h-4" />
                </Button>
                <h1 className="font-pixel text-lg text-foreground">
                    Editar Avatar
                </h1>
            </div>

            {/* Current Avatar */}
            <Card>
                <CardContent className="py-4">
                    <div className="flex items-center gap-4">
                        <div className="w-20 h-20 border-pixel border-black overflow-hidden">
                            {character.avatar_url ? (
                                <img
                                    src={character.avatar_url}
                                    alt={character.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                    <ImageIcon className="w-8 h-8 text-gray-400" />
                                </div>
                            )}
                        </div>
                        <div>
                            <p className="font-pixel text-sm text-gray-900">
                                {character.name}
                            </p>
                            <p className="font-pixel text-[10px] text-gray-500">
                                Avatar atual
                            </p>
                            {character.avatar_style && (
                                <span className="inline-block mt-1 px-2 py-0.5 bg-primary-100 border border-primary-300 font-pixel text-[8px] text-primary-700">
                                    {getStyleLabel(character.avatar_style)}
                                </span>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Tabs */}
            <div className="flex gap-2">
                <Button
                    variant={activeTab === "generate" ? "primary" : "ghost"}
                    size="sm"
                    onClick={() => setActiveTab("generate")}
                    className="flex-1"
                >
                    <Sparkles className="w-3 h-3 mr-1" />
                    Gerar IA
                </Button>
                <Button
                    variant={activeTab === "upload" ? "primary" : "ghost"}
                    size="sm"
                    onClick={() => setActiveTab("upload")}
                    className="flex-1"
                >
                    <Camera className="w-3 h-3 mr-1" />
                    Upload
                </Button>
                <Button
                    variant={activeTab === "history" ? "primary" : "ghost"}
                    size="sm"
                    onClick={() => setActiveTab("history")}
                    className="flex-1"
                >
                    <History className="w-3 h-3 mr-1" />
                    Histórico
                </Button>
            </div>

            {/* Tab Content */}
            {activeTab === "generate" && (
                <AvatarGenerator
                    userId={userId}
                    email={userEmail}
                    name={character.name}
                    race={character.race}
                    characterClass={character.class}
                    raceName={
                        character.race.charAt(0).toUpperCase() +
                        character.race.slice(1)
                    }
                    className={
                        character.class.charAt(0).toUpperCase() +
                        character.class.slice(1)
                    }
                    onAvatarGenerated={handleAvatarGenerated}
                    onBack={() => router.back()}
                />
            )}

            {activeTab === "upload" && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Camera className="w-4 h-4 text-primary-500" />
                            Enviar Foto
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <AvatarUploader
                            onAvatarUploaded={handleAvatarUploaded}
                            onBack={() => setActiveTab("generate")}
                        />
                    </CardContent>
                </Card>
            )}

            {activeTab === "history" && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <History className="w-4 h-4 text-primary-500" />
                            Histórico de Avatares
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {isLoadingHistory ? (
                            <p className="font-pixel text-[10px] text-gray-500 text-center py-4">
                                Carregando...
                            </p>
                        ) : avatarHistory.length === 0 ? (
                            <p className="font-pixel text-[10px] text-gray-500 text-center py-4">
                                Nenhum avatar gerado ainda.
                                <br />
                                Use a aba &ldquo;Gerar IA&rdquo; para criar seu
                                primeiro!
                            </p>
                        ) : (
                            <div className="grid grid-cols-3 gap-3">
                                {avatarHistory.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() =>
                                            handleSelectFromHistory(item)
                                        }
                                        disabled={isUpdating || item.is_active}
                                        className={`relative aspect-square border-pixel overflow-hidden transition-all ${
                                            item.is_active
                                                ? "border-primary-500 ring-2 ring-primary-300"
                                                : "border-black hover:border-primary-400"
                                        } ${isUpdating ? "opacity-50" : ""}`}
                                    >
                                        <img
                                            src={item.avatar_url}
                                            alt="Avatar"
                                            className="w-full h-full object-cover"
                                        />
                                        {item.is_active && (
                                            <div className="absolute top-1 right-1 w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center">
                                                <Check className="w-3 h-3 text-white" />
                                            </div>
                                        )}
                                        <div className="absolute bottom-0 left-0 right-0 bg-black/70 px-1 py-0.5">
                                            <p className="font-pixel text-[6px] text-white truncate">
                                                {getStyleLabel(item.style)}
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
