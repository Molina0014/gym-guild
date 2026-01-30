"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ChatMessage, Profile, Character } from "@/types/database";

export interface ChatMessageWithSender extends ChatMessage {
    sender?: {
        profile: Profile | null;
        character: Character | null;
    };
}

export function useRealtimeChat() {
    const [messages, setMessages] = useState<ChatMessageWithSender[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const supabase = createClient();

    // Fetch initial messages
    const fetchMessages = useCallback(async () => {
        const { data: messagesData } = await supabase
            .from("chat_messages")
            .select("*")
            .order("created_at", { ascending: true })
            .limit(100);

        if (!messagesData) {
            setIsLoading(false);
            return;
        }

        // Fetch sender info for each message
        const senderIds = [
            ...new Set(
                (messagesData as any[])
                    .map((m: any) => m.sender_id)
                    .filter(Boolean),
            ),
        ];

        const { data: profiles } = await supabase
            .from("profiles")
            .select("*")
            .in("id", senderIds);

        const { data: characters } = await supabase
            .from("characters")
            .select("*")
            .in("user_id", senderIds);

        const messagesWithSenders = (messagesData as any[]).map((msg: any) => ({
            ...msg,
            sender: msg.sender_id
                ? {
                      profile:
                          (profiles as any[])?.find(
                              (p: any) => p.id === msg.sender_id,
                          ) || null,
                      character:
                          (characters as any[])?.find(
                              (c: any) => c.user_id === msg.sender_id,
                          ) || null,
                  }
                : undefined,
        }));

        setMessages(messagesWithSenders);
        setIsLoading(false);
    }, []);

    // Subscribe to realtime updates
    useEffect(() => {
        fetchMessages();

        const channel = supabase
            .channel("chat-messages")
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "chat_messages",
                },
                async (payload: any) => {
                    const newMessage = payload.new as ChatMessage;

                    // Fetch sender info
                    let sender = undefined;
                    if (newMessage.sender_id) {
                        const { data: profile } = await supabase
                            .from("profiles")
                            .select("*")
                            .eq("id", newMessage.sender_id)
                            .single();

                        const { data: character } = await supabase
                            .from("characters")
                            .select("*")
                            .eq("user_id", newMessage.sender_id)
                            .single();

                        sender = { profile, character };
                    }

                    setMessages((prev) => [...prev, { ...newMessage, sender }]);
                },
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [fetchMessages]);

    // Send message
    const sendMessage = async (
        content: string,
        messageType: "text" | "image" | "energy" = "text",
        imageUrl?: string,
        metadata?: Record<string, unknown>,
    ) => {
        const {
            data: { user },
        } = await supabase.auth.getUser();
        if (!user) return { error: "Not authenticated" };

        const { error } = await supabase.from("chat_messages").insert({
            sender_id: user.id,
            content,
            message_type: messageType,
            image_url: imageUrl,
            metadata: metadata || {},
        });

        return { error };
    };

    return { messages, isLoading, sendMessage, refetch: fetchMessages };
}
