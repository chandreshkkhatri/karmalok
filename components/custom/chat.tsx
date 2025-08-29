"use client";

import { Attachment, Message } from "ai";
import { useChat } from "ai/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquare, Send, ChevronRight, Reply, StickyNote } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { useScrollToBottom } from "@/components/custom/use-scroll-to-bottom";
import { useThreadCount } from "@/components/custom/use-thread-count";

import { ThreadView } from "./thread-view";
import { EnhancedMessage } from "./enhanced-message";

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
  const [expandedThreads, setExpandedThreads] = useState<Set<string>>(new Set());

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
    setExpandedThreads(prev => {
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
        <div className={`flex gap-3 p-4 ${message.role === "user" ? "justify-end" : ""}`}>
          {message.role === "assistant" && (
            <Avatar className="w-9 h-9 border-2 border-gray-200 dark:border-gray-700">
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-sm font-semibold">
                AI
              </AvatarFallback>
            </Avatar>
          )}
          
          <div className={`flex-1 max-w-2xl ${message.role === "user" ? "text-right" : ""}`}>
            <div className={`inline-block ${message.role === "user" 
              ? "bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-4 py-3 shadow-sm" 
              : "bg-white dark:bg-gray-800 rounded-2xl rounded-tl-sm border border-gray-200 dark:border-gray-700 px-4 py-3 shadow-sm"}`}>
              
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
            <div className={`flex items-center gap-2 mt-2 ${message.role === "user" ? "justify-end" : ""}`}>
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
                      <ChevronRight className={`w-3 h-3 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                      <span>{threadCount} {threadCount === 1 ? "reply" : "replies"}</span>
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
            <Avatar className="w-9 h-9 border-2 border-primary/20">
              <AvatarFallback className="bg-gradient-to-br from-green-500 to-blue-500 text-white text-sm font-semibold">
                U
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
    <div className={`flex h-full ${className} ${isThread ? "max-h-full overflow-hidden" : ""}`}>
      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col min-w-0 bg-white dark:bg-gray-900 ${
        activeThread ? "border-r border-gray-200 dark:border-gray-700" : ""
      } ${isThread ? "h-full max-h-full overflow-hidden" : ""}`}>
        
        {/* Header */}
        {!isThread && (
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm flex-shrink-0">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Conversation
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              AI-powered chat with threaded replies
            </p>
          </div>
        )}

        {/* Messages */}
        <div
          className={`flex-1 overflow-y-auto min-h-0 ${isThread ? "max-h-full" : ""}`}
          ref={messagesContainerRef}
        >
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 flex items-center justify-center">
                  <MessageSquare className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Start a Conversation
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Type a message below to begin chatting
                </p>
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
                <Avatar className="w-9 h-9 border-2 border-gray-200 dark:border-gray-700">
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-sm font-semibold">
                    AI
                  </AvatarFallback>
                </Avatar>
                <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-tl-sm border border-gray-200 dark:border-gray-700 px-4 py-3 shadow-sm">
                  <div className="typing-indicator flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} className="shrink-0 min-w-[24px] min-h-[24px]" />
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm p-4 flex-shrink-0">
          <form
            onSubmit={(e) => handleSubmit(e, { experimental_attachments: attachments })}
            className="max-w-3xl mx-auto"
          >
            <div className="relative">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isThread ? "Reply to thread..." : "Type a message..."}
                className="pr-12 py-6 text-base rounded-xl border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-primary/20"
                disabled={isLoading}
              />
              <Button
                type="submit"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-3 py-2"
                disabled={isLoading || !input.trim()}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </form>
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