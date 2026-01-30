"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Character } from "@/types/database";

export function useCharacter() {
    const [character, setCharacter] = useState<Character | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const supabase = createClient();

    const fetchCharacter = async () => {
        try {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) {
                setCharacter(null);
                return;
            }

            const { data, error: fetchError } = await supabase
                .from("characters")
                .select("*")
                .eq("user_id", user.id)
                .single();

            if (fetchError && fetchError.code !== "PGRST116") {
                setError(fetchError.message);
                return;
            }

            setCharacter(data);
        } catch (err) {
            setError("Erro ao carregar personagem");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCharacter();

        // Subscribe to changes
        const channel = supabase
            .channel("character-changes")
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "characters",
                },
                (payload: any) => {
                    if (payload.new) {
                        setCharacter(payload.new as Character);
                    }
                },
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    return { character, isLoading, error, refetch: fetchCharacter };
}
