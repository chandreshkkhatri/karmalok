import { convertToCoreMessages, Message, streamText } from "ai";
import { z } from "zod";

import { geminiProModel } from "@/ai";
import { auth } from "@/app/(auth)/auth";
import { deleteChatById, getChatById, createMessage } from "@/db/queries";
import { generateUUID } from "@/lib/utils";

export async function POST(request: Request) {
  const { id, messages }: { id: string; messages: Array<Message> } =
    await request.json();

  const session = await auth();

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const coreMessages = convertToCoreMessages(messages).filter(
    (message) => message.content.length > 0
  );

  // Persist the new user message
  const lastUserMsg = coreMessages.find((m) => m.role === "user" && m.content);
  if (lastUserMsg && session.user?.id) {
    await createMessage({
      chatId: id,
      senderId: session.user.id,
      body: lastUserMsg.content,
    });
  }

  const result = await streamText({
    model: geminiProModel,
    system: `You are a helpful AI assistant. You can help with various tasks. Today's date is ${new Date().toLocaleDateString()}.`,
    messages: coreMessages,
    onFinish: async ({ responseMessages }) => {
      if (session.user && session.user.id) {
        try {
          // Persist AI response messages
          const chat = await getChatById({ id });
          for (const msg of responseMessages) {
            await createMessage({
              chatId: id,
              senderId: (chat as any).aiId,
              body: msg.content,
            });
          }
        } catch (error) {
          console.error("Failed to save AI responses");
        }
      }
    },
    experimental_telemetry: {
      isEnabled: true,
      functionId: "stream-text",
    },
  });

  return result.toDataStreamResponse({});
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return new Response("Not Found", { status: 404 });
  }

  const session = await auth();

  if (!session || !session.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const chat = await getChatById({ id });

    if (!chat) {
      return new Response("Chat not found", { status: 404 });
    }

    if (chat.userId !== session.user.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    await deleteChatById({ id });

    return new Response("Chat deleted", { status: 200 });
  } catch (error) {
    return new Response("An error occurred while processing your request", {
      status: 500,
    });
  }
}
