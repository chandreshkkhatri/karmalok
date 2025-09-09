"use client";

import { Attachment, Message } from "ai";
import { useChat } from "ai/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  MessageSquare,
  Send,
  ChevronRight,
  Reply,
  StickyNote,
} from "lucide-react";

import { useScrollToBottom } from "@/components/custom/use-scroll-to-bottom";
import { useThreadCount } from "@/components/custom/use-thread-count";

import { ThreadView } from "./thread-view";
import { EnhancedMessage } from "./enhanced-message";
import { MultimodalInput } from "./multimodal-input";

export function Chat({
  id,
  initialMessages,
  isThread = false,
  parentMessageId,
  mainChatId,
  className = "",
  onFinish,
}: {
  id: string;
  initialMessages: Array<Message>;
  isThread?: boolean;
  parentMessageId?: string;
  mainChatId?: string;
  className?: string;
  onFinish?: () => void;
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
        const url = `/chat/${chatIdForSubmit}`;
        window.history.replaceState({}, "", url);
        onFinish?.();
      },
    });

  const [messagesContainerRef, messagesEndRef] =
    useScrollToBottom<HTMLDivElement>();

  const [attachments, setAttachments] = useState<Array<Attachment>>([]);
  const [activeThread, setActiveThread] = useState<{
    parentMessage: Message;
  } | null>(null);
  const [expandedThreads, setExpandedThreads] = useState<Set<string>>(
    new Set()
  );

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

  const toggleThreadExpansion = (messageId: string) => {
    setExpandedThreads((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
      }
      return newSet;
    });
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
    const { threadCount } = useThreadCount(message.id, id);
    const isExpanded = expandedThreads.has(message.id);

    return (
      <div className="group relative">
        <div
          className={`flex gap-2 p-3 ${
            message.role === "user" ? "justify-end" : ""
          }`}
        >
          {message.role === "assistant" && (
            <Avatar className="size-8 shrink-0">
              <AvatarFallback className="bg-blue-500 text-white text-xs font-semibold">
                K
              </AvatarFallback>
            </Avatar>
          )}

          <div
            className={`flex-1 max-w-[85%] sm:max-w-2xl ${
              message.role === "user" ? "text-right" : ""
            }`}
          >
            <div
              className={`inline-block ${
                message.role === "user"
                  ? "bg-blue-500 text-white rounded-2xl rounded-tr-sm px-3 py-2"
                  : "bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-tl-sm px-3 py-2"
              }`}
            >
              <div className="flex items-start gap-2">
                <div className="flex-1">
                  <EnhancedMessage
                    message={message}
                    onAnnotationReply={(question, text) => {
                      console.log("Annotation reply:", question, text);
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Actions - only show on desktop */}
            {showReply && !isThread && message.role === "assistant" && (
              <div
                className="hidden sm:flex items-center gap-1 mt-1"
              >
                {threadCount > 0 && (
                  <button
                    onClick={() => toggleThreadExpansion(message.id)}
                    className="inline-flex items-center gap-1 px-2 py-1 text-xs text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                  >
                    <ChevronRight
                      className={`w-3 h-3 transition-transform ${
                        isExpanded ? "rotate-90" : ""
                      }`}
                    />
                    <span>{threadCount}</span>
                  </button>
                )}

                <button
                  onClick={() => handleStartThread(message.id)}
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                >
                  <Reply className="w-3 h-3" />
                  <span>Reply</span>
                </button>
              </div>
            )}
          </div>

          {message.role === "user" && (
            <Avatar className="size-8 shrink-0">
              <AvatarFallback className="bg-gray-500 text-white text-xs font-semibold">
                U
              </AvatarFallback>
            </Avatar>
          )}
        </div>

        {/* Thread preview */}
        {isExpanded && threadCount > 0 && !isThread && (
          <div className="ml-12 pl-4 border-l-2 border-primary/20">
            <div className="py-2 text-sm text-gray-600 dark:text-gray-400">
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3">
                <p className="font-medium mb-2">Thread Preview</p>
                <p className="text-xs">Click reply to view full thread...</p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className={`flex h-full ${className} ${
        isThread ? "max-h-full overflow-hidden" : ""
      } bg-white dark:bg-gray-900`}
    >
      {/* Main Chat Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 ${
          activeThread
            ? "lg:border-r border-gray-200 dark:border-gray-700"
            : ""
        } ${isThread ? "h-full max-h-full overflow-hidden" : ""}`}
      >

        {/* Messages */}
        <div
          className={`flex-1 overflow-y-auto min-h-0 ${
            isThread ? "max-h-full" : ""
          }`}
          ref={messagesContainerRef}
        >
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full p-8">
              <div className="text-center max-w-md">
                <div className="size-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-xl font-bold text-white">K</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Welcome to Karmalok
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Ask questions, get help with tasks, or start a conversation.
                </p>

                {/* Quick suggestions */}
                <div className="flex flex-col gap-2 mb-4">
                  <button
                    onClick={() => setInput("Tell me about yourself")}
                    className="p-3 text-left rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Tell me about yourself
                    </p>
                  </button>

                  <button
                    onClick={() =>
                      setInput("Help me write a professional email")
                    }
                    className="p-3 text-left rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Help me write a professional email
                    </p>
                  </button>
                </div>

                <div className="text-xs text-gray-400 dark:text-gray-500">
                  Type your message below to start our conversation
                </div>
              </div>
            </div>
          ) : (
            <div className="py-4">
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
            <div className="px-3 py-3">
              <div className="flex items-center gap-2">
                <Avatar className="size-8 shrink-0">
                  <AvatarFallback className="bg-blue-500 text-white text-xs font-semibold">
                    K
                  </AvatarFallback>
                </Avatar>
                <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl rounded-tl-sm px-3 py-2">
                  <div className="typing-indicator flex gap-1">
                    <span className="size-2 bg-gray-400 rounded-full"></span>
                    <span className="size-2 bg-gray-400 rounded-full"></span>
                    <span className="size-2 bg-gray-400 rounded-full"></span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div
            ref={messagesEndRef}
            className="shrink-0 min-w-[24px] min-h-[24px]"
          />
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-3 sm:p-4 shrink-0">
          <div className="max-w-4xl mx-auto">
            <MultimodalInput
              input={input}
              setInput={setInput}
              isLoading={isLoading}
              stop={stop}
              attachments={attachments}
              setAttachments={setAttachments}
              messages={messages}
              append={append}
              handleSubmit={handleSubmit}
            />
          </div>
        </div>
      </div>

      {/* Thread Sidebar */}
      {!isThread && activeThread && (
        <div className="hidden lg:block h-full overflow-hidden border-l border-gray-200 dark:border-gray-700 w-96">
          <ThreadView
            parentMessage={activeThread.parentMessage}
            mainChatId={id}
            onClose={handleCloseThread}
            className="h-full w-full"
          />
        </div>
      )}
    </div>
  );
}
