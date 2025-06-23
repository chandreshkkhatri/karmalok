import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare, ChevronRight } from "lucide-react";

interface ReplyLinkProps {
  messageId: string;
  chatId: string;
  onStartThread: (messageId: string) => void;
  onViewThread?: (threadId: string) => void;
}

export function ReplyLink({
  messageId,
  chatId,
  onStartThread,
  onViewThread,
}: ReplyLinkProps) {
  const [threadCount, setThreadCount] = useState(0);
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
          setThreadCount(data.count);
        }
      } catch (error) {
        console.error("Failed to fetch thread count:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchThreadCount();
  }, [messageId, chatId]);

  return (
    <div className="flex items-center gap-2 mt-2">
      <Button
        variant="ghost"
        size="sm"
        className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
        onClick={() => onStartThread(messageId)}
      >
        <MessageSquare className="w-3 h-3 mr-1" />
        Reply
      </Button>

      {threadCount > 0 && (
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
          onClick={() => onViewThread?.(messageId)}
        >
          <ChevronRight className="w-3 h-3 mr-1" />
          {isLoading
            ? "..."
            : `${threadCount} ${threadCount === 1 ? "reply" : "replies"}`}
        </Button>
      )}
    </div>
  );
}
