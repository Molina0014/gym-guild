import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const N8N_WEBHOOK_URL =
    "https://nwh.falki.com.br/webhook/6d56672b-0efd-405a-a7ab-37d542e85ccc";

export async function POST(request: Request) {
    try {
        const {
            userId,
            email,
            name,
            style,
            race,
            characterClass,
            raceName,
            className,
            description,
        } = await request.json();

        // Validação básica
        if (!userId || !style || !race || !characterClass) {
            return NextResponse.json(
                {
                    error: "Missing required fields: userId, style, race, characterClass",
                },
                { status: 400 },
            );
        }

        // Gerar fileName único: {userId}/{timestamp}
        const timestamp = Date.now();
        const fileName = `${userId}/${timestamp}`;

        // Chamar webhook do n8n
        const response = await fetch(N8N_WEBHOOK_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                userId,
                fileName,
                email,
                name,
                race,
                characterClass,
                raceName,
                className,
                style,
                description: description || "",
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("n8n webhook error:", errorText);
            return NextResponse.json(
                { error: "Failed to generate avatar. Please try again." },
                { status: 500 },
            );
        }

        const data = await response.json();

        // O n8n deve retornar { success: true, avatarUrl: "..." }
        if (data.success && data.avatarUrl) {
            // Salvar no histórico de avatares
            const supabase = await createClient();

            // Desativar avatar anterior (se houver)
            await supabase
                .from("avatar_history")
                .update({ is_active: false })
                .eq("user_id", userId)
                .eq("is_active", true);

            // Inserir novo avatar como ativo
            const { error: historyError } = await supabase
                .from("avatar_history")
                .insert({
                    user_id: userId,
                    file_name: fileName,
                    avatar_url: data.avatarUrl,
                    style,
                    description: description || null,
                    is_active: true,
                });

            if (historyError) {
                console.error("Error saving avatar history:", historyError);
                // Não falhar a requisição, o avatar foi gerado com sucesso
            }

            return NextResponse.json({
                success: true,
                avatarUrl: data.avatarUrl,
                fileName,
            });
        }

        return NextResponse.json(
            { error: data.error || "Failed to generate avatar" },
            { status: 500 },
        );
    } catch (error: any) {
        console.error("Avatar generation error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to generate avatar" },
            { status: 500 },
        );
    }
}
