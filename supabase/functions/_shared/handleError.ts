// エラーメッセージを返す関数
export const handleError = (message: string, status: number) => {
    console.error(message);
    return new Response(
        JSON.stringify({ message }),
        {
            headers: { "Content-Type": "application/json" },
            status,
        },
    );
};
