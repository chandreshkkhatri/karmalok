import { convertToCoreMessages, Message, streamText } from "ai";
import { z } from "zod";

import { geminiProModel } from "@/ai";
import { auth } from "@/app/(auth)/auth";
import { getChatById, createMessage } from "@/db/queries";
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

  // Persist the user's thread reply
  if (coreMessages.length > 0) {
    const userMsg = coreMessages[coreMessages.length - 1];
    await createMessage({
      chatId: mainChatId,
      senderId: session.user.id,
      parentMsgId: parentMessageId,
      body: userMsg.content,
    });
  }

  // Use full main chat context + this thread's messages
  const fullContext = coreMessages;

  const result = await streamText({
    model: geminiProModel,
    system: `You are a helpful AI assistant. You can help with various tasks when requested. Today's date is ${new Date().toLocaleDateString()}.
    
    IMPORTANT: You are responding in a reply thread. Only answer based on the user’s follow-up question.`,
    messages: fullContext,
    experimental_telemetry: {
      isEnabled: true,
      functionId: "stream-text-thread",
    },
    onFinish: async ({ responseMessages }) => {
      // Persist AI response(s)
      for (const msg of responseMessages) {
        await createMessage({
          chatId: mainChatId,
          senderId: (await getChatById({ id: mainChatId })).aiId.toString(),
          parentMsgId: parentMessageId,
          body: msg.content,
        });
      }
    },
  });

  return result.toDataStreamResponse({});
}
