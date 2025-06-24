import { useState, useEffect } from "react";

export function useThreadCount(messageId: string, chatId: string) {
  const [threadCount, setThreadCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchThreadCount = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/threads/count?parentMessageId=${messageId}&mainChatId=${chatId}`
        );
        if (response.ok) {
          const data = await response.json();
          setThreadCount(data.count || 0);
        }
      } catch (error) {
        console.error("Failed to fetch thread count:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchThreadCount();
  }, [messageId, chatId]);

  return { threadCount, isLoading };
}
