import { X, ChevronDown, ChevronUp, MessageSquare, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Chat } from "./chat";
import { Message } from "ai";
import { useState, useEffect } from "react";
import { mutate as revalidateSWR } from "swr";
import { motion, AnimatePresence } from "framer-motion";

interface ThreadViewProps {
  parentMessage: Message;
  mainChatId: string;
  onClose: () => void;
  className?: string;
}

export function ThreadView({
  parentMessage,
  mainChatId,
  onClose,
  className = "",
}: ThreadViewProps) {
  const [isParentMessageExpanded, setIsParentMessageExpanded] = useState(true);
  const [threadMessages, setThreadMessages] = useState<Message[]>([]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const handleNewReply = () => {
    revalidateSWR(
      `/api/threads/count?parentMessageId=${parentMessage.id}&mainChatId=${mainChatId}`
    );
  };

  // Load existing replies for this thread
  useEffect(() => {
    async function loadThread() {
      try {
        const res = await fetch(
          `/api/threads?parentMessageId=${parentMessage.id}&mainChatId=${mainChatId}`
        );
        if (!res.ok) return;
        const { threads } = await res.json();
        setThreadMessages(threads);
      } catch {
        // ignore errors
      }
    }
    loadThread();
  }, [parentMessage.id, mainChatId]);

  return (
    <div className={`flex flex-col bg-gray-50 dark:bg-gray-950 h-full max-h-full overflow-hidden ${className}`}>
      {/* Thread Header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <MessageSquare className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-gray-100">Thread</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Replying to message</p>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onClose}
          className="rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Parent Message Section */}
      <div className="border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
        <button
          className="w-full px-4 py-3 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-between"
          onClick={() => setIsParentMessageExpanded(!isParentMessageExpanded)}
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Original Message
            </span>
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <Clock className="w-3 h-3" />
              <span>{formatTime(parentMessage.createdAt || new Date())}</span>
            </div>
          </div>
          <motion.div
            animate={{ rotate: isParentMessageExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronUp className="w-4 h-4 text-gray-500" />
          </motion.div>
        </button>

        <AnimatePresence>
          {isParentMessageExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-4 py-4 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 max-h-48 overflow-y-auto">
                <div className="flex items-start gap-3">
                  <Avatar className="w-8 h-8 flex-shrink-0 border-2 border-gray-200 dark:border-gray-700">
                    <AvatarFallback className={parentMessage.role === "user" 
                      ? "bg-gradient-to-br from-green-500 to-blue-500 text-white text-xs font-semibold" 
                      : "bg-gradient-to-br from-blue-500 to-purple-500 text-white text-xs font-semibold"}>
                      {parentMessage.role === "user" ? "U" : "AI"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm text-gray-900 dark:text-gray-100">
                        {parentMessage.role === "user" ? "You" : "AI Assistant"}
                      </span>
                    </div>
                    <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">
                      {typeof parentMessage.content === "string"
                        ? parentMessage.content
                        : JSON.stringify(parentMessage.content)}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Thread Separator */}
      <div className="px-4 py-2 bg-gradient-to-b from-gray-100 to-gray-50 dark:from-gray-900 dark:to-gray-950 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent"></div>
          <span className="text-xs text-gray-500 dark:text-gray-400 px-2">Thread Replies</span>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent"></div>
        </div>
      </div>

      {/* Thread Chat */}
      <div className="min-h-0 flex-grow bg-white dark:bg-gray-900">
        <Chat
          id={mainChatId}
          initialMessages={threadMessages}
          isThread={true}
          parentMessageId={parentMessage.id}
          mainChatId={mainChatId}
          className="h-full max-h-full flex flex-col"
          onFinish={handleNewReply}
        />
      </div>
    </div>
  );
}