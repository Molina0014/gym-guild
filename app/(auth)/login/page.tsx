"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Swords, Shield, Sparkles } from "lucide-react";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{
        type: "success" | "error";
        text: string;
    } | null>(null);
    const supabase = createClient();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);

        try {
            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                },
            });

            if (error) {
                setMessage({ type: "error", text: error.message });
            } else {
                setMessage({
                    type: "success",
                    text: "Link mágico enviado! Verifique seu email.",
                });
            }
        } catch {
            setMessage({
                type: "error",
                text: "Erro ao enviar link. Tente novamente.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#1a1a2e]">
            {/* Logo/Title */}
            <div className="mb-8 text-center">
                <div className="flex items-center justify-center gap-2 mb-4">
                    <Shield className="w-8 h-8 text-primary-400" />
                    <Swords className="w-10 h-10 text-primary-500" />
                    <Shield className="w-8 h-8 text-primary-400" />
                </div>
                <h1 className="font-pixel text-xl text-primary-400 mb-2">
                    GYM GUILD
                </h1>
                <p className="font-pixel text-[10px] text-gray-400">
                    Sua jornada épica começa aqui
                </p>
            </div>

            {/* Login Card */}
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-center flex items-center justify-center gap-2">
                        <Sparkles className="w-4 h-4 text-primary-500" />
                        Entrar na Guilda
                        <Sparkles className="w-4 h-4 text-primary-500" />
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <Input
                            type="email"
                            label="Seu Email"
                            placeholder="aventureiro@guild.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={isLoading}
                        />

                        <Button
                            type="submit"
                            variant="primary"
                            className="w-full"
                            isLoading={isLoading}
                        >
                            Enviar Link Mágico
                        </Button>

                        {message && (
                            <div
                                className={`p-3 border-2 border-black font-pixel text-[10px] text-center ${
                                    message.type === "success"
                                        ? "bg-secondary-100 text-secondary-800"
                                        : "bg-red-100 text-red-800"
                                }`}
                            >
                                {message.text}
                            </div>
                        )}
                    </form>

                    <div className="mt-6 pt-4 border-t-2 border-black/20">
                        <p className="font-pixel text-[8px] text-gray-500 text-center">
                            Um link mágico será enviado para seu email.
                            <br />
                            Clique nele para entrar instantaneamente!
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Footer */}
            <p className="mt-8 font-pixel text-[8px] text-gray-500">
                Feito com ❤️ para a comunidade
            </p>
        </div>
    );
}
