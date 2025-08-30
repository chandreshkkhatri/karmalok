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
import { motion, AnimatePresence } from "framer-motion";

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
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="group relative"
      >
        <div
          className={`flex gap-3 p-4 ${
            message.role === "user" ? "justify-end" : ""
          }`}
        >
          {message.role === "assistant" && (
            <Avatar className="size-9 border-2 border-gray-200 dark:border-gray-700">
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-sm font-semibold">
                K
              </AvatarFallback>
            </Avatar>
          )}

          <div
            className={`flex-1 max-w-2xl ${
              message.role === "user" ? "text-right" : ""
            }`}
          >
            <div
              className={`inline-block ${
                message.role === "user"
                  ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl rounded-tr-lg px-4 py-3 shadow-lg"
                  : "bg-white dark:bg-gray-800 rounded-2xl rounded-tl-lg border border-gray-200 dark:border-gray-700 px-4 py-3 shadow-lg"
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

            {/* Time and actions */}
            <div
              className={`flex items-center gap-2 mt-2 ${
                message.role === "user" ? "justify-end" : ""
              }`}
            >
              <span className="text-xs text-gray-400">
                {formatTime(new Date())}
              </span>

              {showReply && !isThread && message.role === "assistant" && (
                <div className="flex items-center gap-1">
                  {threadCount > 0 && (
                    <button
                      onClick={() => toggleThreadExpansion(message.id)}
                      className="inline-flex items-center gap-1 px-2 py-1 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                      <ChevronRight
                        className={`w-3 h-3 transition-transform ${
                          isExpanded ? "rotate-90" : ""
                        }`}
                      />
                      <span>
                        {threadCount} {threadCount === 1 ? "reply" : "replies"}
                      </span>
                    </button>
                  )}

                  <button
                    onClick={() => handleStartThread(message.id)}
                    className="inline-flex items-center gap-1 px-2 py-1 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <Reply className="w-3 h-3" />
                    <span>Reply</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {message.role === "user" && (
            <Avatar className="size-9 border-2 border-blue-200 dark:border-blue-700">
              <AvatarFallback className="bg-gradient-to-br from-green-500 to-blue-500 text-white text-sm font-semibold">
                You
              </AvatarFallback>
            </Avatar>
          )}
        </div>

        {/* Thread preview */}
        <AnimatePresence>
          {isExpanded && threadCount > 0 && !isThread && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="ml-12 pl-4 border-l-2 border-primary/20"
            >
              <div className="py-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3">
                  <p className="font-medium mb-2">Thread Preview</p>
                  <p className="text-xs">Click reply to view full thread...</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  return (
    <div
      className={`flex h-full ${className} ${
        isThread ? "max-h-full overflow-hidden" : ""
      } bg-gradient-to-b from-gray-50/50 to-white dark:from-gray-950/50 dark:to-gray-900`}
    >
      {/* Main Chat Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm ${
          activeThread
            ? "border-r border-gray-200/50 dark:border-gray-700/50"
            : ""
        } ${isThread ? "h-full max-h-full overflow-hidden" : ""}`}
      >
        {/* Header */}
        {!isThread && (
          <div className="px-6 py-5 border-b border-gray-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl shrink-0">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                <span className="text-lg font-bold text-white">K</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Karmalok
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  AI-powered conversations with threaded replies
                </p>
              </div>
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
            <div className="flex items-center justify-center h-full p-8">
              <div className="text-center max-w-md">
                <div className="size-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <span className="text-2xl font-bold text-white">K</span>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                  Welcome to Karmalok
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                  Your intelligent AI conversation companion
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
                  Ask questions, get help with tasks, or just have a friendly
                  chat. I&apos;m here to assist you with anything you need.
                </p>

                {/* Quick suggestions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                  <button
                    onClick={() => setInput("Tell me about yourself")}
                    className="p-4 text-left rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                        <MessageSquare className="size-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="font-medium text-sm text-gray-900 dark:text-white">
                          Get to know me
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Learn about my capabilities
                        </p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() =>
                      setInput("Help me write a professional email")
                    }
                    className="p-4 text-left rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
                        <StickyNote className="size-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div>
                        <p className="font-medium text-sm text-gray-900 dark:text-white">
                          Writing assistant
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Help with emails and documents
                        </p>
                      </div>
                    </div>
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
            <div className="px-6 py-4">
              <div className="flex items-center gap-3">
                <Avatar className="size-9 border-2 border-gray-200 dark:border-gray-700">
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-sm font-semibold">
                    AI
                  </AvatarFallback>
                </Avatar>
                <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-tl-sm border border-gray-200 dark:border-gray-700 px-4 py-3 shadow-sm">
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
        <div className="border-t border-gray-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-4 shrink-0">
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
      <AnimatePresence>
        {!isThread && activeThread && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 400, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="h-full overflow-hidden border-l border-gray-200 dark:border-gray-700"
          >
            <ThreadView
              parentMessage={activeThread.parentMessage}
              mainChatId={id}
              onClose={handleCloseThread}
              className="h-full w-[400px]"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
