import { Button } from "@/components/ui/button";
import { MessageSquare, ChevronRight } from "lucide-react";
import { useThreadCount } from "./use-thread-count";

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
  const { threadCount, isLoading } = useThreadCount(messageId, chatId);

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
