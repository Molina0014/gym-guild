"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Swords, Shield, KeyRound, ArrowLeft, Mail } from "lucide-react";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{
        type: "success" | "error";
        text: string;
    } | null>(null);
    const supabase = createClient();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });

            if (error) {
                setMessage({ type: "error", text: error.message });
                return;
            }

            setMessage({
                type: "success",
                text: "Email enviado! Verifique sua caixa de entrada para redefinir sua senha.",
            });
            setEmail("");
        } catch {
            setMessage({
                type: "error",
                text: "Erro ao enviar email. Tente novamente.",
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
            </div>

            {/* Forgot Password Card */}
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-center flex items-center justify-center gap-2">
                        <KeyRound className="w-4 h-4 text-primary-500" />
                        Recuperar Senha
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="font-pixel text-[10px] text-gray-400 text-center mb-4">
                        Digite seu email e enviaremos um link para redefinir sua senha.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            type="email"
                            label="Email"
                            placeholder="aventureiro@guild.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={isLoading}
                        />

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

                        <Button
                            type="submit"
                            variant="primary"
                            className="w-full"
                            isLoading={isLoading}
                        >
                            <Mail className="w-4 h-4 mr-2" />
                            Enviar Link
                        </Button>
                    </form>

                    <div className="mt-6 pt-4 border-t-2 border-black/20 text-center">
                        <Link href="/login">
                            <Button variant="ghost" className="w-full">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Voltar ao Login
                            </Button>
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
