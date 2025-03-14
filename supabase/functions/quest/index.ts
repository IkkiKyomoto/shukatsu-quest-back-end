import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { handleError } from "../_shared/handleError.ts";

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
    const url = new URL(req.url);
    const pathList = url.pathname.split("/");
    const userId = pathList[pathList.length - 1];
    const questId = pathList[pathList.length - 3];
    if (!userId || !questId) {
        return handleError("User ID and Quest ID are required", 400);
    }

    try {
        if (method === "POST") {
            // データベースからステージとクエストを取得
            const { data, error } = await supabase.from("achievements").insert([
                {
                    user_id: userId,
                    quest_id: questId,
                    cleared_at: new Date().toISOString(),
                },
            ]);
            if (error) {
                return handleError(error.message, 500);
            }
            return new Response(
                JSON.stringify({
                    message: "Success!",
                }),
                {
                    headers: { "Content-Type": "application/json" },
                    status: 201,
                },
            );
        } else {
            return handleError("Method not allowed", 405);
        }
    } catch (error) {
        return handleError("Internal server error", 500);
    }
});
