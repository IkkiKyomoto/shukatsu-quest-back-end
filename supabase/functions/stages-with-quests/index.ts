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

Deno.serve(async (req) => {
    const method = req.method;

    try {
        if (method === "GET") {
            // データベースからステージとクエストを取得
            // ステージとクエストをそれぞれのnumber順に取得

            const { data, error } = await supabase.from("stages").select(
                "id, name, number, quests(id, name, number, base_exp, type)",
            ).order("number");
            if (error) {
                return handleError(error.message, 500);
            }
            // ステージとクエストを整形
            if (data.length === 0) {
                return new Response(
                    JSON.stringify(
                        [],
                    ),
                    { headers: { "Content-Type": "application/json" } },
                );
            }
            // クエストをnumber順にソート
            data.forEach((stage: { quests: any[] }) => {
                stage.quests.sort((
                    a: { number: number },
                    b: { number: number },
                ) => a.number - b.number);
            });
            return new Response(
                JSON.stringify(data),
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
