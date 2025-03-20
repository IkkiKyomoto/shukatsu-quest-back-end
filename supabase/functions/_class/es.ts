export default class Es {
    id?: string;
    theme: string;
    answer: string;
    length: number;
    userId: string;
    questId: string;
    constructor(
        theme: string,
        anser: string,
        length: number,
        userId: string,
        questId: string,
    ) {
        this.theme = theme;
        this.answer = anser;
        this.length = length;
        this.userId = userId;
        this.questId = questId;
    }
}
