import React, { useState, useEffect } from "react";
import { IMessage } from "@/models";
import MessageItem from "./MessageItem";
import MessageInput from "./MessageInput";
import { X, MessageSquare } from "lucide-react";

interface ReplyThreadProps {
  parentMessage: IMessage;
  threadId: string;
  currentUserId: string;
  onClose: () => void;
}

export default function ReplyThread({
  parentMessage,
  threadId,
  currentUserId,
  onClose,
}: ReplyThreadProps) {
  const [replies, setReplies] = useState<IMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  useEffect(() => {
    const fetchReplies = async () => {
      try {
        setIsLoadingMessages(true);
        const response = await fetch(
          `/api/threads/${threadId}/messages?parentId=${parentMessage._id}`
        );
        const data = await response.json();

        if (response.ok) {
          // Remove the parent message from replies (it's included in the response)
          const actualReplies = data.messages.filter(
            (msg: IMessage) => msg._id !== parentMessage._id
          );
          setReplies(actualReplies);
        }
      } catch (error) {
        console.error("Error fetching replies:", error);
      } finally {
        setIsLoadingMessages(false);
      }
    };

    fetchReplies();
  }, [parentMessage._id, threadId]);

  const handleSendReply = async (content: string) => {
    try {
      setIsLoading(true);

      // Send user reply
      const response = await fetch(`/api/threads/${threadId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          userId: currentUserId,
          parentId: parentMessage._id,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setReplies((prev) => [...prev, data.message]);

        // Generate AI response
        const aiResponse = await fetch(`/api/threads/${threadId}/ai-response`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            parentId: parentMessage._id,
          }),
        });

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          setReplies((prev) => [...prev, aiData.message]);
        }
      }
    } catch (error) {
      console.error("Error sending reply:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-1/2 bg-white shadow-xl border-l z-50 flex flex-col">
      {/* Header */}
      <div className="border-b p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare size={20} className="text-gray-600" />
          <h3 className="font-medium text-gray-900">Thread Reply</h3>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
          <X size={20} />
        </button>
      </div>

      {/* Parent Message */}
      <div className="border-b bg-gray-50">
        <MessageItem
          message={parentMessage}
          onReply={() => {}}
          isReply={false}
        />
      </div>

      {/* Replies */}
      <div className="flex-1 overflow-y-auto">
        {isLoadingMessages ? (
          <div className="flex items-center justify-center p-8">
            <div className="text-gray-500">Loading replies...</div>
          </div>
        ) : replies.length === 0 ? (
          <div className="flex items-center justify-center p-8">
            <div className="text-gray-500">
              No replies yet. Start the conversation!
            </div>
          </div>
        ) : (
          replies.map((reply) => (
            <MessageItem
              key={reply._id}
              message={reply}
              onReply={() => {}}
              isReply={true}
            />
          ))
        )}
      </div>

      {/* Reply Input */}
      <MessageInput
        onSend={handleSendReply}
        placeholder="Reply to this thread..."
        isLoading={isLoading}
        isReply={true}
      />
    </div>
  );
}
