"use client";

import { Attachment, ToolInvocation } from "ai";
import { motion } from "framer-motion";
import { ReactNode } from "react";

import { BotIcon, UserIcon } from "./icons";
import { Markdown } from "./markdown";
import { PreviewAttachment } from "./preview-attachment";
import { ReplyLink } from "./reply-link";

export const Message = ({
  chatId,
  role,
  content,
  toolInvocations,
  attachments,
  messageId,
  isThread = false,
  onStartThread,
}: {
  chatId: string;
  role: string;
  content: string | ReactNode;
  toolInvocations: Array<ToolInvocation> | undefined;
  attachments?: Array<Attachment>;
  messageId?: string;
  isThread?: boolean;
  onStartThread?: (messageId: string) => void;
  onViewThread?: (threadId: string) => void;
}) => {
  return (
    <motion.div
      className={`flex items-start gap-4 px-4 w-full md:w-[500px] md:px-0 first-of-type:pt-20 ${
        role === "user" ? "flex-row-reverse text-right" : "flex-row text-left"
      }`}
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      <div className="size-[24px] border rounded-sm p-1 flex flex-col justify-center items-center shrink-0 text-zinc-500">
        {role === "assistant" ? <BotIcon /> : <UserIcon />}
      </div>

      <div className="flex flex-col gap-2 w-full">
        {content && typeof content === "string" && (
          <div className="text-zinc-800 dark:text-zinc-300 flex flex-col gap-4">
            <Markdown>{content}</Markdown>
          </div>
        )}

        {toolInvocations && (
          <div className="flex flex-col gap-4">
            {toolInvocations.map((toolInvocation: any) => {
              const { toolCallId, state } = toolInvocation;
              const result = toolInvocation.result;
              return (
                <div
                  key={toolCallId}
                  className={state === "result" ? "" : "skeleton"}
                >
                  {state === "result" ? (
                    <pre>{JSON.stringify(result, null, 2)}</pre>
                  ) : (
                    "Loading..."
                  )}
                </div>
              );
            })}
          </div>
        )}

        {attachments && (
          <div className="flex flex-row gap-2">
            {attachments.map((attachment) => (
              <PreviewAttachment key={attachment.url} attachment={attachment} />
            ))}
          </div>
        )}

        {/* Reply link for assistant messages in main chat */}
        {role === "assistant" && !isThread && messageId && onStartThread && (
          <div className="mt-2">
            <ReplyLink
              messageId={messageId}
              chatId={chatId}
              onStartThread={onStartThread}
            />
          </div>
        )}
      </div>
    </motion.div>
  );
};
