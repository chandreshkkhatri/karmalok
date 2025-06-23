import { useState } from "react";
import { X, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Chat } from "./chat";
import { Message } from "ai";
import { useRouter } from "next/navigation";

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
  const router = useRouter();

  const handleBackToMainChat = () => {
    router.push(`/chat/${mainChatId}`);
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToMainChat}
            className="h-8 w-8 p-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h3 className="font-medium">Thread</h3>
            <p className="text-sm text-muted-foreground">Reply to message</p>
          </div>
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
          <div className="text-sm">
            {typeof parentMessage.content === "string"
              ? parentMessage.content
              : JSON.stringify(parentMessage.content)}
          </div>
        </div>
      </div>

      {/* Thread Chat */}
      <div className="flex-1 overflow-hidden">
        <Chat
          id={threadId}
          initialMessages={[]}
          isThread={true}
          parentMessageId={parentMessage.id}
          mainChatId={mainChatId}
        />
      </div>
    </div>
  );
}
