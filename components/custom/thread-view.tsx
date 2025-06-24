import { X, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Chat } from "./chat";
import { Message } from "ai";
import { useState } from "react";

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
  const [isParentMessageExpanded, setIsParentMessageExpanded] =
    useState(true);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div
      className={`flex flex-col bg-white border-l h-full max-h-full overflow-hidden ${className}`}
    >
      {/* Thread Header */}
      <div className="border-b px-4 py-3 flex items-center justify-between flex-shrink-0">
        <h2 className="font-semibold">Thread</h2>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Parent Message Header */}
      <div
        className="border-b bg-gray-50 p-4 flex items-center justify-between cursor-pointer flex-shrink-0"
        onClick={() => setIsParentMessageExpanded(!isParentMessageExpanded)}
      >
        <span className="font-semibold text-sm">Original Message</span>
        {isParentMessageExpanded ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </div>

      {/* Parent Message Content */}
      {isParentMessageExpanded && (
        <div className="border-b bg-gray-50 p-4 max-h-48 overflow-y-auto flex-shrink-0">
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
        </div>
      )}

      {/* Separator */}
      <div className="h-px bg-gray-200 w-full flex-shrink-0"></div>

      {/* Thread Chat */}
      <div className="min-h-0 flex-grow">
        <Chat
          id={threadId}
          initialMessages={[]}
          isThread={true}
          parentMessageId={parentMessage.id}
          mainChatId={mainChatId}
          className="h-full max-h-full flex flex-col"
        />
      </div>
    </div>
  );
}
