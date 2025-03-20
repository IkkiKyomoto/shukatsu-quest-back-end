import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { handleError } from "../_shared/handleError.ts";
import Es from "../_class/es.ts";
import { scoreEs } from "../_shared/scoreEs.ts";
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
    const url = new URL(req.url);
    const pathList = url.pathname.split("/");
    const userId = pathList[pathList.length - 1];
    const questId = pathList[pathList.length - 3];
    const requestBody = await req.json();
    if (!userId || !questId) {
        return handleError("User ID and Quest ID are required", 400);
    }
    try {
        if (method === "POST") {
            // データベースから、クエストのタイプがESかどうかを確認
            const { data: questData, error: questError } = await supabase.from(
                "quests",
            ).select("type")
                .eq("id", questId);
            if (questError) {
                return handleError(questError.message, 500);
            }
            if (questData.length === 0) {
                return handleError("Quest not found", 404);
            }
            if (questData[0].type !== "es") {
                return handleError("Quest type is not ES", 400);
            }
            // esを採点
            const es = new Es(
                requestBody.theme,
                requestBody.answer,
                requestBody.length,
                userId,
                questId,
            );
            const scoredEs = await scoreEs(es);
            // 採点済みのesをデータベースに送信
            const { data: scoredEsData, error: scoredEsError } = await supabase
                .from(
                    "es",
                ).insert({
                    user_id: userId,
                    quest_id: questId,
                    theme: scoredEs.theme,
                    answer: scoredEs.answer,
                    length: scoredEs.length,
                    correction: scoredEs.correction,
                    correction_comment: scoredEs.correctionComment,
                    comment: scoredEs.comment,
                }).select();
            if (scoredEsError) {
                return handleError(scoredEsError.message, 500);
            }
            scoredEs.id = scoredEsData[0].id;
            const { data: _, error: categoriesError } = await supabase
                .from("es_evaluations")
                .insert(
                    scoredEs.categories.map((category) => ({
                        es_id: scoredEs.id,
                        category: category.name,
                        score: category.score,
                        comment: category.comment,
                        full_score: category.fullScore,
                    })),
                );
            const { data: __, error: questDoneError } = await supabase
                .from("achievements")
                .insert(
                    {
                        user_id: userId,
                        quest_id: questId,
                    },
                );
            if (questDoneError) {
                return handleError(questDoneError.message, 500);
            }
            if (categoriesError) {
                return handleError(categoriesError.message, 500);
            }

            return new Response(
                JSON.stringify(scoredEs),
                {
                    headers: {
                        ...corsHeaders,
                        "Content-Type": "application/json",
                    },
                },
            );
            // 採点済みのesを返す
        } else {
            return handleError("Method not allowed", 405);
        }
    } catch (error) {
        console.error(error);
        return handleError("Internal server error", 500);
    }
});
