"use client";

import { Attachment, Message } from "ai";
import { useChat } from "ai/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquare, X, Send, Hash } from "lucide-react";

import { useScrollToBottom } from "@/components/custom/use-scroll-to-bottom";
import { useThreadCount } from "@/components/custom/use-thread-count";

import { ThreadView } from "./thread-view";

export function Chat({
  id,
  initialMessages,
  isThread = false,
  parentMessageId,
  mainChatId,
  className = "",
}: {
  id: string;
  initialMessages: Array<Message>;
  isThread?: boolean;
  parentMessageId?: string;
  mainChatId?: string;
  className?: string;
}) {
  const router = useRouter();
  const chatIdForSubmit = isThread ? mainChatId! : id;
  const { messages, handleSubmit, input, setInput, append, isLoading, stop } =
    useChat({
      id: chatIdForSubmit,
      body: {
        id: chatIdForSubmit,
        ...(isThread && { parentMessageId, mainChatId }),
      },
      initialMessages,
      maxSteps: 10,
      api: isThread ? "/api/thread" : "/api/chat",
      onFinish: () => {
        // Always stay on the main chat URL after sending
        const url = `/chat/${chatIdForSubmit}`;
        window.history.replaceState({}, "", url);
      },
    });

  const [messagesContainerRef, messagesEndRef] =
    useScrollToBottom<HTMLDivElement>();

  const [attachments, setAttachments] = useState<Array<Attachment>>([]);
  const [activeThread, setActiveThread] = useState<{
    parentMessage: Message;
  } | null>(null);

  const handleStartThread = (messageId: string) => {
    const parentMessage = messages.find((msg) => msg.id === messageId);
    if (parentMessage && !isThread) {
      setActiveThread({ parentMessage });
    }
  };

  const handleCloseThread = () => {
    setActiveThread(null);
    if (!isThread) {
      router.push(`/chat/${id}`);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const MessageComponent = ({
    message,
    showReply = true,
  }: {
    message: Message;
    showReply?: boolean;
  }) => {
    // Use the custom hook for thread count
    const { threadCount } = useThreadCount(message.id, id);

    return (
      <div className="group flex items-start space-x-3 p-3 hover:bg-gray-50 rounded">
        <Avatar className="w-8 h-8">
          <AvatarFallback
            className={
              message.role === "user"
                ? "bg-blue-500 text-white"
                : "bg-green-500 text-white"
            }
          >
            {message.role === "user" ? "U" : "AI"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-sm">
              {message.role === "user" ? "You" : "AI Assistant"}
            </span>
            <span className="text-xs text-gray-500">
              {formatTime(new Date())}
            </span>
          </div>
          <div className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
            {message.content}
          </div>
          {showReply && !isThread && (
            <div className="mt-2 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleStartThread(message.id)}
                className="h-6 px-2 text-xs flex items-center"
              >
                <MessageSquare className="w-3 h-3 mr-1" />
                Reply
              </Button>
              {threadCount > 0 && (
                <span className="text-xs text-gray-600 bg-gray-200 px-1 rounded-full">
                  {threadCount}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      className={`flex h-full bg-white min-w-0 ${className} ${
        isThread ? "max-h-full overflow-hidden" : ""
      }`}
    >
      {/* Main Chat Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 ${
          activeThread ? "border-r" : ""
        } ${isThread ? "h-full max-h-full overflow-hidden" : ""}`}
      >
        {/* Header */}
        {!isThread && (
          <div className="border-b px-4 py-3 bg-white flex-shrink-0">
            <div className="flex items-center space-x-2">
              <Hash className="w-4 h-4 text-gray-500" />
              <h1 className="font-semibold text-lg">Chat</h1>
            </div>
          </div>
        )}

        {/* Messages */}
        <div
          className={`flex-1 overflow-y-auto min-h-0 ${
            isThread ? "max-h-full" : ""
          }`}
          ref={messagesContainerRef}
        >
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Start a conversation!</p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {messages.map((message) => (
                <MessageComponent
                  key={message.id}
                  message={message}
                  showReply={!isThread}
                />
              ))}
            </div>
          )}
          {isLoading && (
            <div className="p-3">
              <div className="flex items-center space-x-2 text-gray-500">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
                <span className="text-sm">AI is typing...</span>
              </div>
            </div>
          )}
          <div
            ref={messagesEndRef}
            className="shrink-0 min-w-[24px] min-h-[24px]"
          />
        </div>

        {/* Input */}
        <div className="border-t p-4 flex-shrink-0">
          <form
            onSubmit={(e) =>
              handleSubmit(e, {
                experimental_attachments: attachments,
              })
            }
            className="flex space-x-2"
          >
            <div className="flex-1 relative">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isThread ? "Reply to thread..." : "Message..."}
                className="pr-10"
                disabled={isLoading}
              />
              <Button
                type="submit"
                size="sm"
                className="absolute right-1 top-1 h-6 w-6 p-0"
                disabled={isLoading || !input.trim()}
              >
                <Send className="w-3 h-3" />
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Thread Sidebar */}
      {!isThread && activeThread && (
        <div className="w-96 flex-shrink-0 border-l h-full overflow-hidden">
          <ThreadView
            parentMessage={activeThread.parentMessage}
            mainChatId={id}
            onClose={handleCloseThread}
            className="h-full"
          />
        </div>
      )}
    </div>
  );
}
