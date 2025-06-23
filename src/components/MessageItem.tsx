import React from "react";
import { IMessage } from "@/models";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare, User, Bot } from "lucide-react";

interface MessageItemProps {
  message: IMessage;
  onReply: (messageId: string) => void;
  isReply?: boolean;
  depth?: number;
}

export default function MessageItem({
  message,
  onReply,
  isReply = false,
  depth = 0,
}: MessageItemProps) {
  const isAI = message.isAiResponse;
  const user = message.userId as unknown as {
    username: string;
    email?: string;
  }; // User is populated

  return (
    <div
      className={`flex gap-3 p-4 hover:bg-gray-50 transition-colors ${
        isReply ? "ml-6 border-l-2 border-gray-200" : ""
      }`}
      style={{ marginLeft: depth * 24 }}
    >
      <div className="flex-shrink-0">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isAI ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600"
          }`}
        >
          {isAI ? <Bot size={16} /> : <User size={16} />}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-sm text-gray-900">
            {user?.username || "Unknown User"}
          </span>
          <span className="text-xs text-gray-500">
            {formatDistanceToNow(new Date(message.createdAt), {
              addSuffix: true,
            })}
          </span>
        </div>

        <div className="text-gray-800 text-sm leading-relaxed mb-2 whitespace-pre-wrap">
          {message.content}
        </div>

        {!isReply && (
          <button
            onClick={() => onReply(message._id)}
            className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
          >
            <MessageSquare size={12} />
            Reply
          </button>
        )}
      </div>
    </div>
  );
}
