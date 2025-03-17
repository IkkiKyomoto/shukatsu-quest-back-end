// エラーメッセージを返す関数

export const handleError = (message: string, status: number) => {
    const date = new Date();
    console.error(date.toISOString());
    console.error(message);
    return new Response(
        JSON.stringify({ message }),
        {
            headers: { "Content-Type": "application/json" },
            status,
        },
    );
};
