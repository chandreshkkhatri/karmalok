import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Chat } from "./chat";
import { Message } from "ai";

interface ThreadViewProps {
  threadId: string;
  parentMessage: Message;
  mainChatId: string;
  onClose: () => void;
  className?: string;
}

export function ThreadView({
  threadId,
  parentMessage,
  mainChatId,
  onClose,
  className = "",
}: ThreadViewProps) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };
  return (
    <div
      className={`grid grid-rows-[auto_auto_1fr] bg-white border-l h-full max-h-full overflow-hidden ${className}`}
    >
      {/* Thread Header */}
      <div className="border-b px-4 py-3 flex items-center justify-between">
        <h2 className="font-semibold">Thread</h2>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>
      {/* Parent Message */}
      <div className="border-b bg-gray-50 p-4 max-h-48 overflow-y-auto">
        <div className="flex items-start space-x-3">
          <Avatar className="w-8 h-8 flex-shrink-0">
            <AvatarFallback>
              {parentMessage.role === "user" ? "U" : "A"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <span className="font-semibold">
                {parentMessage.role === "user" ? "You" : "Assistant"}
              </span>
              <span className="text-xs text-gray-500">
                {formatTime(parentMessage.createdAt || new Date())}
              </span>
            </div>
            <div className="text-sm text-gray-900 whitespace-pre-wrap mt-1">
              {typeof parentMessage.content === "string"
                ? parentMessage.content
                : JSON.stringify(parentMessage.content)}
            </div>
          </div>
        </div>
      </div>{" "}
      {/* Thread Chat */}
      <div className="min-h-0 overflow-hidden">
        <Chat
          id={threadId}
          initialMessages={[]}
          isThread={true}
          parentMessageId={parentMessage.id}
          mainChatId={mainChatId}
          className="h-full max-h-full flex flex-col overflow-hidden"
        />
      </div>
    </div>
  );
}
