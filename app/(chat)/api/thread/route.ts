import { convertToCoreMessages, Message, streamText } from "ai";
import { z } from "zod";

import { geminiProModel } from "@/ai";
import { auth } from "@/app/(auth)/auth";
import {
  createThread,
  saveChat,
  getChatById,
  getMainChatMessages,
} from "@/db/queries";
import { generateUUID } from "@/lib/utils";

export async function POST(request: Request) {
  const {
    id,
    messages,
    parentMessageId,
    mainChatId,
  }: {
    id: string;
    messages: Array<Message>;
    parentMessageId: string;
    mainChatId: string;
  } = await request.json();

  const session = await auth();

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const coreMessages = convertToCoreMessages(messages).filter(
    (message) => message.content.length > 0
  );

  // Get the parent message timestamp to filter main chat context
  const mainChat = await getChatById({ id: mainChatId });
  const parentMessage = mainChat?.messages.find(
    (msg: any) => msg.id === parentMessageId
  );
  const parentTimestamp = parentMessage?.createdAt || parentMessage?.timestamp;

  // Get main chat messages up to the parent message timestamp
  let contextMessages: any[] = [];
  if (parentTimestamp) {
    const mainChatMessages = await getMainChatMessages({
      chatId: mainChatId,
      beforeTimestamp: new Date(parentTimestamp),
    });
    contextMessages = convertToCoreMessages(mainChatMessages).filter(
      (message) => message.content.length > 0
    );
  }

  // Combine context from main chat and current thread messages
  const fullContext = [...contextMessages, ...coreMessages];

  const result = await streamText({
    model: geminiProModel,
    system: `You are a helpful AI assistant. You can help with various tasks when requested. Today's date is ${new Date().toLocaleDateString()}.
    
    IMPORTANT: You are responding in a reply thread. The user is asking a follow-up question about a previous message. The context includes:
    1. Previous messages from the main conversation (up to the message being replied to)
    2. Messages in this reply thread
    
    Keep your response focused on the specific question in this thread.`,
    messages: fullContext,
    experimental_telemetry: {
      isEnabled: true,
      functionId: "stream-text-thread",
    },
  });

  return result.toDataStreamResponse({});
}
