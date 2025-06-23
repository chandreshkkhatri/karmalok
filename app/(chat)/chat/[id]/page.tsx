import { CoreMessage } from "ai";
import { notFound } from "next/navigation";

import { auth } from "@/app/(auth)/auth";
import { Chat as PreviewChat } from "@/components/custom/chat";
import { getChatById } from "@/db/queries";
import { Chat } from "@/db/queries";
import { convertToUIMessages } from "@/lib/utils";

export default async function Page({ params }: { params: any }) {
  const { id } = params;
  const chatFromDb = await getChatById({ id });

  if (!chatFromDb) {
    notFound();
  }

  // Cast to any to access the properties, then type properly
  const chatData = chatFromDb as any;

  // Check if this is a thread (has parentMessageId)
  const isThread = !!chatData.parentMessageId;

  // type casting and converting messages to UI messages
  const chat: Chat = {
    id: chatData._id || chatData.id,
    messages: convertToUIMessages(chatData.messages as Array<CoreMessage>),
    userId: chatData.userId,
    isThread: chatData.isThread || false,
    parentMessageId: chatData.parentMessageId,
    mainChatId: chatData.mainChatId,
    createdAt: chatData.createdAt,
    updatedAt: chatData.updatedAt,
  };

  const session = await auth();

  if (!session || !session.user) {
    return notFound();
  }

  if (session.user.id !== chat.userId) {
    return notFound();
  }

  return (
    <PreviewChat
      id={chat.id}
      initialMessages={chat.messages}
      isThread={isThread}
      parentMessageId={chatData.parentMessageId}
      mainChatId={chatData.mainChatId}
    />
  );
}
