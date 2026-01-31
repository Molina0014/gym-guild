"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Swords, Shield, Sparkles, UserPlus } from "lucide-react";

export default function RegisterPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const supabase = createClient();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        // Validate passwords match
        if (password !== confirmPassword) {
            setError("As senhas não coincidem");
            setIsLoading(false);
            return;
        }

        // Validate password length
        if (password.length < 6) {
            setError("A senha deve ter pelo menos 6 caracteres");
            setIsLoading(false);
            return;
        }

        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: `${window.location.origin}/auth/callback`,
                },
            });

            if (error) {
                if (error.message.includes("already registered")) {
                    setError("Este email já está cadastrado");
                } else {
                    setError(error.message);
                }
                return;
            }

            if (data.user) {
                // If email confirmation is disabled, user is logged in immediately
                if (data.session) {
                    router.push("/onboarding");
                } else {
                    // Email confirmation is required
                    setError(
                        "Verifique seu email para confirmar o cadastro. Depois volte e faça login.",
                    );
                }
            }
        } catch {
            setError("Erro ao criar conta. Tente novamente.");
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
                    Junte-se à guilda dos campeões
                </p>
            </div>

            {/* Register Card */}
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-center flex items-center justify-center gap-2">
                        <Sparkles className="w-4 h-4 text-secondary-500" />
                        Criar Conta
                        <Sparkles className="w-4 h-4 text-secondary-500" />
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleRegister} className="space-y-4">
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

                        <Input
                            type="password"
                            label="Confirmar Senha"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            disabled={isLoading}
                            minLength={6}
                        />

                        {error && (
                            <div
                                className={`p-3 border-2 border-black font-pixel text-[10px] text-center ${
                                    error.includes("Verifique")
                                        ? "bg-secondary-100 text-secondary-800"
                                        : "bg-red-100 text-red-800"
                                }`}
                            >
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            variant="secondary"
                            className="w-full"
                            isLoading={isLoading}
                        >
                            <UserPlus className="w-4 h-4 mr-2" />
                            Criar Conta
                        </Button>
                    </form>

                    <div className="mt-6 pt-4 border-t-2 border-black/20 text-center">
                        <p className="font-pixel text-[10px] text-gray-400 mb-3">
                            Já tem uma conta?
                        </p>
                        <Link href="/login">
                            <Button variant="ghost" className="w-full">
                                Fazer Login
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
