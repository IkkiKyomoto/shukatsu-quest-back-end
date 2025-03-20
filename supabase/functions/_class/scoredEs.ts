import Es from "./es.ts";
import ScoredCategory from "./scoredCategory.ts";

export default class ScoredEs extends Es {
    categories: ScoredCategory[];
    allScore: number;
    allFullScore: number;
    correction: string;
    correctionComment: string;
    comment: string;
    constructor(
        es: Es,
        categories: ScoredCategory[],
        correction: string,
        correctionComment: string,
        comment: string,
    ) {
        super(es.theme, es.answer, es.length, es.userId, es.questId);
        this.categories = categories;
        this.allScore = categories.reduce(
            (sum, element) => sum + element.score,
            0,
        );
        this.allFullScore = categories.reduce(
            (sum, element) => sum + element.fullScore,
            0,
        );
        this.correction = correction;
        this.comment = comment;
        this.correctionComment = correctionComment;
    }
    writeAsMap(): Map<string, string> {
        const map = new Map<string, string>();
        map.set("theme", this.theme);
        map.set("answer", this.answer);
        map.set("length", this.length.toString());
        map.set("user_id", this.userId);
        map.set("quest_id", this.questId);
        map.set(
            "categories",
            this.categories.map((category) => category.writeAsStr()).join(""),
        );
        map.set("all_score", this.allScore.toString());
        map.set("all_full_score", this.allFullScore.toString());
        map.set("correction", this.correction);
        map.set("correction_comment", this.correctionComment);
        map.set("comment", this.comment);
        return map;
    }
}
