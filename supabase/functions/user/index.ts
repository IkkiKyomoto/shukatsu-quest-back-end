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
    const url = new URL(req.url);
    const method = req.method;
    const userId = url.pathname.split("/").pop();
    if (!userId) {
        return handleError("User ID is required", 400);
    }

    try {
        if (method === "GET") {
            const { data, error } = await supabase
                .from("users")
                .select("id, name, lv, exp")
                .eq("id", userId);
            if (error) {
                return handleError(error.message, 500);
            }
            if (data.length === 0) {
                return handleError("User not found", 404);
            }
            return new Response(
                JSON.stringify(data[0]),
                { headers: { "Content-Type": "application/json" } },
            );
        } else {
            return handleError("Method not allowed", 405);
        }
    } catch (error) {
        return handleError("Internal server error", 500);
    }
});
