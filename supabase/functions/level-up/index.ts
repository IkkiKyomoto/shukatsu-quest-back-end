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
    const userId = new URL(req.url).pathname.split("/").pop();
    const reqBody = await req.json();
    const level: number = reqBody.level;
    const exp: number = reqBody.exp;
    try {
        if (method === "POST") {
            // データベースからステージとクエストを取得
            const { data, error } = await supabase.from("users").update({
                lv: level,
                exp: exp,
            }).eq("id", userId);
            if (error) {
                return handleError(error.message, 500);
            }
            return new Response(
                JSON.stringify({
                    message: "Success!",
                }),
                {
                    headers: {
                        ...corsHeaders,
                        "Content-Type": "application/json",
                    },
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
