// 採点区分ごとの点数とコメントを保持するクラス

import Category from "./category.ts";

type scoredCategoryType = {
    name: string;
    fullScore: number;
    score: number;
    comment: string;
};

export default class ScoredCategory extends Category {
    score: number;
    comment: string;
    constructor(
        name: string,
        fullScore: number,
        score: number,
        comment: string,
    ) {
        super(name, fullScore);
        this.score = score;
        this.comment = comment;
    }
    static override fromObject(obj: scoredCategoryType): ScoredCategory {
        return new ScoredCategory(
            obj.name,
            obj.fullScore,
            obj.score,
            obj.comment,
        );
    }
}
