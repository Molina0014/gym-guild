"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { RACE_LIST, RACES } from "@/lib/constants/races";
import { CLASS_LIST, CLASSES } from "@/lib/constants/classes";
import {
    AvatarChoice,
    AvatarGenerator,
    AvatarUploader,
} from "@/components/avatar";
import type { Race, CharacterClass } from "@/types/database";
import type { AvatarStyle } from "@/lib/constants/avatar-styles";
import {
    ChevronLeft,
    ChevronRight,
    Sparkles,
    User,
    Shield,
    Swords,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

type Step =
    | "name"
    | "race"
    | "class"
    | "avatar-choice"
    | "avatar-upload"
    | "avatar-generate"
    | "confirm";

const BASE_STATS = {
    strength: 10,
    agility: 10,
    constitution: 10,
    wisdom: 10,
};

export default function OnboardingPage() {
    const [step, setStep] = useState<Step>("name");
    const [name, setName] = useState("");
    const [race, setRace] = useState<Race | null>(null);
    const [characterClass, setCharacterClass] = useState<CharacterClass | null>(
        null,
    );
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [avatarStyle, setAvatarStyle] = useState<
        AvatarStyle | "upload" | null
    >(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [userEmail, setUserEmail] = useState<string | null>(null);

    const router = useRouter();
    const supabase = createClient();

    // Buscar dados do usuário ao carregar
    useEffect(() => {
        const getUser = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (user) {
                setUserId(user.id);
                setUserEmail(user.email || null);
            }
        };
        getUser();
    }, [supabase.auth]);

    const calculateStats = () => {
        const stats = { ...BASE_STATS };

        if (race) {
            const raceInfo = RACES[race];
            stats.strength += raceInfo.bonuses.strength || 0;
            stats.agility += raceInfo.bonuses.agility || 0;
            stats.constitution += raceInfo.bonuses.constitution || 0;
            stats.wisdom += raceInfo.bonuses.wisdom || 0;
        }

        if (characterClass) {
            const classInfo = CLASSES[characterClass];
            stats.strength += classInfo.bonuses.strength || 0;
            stats.agility += classInfo.bonuses.agility || 0;
            stats.constitution += classInfo.bonuses.constitution || 0;
            stats.wisdom += classInfo.bonuses.wisdom || 0;
        }

        return stats;
    };

    // Upload de foto do usuário para o Supabase
    const uploadAvatarToStorage = async (
        file: File,
    ): Promise<string | null> => {
        if (!userId) return null;

        try {
            const fileExt = file.name.split(".").pop() || "png";
            const fileName = `${userId}-${Date.now()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from("avatars")
                .upload(fileName, file, { upsert: true });

            if (uploadError) {
                console.error("Upload error:", uploadError);
                return null;
            }

            const { data: urlData } = supabase.storage
                .from("avatars")
                .getPublicUrl(fileName);

            return urlData.publicUrl;
        } catch (err) {
            console.error("Error uploading avatar:", err);
            return null;
        }
    };

    // Avatar gerado pelo n8n (já vem como URL)
    const handleAvatarGenerated = (
        generatedAvatarUrl: string,
        style: AvatarStyle,
    ) => {
        setAvatarUrl(generatedAvatarUrl);
        setAvatarStyle(style);
        setStep("confirm");
    };

    // Avatar enviado pelo usuário (precisa fazer upload)
    const handleAvatarUploaded = async (file: File) => {
        setIsLoading(true);
        try {
            const uploadedUrl = await uploadAvatarToStorage(file);
            if (uploadedUrl) {
                setAvatarUrl(uploadedUrl);
                setAvatarStyle("upload");
                setStep("confirm");
            } else {
                setError("Erro ao fazer upload da imagem. Tente novamente.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateCharacter = async () => {
        if (!name || !race || !characterClass) return;

        setIsLoading(true);
        setError(null);

        try {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) {
                setError("Usuário não autenticado. Faça login novamente.");
                return;
            }

            const stats = calculateStats();

            const { error: insertError } = await supabase
                .from("characters")
                .insert({
                    user_id: user.id,
                    name,
                    race,
                    class: characterClass,
                    strength: stats.strength,
                    agility: stats.agility,
                    constitution: stats.constitution,
                    wisdom: stats.wisdom,
                    avatar_url: avatarUrl,
                    avatar_style: avatarStyle,
                    avatar_config: {
                        race,
                        class: characterClass,
                        seed: user.id,
                    },
                });

            if (insertError) {
                setError(insertError.message);
                return;
            }

            router.push("/home");
        } catch (err) {
            setError("Erro ao criar personagem. Tente novamente.");
        } finally {
            setIsLoading(false);
        }
    };

    const nextStep = () => {
        if (step === "name" && name.trim()) setStep("race");
        else if (step === "race" && race) setStep("class");
        else if (step === "class" && characterClass) setStep("avatar-choice");
    };

    const prevStep = () => {
        if (step === "race") setStep("name");
        else if (step === "class") setStep("race");
        else if (step === "avatar-choice") setStep("class");
        else if (step === "avatar-upload") setStep("avatar-choice");
        else if (step === "avatar-generate") setStep("avatar-choice");
        else if (step === "confirm") setStep("avatar-choice");
    };

    const stats = calculateStats();

    // Progress steps for visual indicator
    const progressSteps = ["name", "race", "class", "avatar-choice", "confirm"];
    const currentProgressIndex = progressSteps.indexOf(
        step === "avatar-upload" || step === "avatar-generate"
            ? "avatar-choice"
            : step,
    );

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#1a1a2e]">
            {/* Progress indicator */}
            <div className="mb-6 flex items-center gap-2">
                {progressSteps.map((s, i) => (
                    <div
                        key={s}
                        className={cn(
                            "w-3 h-3 border-2 border-black",
                            i === currentProgressIndex
                                ? "bg-primary-500"
                                : i < currentProgressIndex
                                  ? "bg-secondary-500"
                                  : "bg-gray-600",
                        )}
                    />
                ))}
            </div>

            {/* Step: Name */}
            {step === "name" && (
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-center gap-2">
                            <User className="w-5 h-5 text-primary-500" />
                            Como te chamam, aventureiro?
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Input
                            label="Nome do Personagem"
                            placeholder="Sir Lancelot"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            maxLength={20}
                        />
                        <p className="font-pixel text-[8px] text-gray-500 text-center">
                            Escolha um nome épico para sua jornada!
                        </p>
                        <Button
                            variant="primary"
                            className="w-full"
                            onClick={nextStep}
                            disabled={!name.trim()}
                        >
                            Continuar <ChevronRight className="w-4 h-4" />
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Step: Race */}
            {step === "race" && (
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-center gap-2">
                            <Shield className="w-5 h-5 text-primary-500" />
                            Escolha sua Raça
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {RACE_LIST.map((r) => (
                            <button
                                key={r.id}
                                onClick={() => setRace(r.id)}
                                className={cn(
                                    "w-full p-3 border-pixel border-black text-left transition-all",
                                    race === r.id
                                        ? "bg-primary-500 text-white shadow-pixel-sm translate-x-1 translate-y-1"
                                        : "bg-parchment text-gray-900 shadow-pixel hover:bg-primary-100",
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">{r.emoji}</span>
                                    <div>
                                        <div className="font-pixel text-xs">
                                            {r.name}
                                        </div>
                                        <div className="font-pixel text-[8px] opacity-80">
                                            {r.description}
                                        </div>
                                    </div>
                                </div>
                            </button>
                        ))}

                        <div className="flex gap-2 pt-2">
                            <Button
                                variant="ghost"
                                onClick={prevStep}
                                className="flex-1"
                            >
                                <ChevronLeft className="w-4 h-4" /> Voltar
                            </Button>
                            <Button
                                variant="primary"
                                onClick={nextStep}
                                disabled={!race}
                                className="flex-1"
                            >
                                Continuar <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Step: Class */}
            {step === "class" && (
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-center gap-2">
                            <Swords className="w-5 h-5 text-primary-500" />
                            Escolha sua Classe
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {CLASS_LIST.map((c) => (
                            <button
                                key={c.id}
                                onClick={() => setCharacterClass(c.id)}
                                className={cn(
                                    "w-full p-3 border-pixel border-black text-left transition-all",
                                    characterClass === c.id
                                        ? "bg-primary-500 text-white shadow-pixel-sm translate-x-1 translate-y-1"
                                        : "bg-parchment text-gray-900 shadow-pixel hover:bg-primary-100",
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">{c.emoji}</span>
                                    <div>
                                        <div
                                            className={cn(
                                                "font-pixel text-xs",
                                                characterClass === c.id
                                                    ? ""
                                                    : c.color,
                                            )}
                                        >
                                            {c.name}
                                        </div>
                                        <div className="font-pixel text-[8px] opacity-80">
                                            {c.description}
                                        </div>
                                    </div>
                                </div>
                            </button>
                        ))}

                        <div className="flex gap-2 pt-2">
                            <Button
                                variant="ghost"
                                onClick={prevStep}
                                className="flex-1"
                            >
                                <ChevronLeft className="w-4 h-4" /> Voltar
                            </Button>
                            <Button
                                variant="primary"
                                onClick={nextStep}
                                disabled={!characterClass}
                                className="flex-1"
                            >
                                Continuar <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Step: Avatar Choice */}
            {step === "avatar-choice" && (
                <AvatarChoice
                    onChooseUpload={() => setStep("avatar-upload")}
                    onChooseGenerate={() => setStep("avatar-generate")}
                    onBack={prevStep}
                />
            )}

            {/* Step: Avatar Upload */}
            {step === "avatar-upload" && (
                <AvatarUploader
                    onImageSelected={handleAvatarUploaded}
                    onBack={() => setStep("avatar-choice")}
                />
            )}

            {/* Step: Avatar Generate */}
            {step === "avatar-generate" && race && characterClass && userId && (
                <AvatarGenerator
                    userId={userId}
                    email={userEmail || ""}
                    name={name}
                    race={race}
                    characterClass={characterClass}
                    raceName={RACES[race].name}
                    className={CLASSES[characterClass].name}
                    onAvatarGenerated={handleAvatarGenerated}
                    onBack={() => setStep("avatar-choice")}
                />
            )}

            {/* Step: Confirm */}
            {step === "confirm" && race && characterClass && (
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-center gap-2">
                            <Sparkles className="w-5 h-5 text-primary-500" />
                            Confirmar Personagem
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Character Summary with Avatar */}
                        <div className="text-center p-4 bg-gray-100 border-2 border-black">
                            {avatarUrl ? (
                                <div className="w-24 h-24 mx-auto mb-2 border-2 border-black overflow-hidden">
                                    <img
                                        src={avatarUrl}
                                        alt="Avatar"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            ) : (
                                <div className="text-4xl mb-2">
                                    {RACES[race].emoji}
                                </div>
                            )}
                            <div className="font-pixel text-sm text-gray-900">
                                {name}
                            </div>
                            <div className="font-pixel text-[10px] text-gray-600">
                                {RACES[race].name}{" "}
                                {CLASSES[characterClass].name}
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-2">
                            <div className="p-2 bg-red-100 border-2 border-black">
                                <div className="font-pixel text-[8px] text-gray-600">
                                    Força
                                </div>
                                <div className="font-pixel text-sm text-red-600">
                                    {stats.strength}
                                </div>
                            </div>
                            <div className="p-2 bg-green-100 border-2 border-black">
                                <div className="font-pixel text-[8px] text-gray-600">
                                    Agilidade
                                </div>
                                <div className="font-pixel text-sm text-green-600">
                                    {stats.agility}
                                </div>
                            </div>
                            <div className="p-2 bg-orange-100 border-2 border-black">
                                <div className="font-pixel text-[8px] text-gray-600">
                                    Constituição
                                </div>
                                <div className="font-pixel text-sm text-orange-600">
                                    {stats.constitution}
                                </div>
                            </div>
                            <div className="p-2 bg-purple-100 border-2 border-black">
                                <div className="font-pixel text-[8px] text-gray-600">
                                    Sabedoria
                                </div>
                                <div className="font-pixel text-sm text-purple-600">
                                    {stats.wisdom}
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="p-2 bg-red-100 border-2 border-black font-pixel text-[10px] text-red-800">
                                {error}
                            </div>
                        )}

                        <div className="flex gap-2">
                            <Button
                                variant="ghost"
                                onClick={prevStep}
                                className="flex-1"
                            >
                                <ChevronLeft className="w-4 h-4" /> Voltar
                            </Button>
                            <Button
                                variant="secondary"
                                onClick={handleCreateCharacter}
                                isLoading={isLoading}
                                className="flex-1"
                            >
                                Criar Herói!
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
