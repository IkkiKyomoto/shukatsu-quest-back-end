import Es from "../_class/es.ts";
import { ChatGoogleGenerativeAI } from "npm:@langchain/google-genai";
// import scoring from "../../json/scoring.json" assert { type: "json" };
import { z } from "npm:zod";
import Category from "../_class/category.ts";
import ScoredEs from "../_class/scoredEs.ts";
import ScoredCategory from "../_class/scoredCategory.ts";

const scoring = {
    categories: [
        {
            name: "論理性",
            description: "論理的に首尾一貫した内容になっているか",
            fullScore: 20,
        },
        {
            name: "文章構成力",
            description: "わかりやすく適切な日本語表現が使われているか",
            fullScore: 20,
        },
        {
            name: "具体性と説得力",
            description: "具体的な事例や根拠を示し、説得力があるか",
            fullScore: 20,
        },
        {
            name: "熱意と意欲",
            description: "テーマに対して熱意や意欲が感じられるか",
            fullScore: 20,
        },
        {
            name: "独自性",
            description: "他の人と差別化できる独自性があるか",
            fullScore: 20,
        },
    ],
};

type llmOutput = {
    comment: string;
    correction: string;
    correctionComment: string;
    categories: {
        score: number;
        comment: string;
    }[];
};

const apiKey = Deno.env.get("GEMINI_API_KEY");
const model = Deno.env.get("GEMINI_MODEL");
if (!apiKey || !model) {
    throw new Error("GEMINI_API_KEY and GEMINI_MODEL must be set");
}

export const scoreEs = async (es: Es) => {
    // 採点区分を取得
    const categories = scoring.categories.map((category) =>
        Category.fromObject(category)
    );

    // LLMを初期化
    const llm = new ChatGoogleGenerativeAI(
        {
            model: model,
            apiKey: apiKey,
            temperature: 0,
        },
    );

    // 出力スキーマ
    const outputSchema = z.object({
        comment: z.string().describe("全体についてのコメント"),
        correction: z.string().describe("添削結果"),
        correctionComment: z.string().describe("添削についてのコメント"),
        categories: z.array(
            z.object({
                score: z.number().describe("点数"),
                comment: z.string().describe("コメント"),
            }),
        ).describe(
            `採点区分ごとの点数とそれぞれについてのコメントを出力。採点区分は次の通り。出力は提示された順番に行う。${
                categories.map((category) => category.writeAsStr()).join("")
            }`,
        ),
    }).describe("採点結果");
    // LLMを実行
    const structuredLlm = llm.withStructuredOutput(outputSchema, {
        name: "scoreEs",
    });
    const result = await structuredLlm.invoke(
        `次のESを採点し、指定された形式に則って採点・コメントを返してください。なお、コメントは日本語で記述してください。テーマ：${es.theme}、回答：${es.answer}、文字数：${es.length}`,
    ) as llmOutput;

    // 採点結果をScoredEsクラスに変換
    const scoredEs = new ScoredEs(
        es,
        result.categories.map((category, index) =>
            new ScoredCategory(
                categories[index].name,
                categories[index].fullScore,
                category.score,
                category.comment,
            )
        ),
        result.correction,
        result.correctionComment,
        result.comment,
    );
    return scoredEs;

    // 採点
};
