"use client";

import { Attachment, Message } from "ai";
import { useChat } from "ai/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { Message as PreviewMessage } from "@/components/custom/message";
import { useScrollToBottom } from "@/components/custom/use-scroll-to-bottom";
import { ThreadView } from "./thread-view";
import { ThreadsList } from "./threads-list";
import { generateUUID } from "@/lib/utils";

import { MultimodalInput } from "./multimodal-input";
import { Overview } from "./overview";

export function Chat({
  id,
  initialMessages,
  isThread = false,
  parentMessageId,
  mainChatId,
}: {
  id: string;
  initialMessages: Array<Message>;
  isThread?: boolean;
  parentMessageId?: string;
  mainChatId?: string;
}) {
  const router = useRouter();
  const { messages, handleSubmit, input, setInput, append, isLoading, stop } =
    useChat({
      id,
      body: {
        id,
        ...(isThread && { parentMessageId, mainChatId }),
      },
      initialMessages,
      maxSteps: 10,
      api: isThread ? "/api/thread" : "/api/chat",
      onFinish: () => {
        const url = isThread
          ? `/chat/${mainChatId}/thread/${id}`
          : `/chat/${id}`;
        window.history.replaceState({}, "", url);
      },
    });

  const [messagesContainerRef, messagesEndRef] =
    useScrollToBottom<HTMLDivElement>();

  const [attachments, setAttachments] = useState<Array<Attachment>>([]);
  const [showThreadsList, setShowThreadsList] = useState<{
    parentMessageId: string;
    parentMessage: Message;
  } | null>(null);

  const handleStartThread = (messageId: string) => {
    const parentMessage = messages.find((msg) => msg.id === messageId);
    if (parentMessage && !isThread) {
      const threadId = generateUUID();
      // Navigate to the thread page
      router.push(
        `/chat/${id}/thread/${threadId}?parentMessageId=${messageId}`
      );
    }
  };

  const handleViewThread = (messageId: string) => {
    const parentMessage = messages.find((msg) => msg.id === messageId);
    if (parentMessage && !isThread) {
      setShowThreadsList({
        parentMessageId: messageId,
        parentMessage,
      });
    }
  };

  const handleCloseThreadsList = () => {
    setShowThreadsList(null);
  };

  return (
    <div className="flex flex-row justify-center pb-4 md:pb-8 h-dvh bg-background">
      <div className="flex flex-col justify-between items-center gap-4">
        <div
          ref={messagesContainerRef}
          className="flex flex-col gap-4 h-full w-dvw items-center overflow-y-scroll"
        >
          {messages.length === 0 && <Overview />}

          {messages.map((message) => (
            <PreviewMessage
              key={message.id}
              chatId={id}
              role={message.role}
              content={message.content}
              attachments={message.experimental_attachments}
              toolInvocations={message.toolInvocations}
              messageId={message.id}
              isThread={isThread}
              onStartThread={handleStartThread}
              onViewThread={handleViewThread}
            />
          ))}

          <div
            ref={messagesEndRef}
            className="shrink-0 min-w-[24px] min-h-[24px]"
          />
        </div>

        <form className="flex flex-row gap-2 relative items-end w-full md:max-w-[500px] max-w-[calc(100dvw-32px) px-4 md:px-0">
          <MultimodalInput
            input={input}
            setInput={setInput}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
            stop={stop}
            attachments={attachments}
            setAttachments={setAttachments}
            messages={messages}
            append={append}
          />
        </form>
      </div>

      {/* Threads List Sidebar */}
      {showThreadsList && (
        <ThreadsList
          parentMessageId={showThreadsList.parentMessageId}
          mainChatId={id}
          parentMessage={showThreadsList.parentMessage}
          onClose={handleCloseThreadsList}
        />
      )}
    </div>
  );
}
