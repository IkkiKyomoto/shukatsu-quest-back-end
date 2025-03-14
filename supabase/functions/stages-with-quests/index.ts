import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const DATABASE_API_URL = Deno.env.get("DATABASE_API_URL");
const DATABASE_API_KEY = Deno.env.get("DATABASE_API_KEY");

if (!DATABASE_API_URL || !DATABASE_API_KEY) {
    const errorMessage = "DATABASE_API_URL and DATABASE_API_KEY must be set";
    console.error(errorMessage);
    throw new Error(errorMessage);
}

const supabase = createClient(DATABASE_API_URL, DATABASE_API_KEY);

const handleError = (message: string, status: number) => {
    console.error(message);
    return new Response(
        JSON.stringify({ message }),
        {
            headers: { "Content-Type": "application/json" },
            status,
        },
    );
};

Deno.serve(async (req) => {
    const method = req.method;

    try {
        if (method === "GET") {
            const { data, error } = await supabase.from("stages").select(
                "id, name, number, quests(id, name, number, base_exp, type)",
            );
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
            return new Response(
                JSON.stringify(data),
                { headers: { "Content-Type": "application/json" } },
            );
        } else {
            return handleError("Method not allowed", 405);
        }
    } catch (error) {
        return handleError("Internal server error", 500);
    }
});
