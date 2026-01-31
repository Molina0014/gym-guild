"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Swords, Shield, KeyRound, Check } from "lucide-react";

export default function ResetPasswordPage() {
    const router = useRouter();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const supabase = createClient();

    // Check if user has a valid session from the reset link
    useEffect(() => {
        const checkSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                // No session means the reset link is invalid or expired
                router.push("/forgot-password");
            }
        };
        checkSession();
    }, [supabase, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        if (password !== confirmPassword) {
            setError("As senhas não coincidem");
            setIsLoading(false);
            return;
        }

        if (password.length < 6) {
            setError("A senha deve ter pelo menos 6 caracteres");
            setIsLoading(false);
            return;
        }

        try {
            const { error } = await supabase.auth.updateUser({
                password,
            });

            if (error) {
                setError(error.message);
                return;
            }

            setSuccess(true);
            setTimeout(() => {
                router.push("/home");
            }, 2000);
        } catch {
            setError("Erro ao redefinir senha. Tente novamente.");
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#1a1a2e]">
                <Card className="w-full max-w-sm">
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-secondary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Check className="w-8 h-8 text-white" />
                            </div>
                            <h2 className="font-pixel text-sm text-secondary-500 mb-2">
                                Senha Redefinida!
                            </h2>
                            <p className="font-pixel text-[10px] text-gray-400">
                                Redirecionando para a guilda...
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

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
            </div>

            {/* Reset Password Card */}
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-center flex items-center justify-center gap-2">
                        <KeyRound className="w-4 h-4 text-secondary-500" />
                        Nova Senha
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="font-pixel text-[10px] text-gray-400 text-center mb-4">
                        Digite sua nova senha abaixo.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            type="password"
                            label="Nova Senha"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={isLoading}
                            minLength={6}
                        />

                        <Input
                            type="password"
                            label="Confirmar Nova Senha"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
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
                            variant="secondary"
                            className="w-full"
                            isLoading={isLoading}
                        >
                            <KeyRound className="w-4 h-4 mr-2" />
                            Redefinir Senha
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
