import React, { useState, useEffect } from "react";
import { IMessage, IThread, IUser } from "@/models";
import MessageItem from "./MessageItem";
import MessageInput from "./MessageInput";
import ReplyThread from "./ReplyThread";
import { Plus, MessageCircle } from "lucide-react";

interface ChatInterfaceProps {
  initialThread?: IThread;
  currentUser: IUser;
}

export default function ChatInterface({
  initialThread,
  currentUser,
}: ChatInterfaceProps) {
  const [currentThread, setCurrentThread] = useState<IThread | null>(
    initialThread || null
  );
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [replyingTo, setReplyingTo] = useState<IMessage | null>(null);
  useEffect(() => {
    const loadMessages = async () => {
      if (!currentThread) return;

      try {
        setIsLoadingMessages(true);
        const response = await fetch(
          `/api/threads/${currentThread._id}/messages`
        );
        const data = await response.json();

        if (response.ok) {
          setMessages(data.messages);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        setIsLoadingMessages(false);
      }
    };

    loadMessages();
  }, [currentThread]);

  const createNewThread = async (): Promise<IThread | null> => {
    try {
      const response = await fetch("/api/threads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "New Chat",
          createdBy: currentUser._id,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentThread(data.thread);
        setMessages([]);
        setReplyingTo(null);
        return data.thread;
      }
    } catch (error) {
      console.error("Error creating thread:", error);
    }
    return null;
  };

  const handleSendMessage = async (content: string) => {
    let thread = currentThread;
    // If no thread yet, create one and then send the message
    if (!thread) {
      thread = await createNewThread();
      if (!thread) return;
    }

    try {
      setIsLoading(true);

      // Send user message
      const response = await fetch(`/api/threads/${thread._id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          userId: currentUser._id,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages((prev) => [...prev, data.message]);

        // Generate AI response
        const aiResponse = await fetch(
          `/api/threads/${thread._id}/ai-response`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({}),
          }
        );

        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          setMessages((prev) => [...prev, aiData.message]);
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReply = (messageId: string) => {
    const message = messages.find((m) => m._id === messageId);
    if (message) {
      setReplyingTo(message);
    }
  };

  const handleCloseReply = () => {
    setReplyingTo(null);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Main Chat Area */}
      <div
        className={`flex flex-col ${
          replyingTo ? "w-1/2" : "w-full"
        } transition-all duration-300`}
      >
        {/* Header */}
        <div className="bg-white border-b p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageCircle size={24} className="text-blue-600" />
            <h1 className="text-xl font-semibold text-gray-900">
              {currentThread?.title || "AI Chat Interface"}
            </h1>
          </div>
          <button
            onClick={createNewThread}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <Plus size={16} />
            New Chat
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto bg-white">
          {!currentThread ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <MessageCircle
                  size={48}
                  className="mx-auto text-gray-400 mb-4"
                />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Welcome to AI Chat
                </h3>
                <p className="text-gray-500 mb-4">
                  Start a new conversation or send a message to begin
                </p>
              </div>
            </div>
          ) : isLoadingMessages ? (
            <div className="flex items-center justify-center p-8">
              <div className="text-gray-500">Loading messages...</div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <MessageCircle
                  size={48}
                  className="mx-auto text-gray-400 mb-4"
                />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No messages yet
                </h3>
                <p className="text-gray-500">
                  Send a message to start the conversation
                </p>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <MessageItem
                key={message._id}
                message={message}
                onReply={handleReply}
              />
            ))
          )}
        </div>

        {/* Message Input */}
        <MessageInput
          onSend={handleSendMessage}
          placeholder={
            currentThread
              ? "Type your message..."
              : "Start a new conversation..."
          }
          isLoading={isLoading}
        />
      </div>

      {/* Reply Thread Sidebar */}
      {replyingTo && currentThread && (
        <ReplyThread
          parentMessage={replyingTo}
          threadId={currentThread._id}
          currentUserId={currentUser._id}
          onClose={handleCloseReply}
        />
      )}
    </div>
  );
}
