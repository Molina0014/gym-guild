"use client";

import { useState, useRef, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useCharacter } from "@/hooks/use-character";
import {
    useRealtimeChat,
    type ChatMessageWithSender,
} from "@/hooks/use-realtime-chat";
import { Button } from "@/components/ui/button";
import { AvatarDisplay } from "@/components/character/avatar-display";
import { cn } from "@/lib/utils/cn";
import { Send, Image as ImageIcon, Zap, MessageCircle, X } from "lucide-react";

const ENERGY_EMOJIS = ["⚡", "🔥", "💪", "✨", "🌟", "💫"];

export default function ChatPage() {
    const { character } = useCharacter();
    const { messages, isLoading, sendMessage } = useRealtimeChat();
    const [inputText, setInputText] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [showEnergyPicker, setShowEnergyPicker] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const supabase = createClient();

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = async () => {
        if (!inputText.trim() || isSending) return;

        setIsSending(true);
        await sendMessage(inputText.trim());
        setInputText("");
        setIsSending(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleImageUpload = async (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsSending(true);

        try {
            const fileExt = file.name.split(".").pop();
            const fileName = `chat-${Date.now()}.${fileExt}`;

            const { data: uploadData, error: uploadError } =
                await supabase.storage
                    .from("chat-images")
                    .upload(fileName, file);

            if (uploadError) throw uploadError;

            const {
                data: { publicUrl },
            } = supabase.storage
                .from("chat-images")
                .getPublicUrl(uploadData.path);

            await sendMessage("", "image", publicUrl);
        } catch (error) {
            console.error("Error uploading image:", error);
        } finally {
            setIsSending(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleSendEnergy = async (emoji: string) => {
        await sendMessage(emoji, "energy", undefined, { energy: emoji });
        setShowEnergyPicker(false);
    };

    const formatTime = (date: string) => {
        return new Date(date).toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <p className="font-pixel text-sm text-gray-400 animate-pulse">
                    Carregando...
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)]">
            {/* Header */}
            <div className="flex items-center gap-2 pb-3 border-b border-gray-700">
                <MessageCircle className="w-5 h-5 text-primary-500" />
                <h1 className="font-pixel text-sm text-foreground">
                    Chat da Guilda
                </h1>
                <span className="font-pixel text-[8px] text-gray-500">
                    {messages.length} mensagens
                </span>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto py-4 space-y-3">
                {messages.length === 0 ? (
                    <div className="text-center py-8">
                        <MessageCircle className="w-10 h-10 mx-auto text-gray-600 mb-3" />
                        <p className="font-pixel text-[10px] text-gray-500">
                            Nenhuma mensagem ainda.
                            <br />
                            Seja o primeiro a falar!
                        </p>
                    </div>
                ) : (
                    messages.map((msg) => (
                        <MessageBubble
                            key={msg.id}
                            message={msg}
                            isOwn={msg.sender_id === character?.user_id}
                        />
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Energy Picker */}
            {showEnergyPicker && (
                <div className="absolute bottom-24 left-4 right-4 p-3 bg-parchment border-pixel border-black shadow-pixel">
                    <div className="flex items-center justify-between mb-2">
                        <span className="font-pixel text-[10px] text-gray-900">
                            Enviar Energia
                        </span>
                        <button onClick={() => setShowEnergyPicker(false)}>
                            <X className="w-4 h-4 text-gray-600" />
                        </button>
                    </div>
                    <div className="flex gap-2 justify-center">
                        {ENERGY_EMOJIS.map((emoji) => (
                            <button
                                key={emoji}
                                onClick={() => handleSendEnergy(emoji)}
                                className="w-10 h-10 text-xl bg-white border-2 border-black shadow-pixel hover:shadow-pixel-sm hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Input */}
            <div className="pt-3 border-t border-gray-700">
                <div className="flex gap-2">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                    />

                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 text-gray-400 hover:text-foreground transition-colors"
                        disabled={isSending}
                    >
                        <ImageIcon className="w-5 h-5" />
                    </button>

                    <button
                        onClick={() => setShowEnergyPicker(!showEnergyPicker)}
                        className={cn(
                            "p-2 transition-colors",
                            showEnergyPicker
                                ? "text-xp"
                                : "text-gray-400 hover:text-foreground",
                        )}
                    >
                        <Zap className="w-5 h-5" />
                    </button>

                    <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Digite sua mensagem..."
                        className="flex-1 px-3 py-2 font-pixel text-[10px] bg-gray-800 text-foreground border-2 border-gray-600 focus:border-primary-500 focus:outline-none"
                        disabled={isSending}
                    />

                    <Button
                        variant="primary"
                        size="sm"
                        onClick={handleSend}
                        disabled={!inputText.trim() || isSending}
                        isLoading={isSending}
                    >
                        <Send className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}

function MessageBubble({
    message,
    isOwn,
}: {
    message: ChatMessageWithSender;
    isOwn: boolean;
}) {
    const formatTime = (date: string) => {
        return new Date(date).toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    // Energy message
    if (message.message_type === "energy") {
        return (
            <div className="text-center py-2">
                <span className="inline-block px-3 py-1 bg-xp/20 border border-xp rounded font-pixel text-[10px]">
                    <span className="text-lg mr-1">{message.content}</span>
                    <span className="text-xp">
                        {message.sender?.character?.name || "Alguém"} enviou
                        energia!
                    </span>
                </span>
            </div>
        );
    }

    // System message
    if (
        message.message_type === "system" ||
        message.message_type === "achievement"
    ) {
        return (
            <div className="text-center py-2">
                <span className="inline-block px-3 py-1 bg-gray-700 rounded font-pixel text-[8px] text-gray-300">
                    {message.content}
                </span>
            </div>
        );
    }

    return (
        <div className={cn("flex gap-2", isOwn && "flex-row-reverse")}>
            {/* Avatar */}
            {message.sender?.character ? (
                <AvatarDisplay character={message.sender.character} size="sm" />
            ) : (
                <div className="w-10 h-10 bg-gray-600 border-2 border-black" />
            )}

            {/* Content */}
            <div className={cn("max-w-[70%]", isOwn && "text-right")}>
                <div className="flex items-center gap-2 mb-1">
                    <span
                        className={cn(
                            "font-pixel text-[8px]",
                            isOwn ? "text-primary-400" : "text-gray-400",
                        )}
                    >
                        {message.sender?.character?.name || "Anônimo"}
                    </span>
                    <span className="font-pixel text-[6px] text-gray-600">
                        {formatTime(message.created_at)}
                    </span>
                </div>

                {message.message_type === "image" && message.image_url ? (
                    <img
                        src={message.image_url}
                        alt="Imagem"
                        className="max-w-full border-pixel border-black"
                    />
                ) : (
                    <div
                        className={cn(
                            "inline-block px-3 py-2 border-2 border-black",
                            isOwn
                                ? "bg-primary-500 text-white"
                                : "bg-parchment text-gray-900",
                        )}
                    >
                        <p className="font-pixel text-[10px] break-words">
                            {message.content}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
