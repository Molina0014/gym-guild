import Link from "next/link";
import { Swords, Shield, Scroll, Users, Flame } from "lucide-react";

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-[#1a1a2e] flex flex-col">
            {/* Hero Section */}
            <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                {/* Logo */}
                <div className="flex items-center justify-center gap-2 mb-6">
                    <Shield className="w-10 h-10 text-primary-400" />
                    <Swords className="w-14 h-14 text-primary-500" />
                    <Shield className="w-10 h-10 text-primary-400" />
                </div>

                <h1 className="font-pixel text-2xl text-primary-400 mb-3">
                    GYM GUILD
                </h1>

                <p className="font-pixel text-[10px] text-gray-400 mb-8 max-w-xs">
                    Transforme seus treinos em aventuras épicas.
                    <br />
                    Una-se à guilda e conquiste seus objetivos!
                </p>

                {/* Features */}
                <div className="grid grid-cols-2 gap-4 mb-8 max-w-sm w-full">
                    <div className="p-4 bg-parchment-dark border-pixel border-primary-700">
                        <Scroll className="w-6 h-6 text-primary-400 mx-auto mb-2" />
                        <p className="font-pixel text-[8px] text-gray-300">
                            Crie Quests
                        </p>
                    </div>
                    <div className="p-4 bg-parchment-dark border-pixel border-primary-700">
                        <Flame className="w-6 h-6 text-health mx-auto mb-2" />
                        <p className="font-pixel text-[8px] text-gray-300">
                            Derrote Bosses
                        </p>
                    </div>
                    <div className="p-4 bg-parchment-dark border-pixel border-primary-700">
                        <Users className="w-6 h-6 text-secondary-400 mx-auto mb-2" />
                        <p className="font-pixel text-[8px] text-gray-300">
                            Chat da Guilda
                        </p>
                    </div>
                    <div className="p-4 bg-parchment-dark border-pixel border-primary-700">
                        <Shield className="w-6 h-6 text-accent-400 mx-auto mb-2" />
                        <p className="font-pixel text-[8px] text-gray-300">
                            Evolua seu Herói
                        </p>
                    </div>
                </div>

                {/* CTA */}
                <Link
                    href="/login"
                    className="inline-flex items-center justify-center gap-2 px-8 py-3 font-pixel text-sm uppercase tracking-wider bg-primary-500 text-white border-pixel border-black shadow-pixel hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-pixel-sm active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all"
                >
                    Entrar na Guilda
                </Link>
            </main>

            {/* Footer */}
            <footer className="p-4 text-center">
                <p className="font-pixel text-[8px] text-gray-600">
                    Feito com ❤️ para a comunidade
                </p>
            </footer>
        </div>
    );
}
