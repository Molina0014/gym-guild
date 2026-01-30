"use client";

import { NavBar } from "@/components/layout/nav-bar";
import { Header } from "@/components/layout/header";
import { useCharacter } from "@/hooks/use-character";

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const { character } = useCharacter();

    return (
        <div className="min-h-screen bg-[#1a1a2e]">
            <Header character={character} />

            <main className="pt-14 pb-20 min-h-screen">
                <div className="max-w-lg mx-auto px-4 py-4">{children}</div>
            </main>

            <NavBar />
        </div>
    );
}
