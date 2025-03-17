// 採点区分クラス
type categoryType = {
    name: string;
    fullScore: number;
};

export default class Category {
    name: string;
    fullScore: number;
    constructor(
        name: string,
        fullScore: number,
    ) {
        this.name = name;
        this.fullScore = fullScore;
    }
    static fromObject(obj: categoryType): Category {
        return new Category(obj.name, obj.fullScore);
    }
    writeAsStr(): string {
        return `{採点区分名：${this.name}, 満点：${this.fullScore}}, `;
    }
}
