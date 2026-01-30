"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { StyleSelector } from "./style-selector";
import { type AvatarStyle } from "@/lib/constants/avatar-styles";
import { Sparkles, RefreshCw, Check, Loader2, Wand2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface AvatarGeneratorProps {
    userId: string;
    email: string;
    name: string;
    race: string;
    characterClass: string;
    raceName: string;
    className: string;
    onAvatarGenerated: (avatarUrl: string, style: AvatarStyle) => void;
    onBack: () => void;
}

type Step = "style" | "description" | "generating" | "preview";

export function AvatarGenerator({
    userId,
    email,
    name,
    race,
    characterClass,
    raceName,
    className,
    onAvatarGenerated,
    onBack,
}: AvatarGeneratorProps) {
    const [step, setStep] = useState<Step>("style");
    const [selectedStyle, setSelectedStyle] = useState<AvatarStyle | null>(
        null,
    );
    const [description, setDescription] = useState("");
    const [generatedAvatarUrl, setGeneratedAvatarUrl] = useState<string | null>(
        null,
    );
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleStyleSelect = (style: AvatarStyle) => {
        setSelectedStyle(style);
    };

    const handleGenerate = async () => {
        if (!selectedStyle) return;

        setStep("generating");
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch("/api/generate-avatar", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId,
                    email,
                    name,
                    style: selectedStyle,
                    race,
                    characterClass,
                    raceName,
                    className,
                    description,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to generate avatar");
            }

            if (data.success && data.avatarUrl) {
                setGeneratedAvatarUrl(data.avatarUrl);
                setStep("preview");
            } else {
                throw new Error("No avatar URL returned");
            }
        } catch (err: any) {
            setError(err.message || "Erro ao gerar avatar. Tente novamente.");
            setStep("description");
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegenerate = () => {
        setGeneratedAvatarUrl(null);
        handleGenerate();
    };

    const handleConfirm = () => {
        if (generatedAvatarUrl && selectedStyle) {
            onAvatarGenerated(generatedAvatarUrl, selectedStyle);
        }
    };

    return (
        <Card className="w-full max-w-md">
            {/* Step: Select Style */}
            {step === "style" && (
                <>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-center gap-2">
                            <Wand2 className="w-5 h-5 text-primary-500" />
                            Escolha o Estilo
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <StyleSelector
                            selectedStyle={selectedStyle}
                            onSelect={handleStyleSelect}
                        />
                        <div className="flex gap-2 pt-2">
                            <Button
                                variant="ghost"
                                onClick={onBack}
                                className="flex-1"
                            >
                                Voltar
                            </Button>
                            <Button
                                variant="primary"
                                onClick={() => setStep("description")}
                                disabled={!selectedStyle}
                                className="flex-1"
                            >
                                Continuar
                            </Button>
                        </div>
                    </CardContent>
                </>
            )}

            {/* Step: Description */}
            {step === "description" && (
                <>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-center gap-2">
                            <Sparkles className="w-5 h-5 text-primary-500" />
                            Descreva seu Herói
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-3 bg-gray-100 border-2 border-black">
                            <div className="font-pixel text-[10px] text-gray-600 mb-1">
                                Personagem Base:
                            </div>
                            <div className="font-pixel text-xs text-gray-900">
                                {raceName} {className}
                            </div>
                        </div>

                        <div>
                            <label className="block font-pixel text-xs text-gray-700 mb-2">
                                Detalhes adicionais (opcional):
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Ex: cabelo ruivo, cicatriz no rosto, armadura dourada, olhos verdes..."
                                className="w-full p-3 border-pixel border-black bg-white font-pixel text-xs resize-none h-24 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                maxLength={200}
                            />
                            <div className="font-pixel text-[8px] text-gray-500 text-right mt-1">
                                {description.length}/200
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
                                onClick={() => setStep("style")}
                                className="flex-1"
                            >
                                Voltar
                            </Button>
                            <Button
                                variant="secondary"
                                onClick={handleGenerate}
                                className="flex-1"
                            >
                                <Sparkles className="w-4 h-4 mr-1" />
                                Gerar Avatar
                            </Button>
                        </div>
                    </CardContent>
                </>
            )}

            {/* Step: Generating */}
            {step === "generating" && (
                <>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-center gap-2">
                            <Loader2 className="w-5 h-5 text-primary-500 animate-spin" />
                            Gerando Avatar
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="w-32 h-32 bg-gray-200 border-pixel border-black flex items-center justify-center mb-4 animate-pulse">
                                <Wand2 className="w-12 h-12 text-gray-400" />
                            </div>
                            <p className="font-pixel text-[10px] text-gray-500 text-center">
                                A magia está sendo conjurada...
                                <br />
                                Isso pode levar alguns segundos.
                            </p>
                        </div>
                    </CardContent>
                </>
            )}

            {/* Step: Preview */}
            {step === "preview" && generatedAvatarUrl && (
                <>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-center gap-2">
                            <Check className="w-5 h-5 text-secondary-500" />
                            Avatar Gerado!
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-center">
                            <div className="w-48 h-48 border-pixel border-black shadow-pixel overflow-hidden">
                                <img
                                    src={generatedAvatarUrl}
                                    alt="Generated Avatar"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>

                        <p className="font-pixel text-[8px] text-gray-500 text-center">
                            Gostou do resultado? Você pode gerar outro ou usar
                            este.
                        </p>

                        <div className="flex gap-2">
                            <Button
                                variant="ghost"
                                onClick={handleRegenerate}
                                disabled={isLoading}
                                className="flex-1"
                            >
                                <RefreshCw
                                    className={cn(
                                        "w-4 h-4 mr-1",
                                        isLoading && "animate-spin",
                                    )}
                                />
                                Gerar Outro
                            </Button>
                            <Button
                                variant="secondary"
                                onClick={handleConfirm}
                                className="flex-1"
                            >
                                <Check className="w-4 h-4 mr-1" />
                                Usar Este
                            </Button>
                        </div>
                    </CardContent>
                </>
            )}
        </Card>
    );
}
