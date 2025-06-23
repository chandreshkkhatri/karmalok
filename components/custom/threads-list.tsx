import { useState, useEffect } from "react";
import { X, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface Thread {
  _id: string;
  messages: any[];
  createdAt: string;
  updatedAt: string;
}

interface ThreadsListProps {
  parentMessageId: string;
  mainChatId: string;
  parentMessage: any;
  onClose: () => void;
}

export function ThreadsList({
  parentMessageId,
  mainChatId,
  parentMessage,
  onClose,
}: ThreadsListProps) {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchThreads = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/threads?parentMessageId=${parentMessageId}&mainChatId=${mainChatId}`
        );
        if (response.ok) {
          const data = await response.json();
          setThreads(data.threads);
        }
      } catch (error) {
        console.error("Failed to fetch threads:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchThreads();
  }, [parentMessageId, mainChatId]);

  const handleThreadClick = (threadId: string) => {
    router.push(`/chat/${mainChatId}/thread/${threadId}`);
  };

  const handleStartNewThread = () => {
    const newThreadId = `thread_${Date.now()}`;
    router.push(
      `/chat/${mainChatId}/thread/${newThreadId}?parentMessageId=${parentMessageId}`
    );
  };

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-background border-l shadow-lg z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div>
          <h3 className="font-medium">Replies</h3>
          <p className="text-sm text-muted-foreground">
            {threads.length} {threads.length === 1 ? "reply" : "replies"}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Parent Message Context */}
      <div className="p-4 bg-muted/30 border-b">
        <div className="text-sm text-muted-foreground mb-2">
          Original message:
        </div>
        <div className="p-3 bg-background rounded-lg border">
          <div className="text-sm line-clamp-3">
            {typeof parentMessage.content === "string"
              ? parentMessage.content
              : JSON.stringify(parentMessage.content)}
          </div>
        </div>
      </div>

      {/* New Thread Button */}
      <div className="p-4 border-b">
        <Button onClick={handleStartNewThread} className="w-full" size="sm">
          <MessageSquare className="w-4 h-4 mr-2" />
          Start new thread
        </Button>
      </div>

      {/* Threads List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 text-center text-muted-foreground">
            Loading threads...
          </div>
        ) : threads.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            No replies yet. Start the first thread!
          </div>
        ) : (
          <div className="space-y-2 p-4">
            {threads.map((thread) => (
              <div
                key={thread._id}
                className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => handleThreadClick(thread._id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">
                    {thread.messages.length}{" "}
                    {thread.messages.length === 1 ? "message" : "messages"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(thread.updatedAt).toLocaleDateString()}
                  </span>
                </div>
                {thread.messages.length > 0 && (
                  <div className="text-sm text-muted-foreground line-clamp-2">
                    {typeof thread.messages[0].content === "string"
                      ? thread.messages[0].content
                      : JSON.stringify(thread.messages[0].content)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
