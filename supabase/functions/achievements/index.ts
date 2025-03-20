import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { handleError } from "../_shared/handleError.ts";
import { corsHeaders } from "../_const/cors.ts";

const DATABASE_API_URL = Deno.env.get("DATABASE_API_URL");
const DATABASE_API_KEY = Deno.env.get("DATABASE_API_KEY");

if (!DATABASE_API_URL || !DATABASE_API_KEY) {
    const errorMessage = "DATABASE_API_URL and DATABASE_API_KEY must be set";
    console.error(errorMessage);
    throw new Error(errorMessage);
}

const supabase = createClient(DATABASE_API_URL, DATABASE_API_KEY);

type responseBody = {
    id: string;
    user_id: string;
    stage_id: string;
    quest_id: string;
    cleared_at: string;
}[];

Deno.serve(async (req) => {
    const url = new URL(req.url);
    const userId = url.pathname.split("/").pop();
    if (!userId) {
        return handleError("User ID is required", 400);
    }
    const method = req.method;

    try {
        if (method === "GET") {
            // データベースからユーザーの実績を取得
            const { data, error } = await supabase.from("achievements").select(
                "id, quests(stages(id)), quest_id ,user_id, cleared_at",
            ).order("cleared_at", { ascending: false }).eq("user_id", userId);
            if (error) {
                return handleError(error.message, 500);
            }
            if (data.length === 0) {
                return new Response(
                    JSON.stringify(
                        [],
                    ),
                    { headers: { "Content-Type": "application/json" } },
                );
            }
            // ユーザーの実績を整形
            const achievements: responseBody = data.map((a: any) => {
                return {
                    id: a.id,
                    user_id: a.user_id,
                    stage_id: a.quests.stages.id,
                    quest_id: a.quest_id,
                    cleared_at: a.cleared_at,
                };
            });
            return new Response(
                JSON.stringify(achievements),
                {
                    headers: {
                        ...corsHeaders,
                        "Content-Type": "application/json",
                    },
                },
            );
        } else {
            return handleError("Method not allowed", 405);
        }
    } catch (error) {
        return handleError("Internal server error", 500);
    }
});
