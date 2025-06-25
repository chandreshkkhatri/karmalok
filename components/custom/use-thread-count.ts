import useSWR from "swr";

const fetcher = async (url: string) => {
  const res = await fetch(url, { credentials: "include" });

  if (!res.ok) {
    const error = new Error("Failed to fetch thread count");
    try {
      (error as any).info = await res.json();
    } catch (e) {
      // res.json() will fail if the body is not valid JSON.
    }
    (error as any).status = res.status;
    throw error;
  }

  const data = await res.json();
  return data.count || 0;
};

export function useThreadCount(messageId: string, chatId: string) {
  const {
    data: threadCount,
    isLoading,
    mutate,
  } = useSWR(
    `/api/threads/count?parentMessageId=${messageId}&mainChatId=${chatId}`,
    fetcher,
    {
      fallbackData: 0,
      revalidateOnFocus: false,
    }
  );

  return { threadCount: threadCount ?? 0, isLoading, refresh: mutate };
}
