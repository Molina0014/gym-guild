"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Swords, Shield, Sparkles, LogIn } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const supabase = createClient();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                if (error.message === "Invalid login credentials") {
                    setError("Email ou senha incorretos");
                } else {
                    setError(error.message);
                }
                return;
            }

            if (data.user) {
                // Check if user has a character
                const { data: character } = await supabase
                    .from("characters")
                    .select("id")
                    .eq("user_id", data.user.id)
                    .single();

                if (character) {
                    router.push("/home");
                } else {
                    router.push("/onboarding");
                }
            }
        } catch {
            setError("Erro ao fazer login. Tente novamente.");
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
                            label="Email"
                            placeholder="aventureiro@guild.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={isLoading}
                        />

                        <Input
                            type="password"
                            label="Senha"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={isLoading}
                            minLength={6}
                        />

                        {error && (
                            <div className="p-3 border-2 border-black font-pixel text-[10px] text-center bg-red-100 text-red-800">
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            variant="primary"
                            className="w-full"
                            isLoading={isLoading}
                        >
                            <LogIn className="w-4 h-4 mr-2" />
                            Entrar
                        </Button>

                        <div className="text-center">
                            <Link
                                href="/forgot-password"
                                className="font-pixel text-[10px] text-primary-400 hover:text-primary-300 transition-colors"
                            >
                                Esqueci minha senha
                            </Link>
                        </div>
                    </form>

                    <div className="mt-6 pt-4 border-t-2 border-black/20 text-center">
                        <p className="font-pixel text-[10px] text-gray-400 mb-3">
                            Ainda não tem conta?
                        </p>
                        <Link href="/register">
                            <Button variant="secondary" className="w-full">
                                Criar Conta
                            </Button>
                        </Link>
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
