"use client";

import { Attachment, Message } from "ai";
import { useChat } from "ai/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { Message as PreviewMessage } from "@/components/custom/message";
import { useScrollToBottom } from "@/components/custom/use-scroll-to-bottom";
import { ThreadView } from "./thread-view";
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
  const [activeThread, setActiveThread] = useState<{
    threadId: string;
    parentMessage: Message;
  } | null>(null);

  const handleStartThread = (messageId: string) => {
    const parentMessage = messages.find((msg) => msg.id === messageId);
    if (parentMessage && !isThread) {
      const threadId = generateUUID();
      setActiveThread({ threadId, parentMessage });
    }
  };

  const handleCloseThread = () => {
    setActiveThread(null);
    if (!isThread) {
      router.push(`/chat/${id}`);
    }
  };

  return (
    <div
      className={`flex ${
        isThread ? "flex-col h-full" : "flex-row pb-4 md:pb-8 h-dvh"
      } bg-background`}
    >
      <div
        className={`${
          activeThread ? "w-2/3" : "w-full"
        } flex flex-col justify-between items-center gap-4 ${
          isThread ? "h-full" : ""
        }`}
      >
        <div
          ref={messagesContainerRef}
          className={`flex flex-col gap-4 h-full ${
            isThread ? "w-full p-4" : "w-dvw"
          } items-center overflow-y-scroll`}
        >
          {messages.length === 0 && !isThread && <Overview />}

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
            />
          ))}

          <div
            ref={messagesEndRef}
            className="shrink-0 min-w-[24px] min-h-[24px]"
          />
        </div>

        <form
          onSubmit={(e) =>
            handleSubmit(e, {
              experimental_attachments: attachments,
            })
          }
          className={`flex flex-row gap-2 relative items-end w-full ${
            isThread
              ? "px-4 pb-4"
              : "md:max-w-[500px] max-w-[calc(100dvw-32px)] px-4 md:px-0"
          }`}
        >
          <MultimodalInput
            messages={messages}
            input={input}
            setInput={setInput}
            isLoading={isLoading}
            stop={stop}
            attachments={attachments}
            setAttachments={setAttachments}
            append={append}
            handleSubmit={handleSubmit}
          />
        </form>
      </div>

      {!isThread && activeThread && (
        <div className="w-1/3 border-l">
          <ThreadView
            threadId={activeThread.threadId}
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
