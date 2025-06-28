import { generateId, Message } from "ai";
import { Metadata } from "next";
import { notFound } from "next/navigation";

import { auth } from "@/app/(auth)/auth";
import { Chat as PreviewChat } from "@/components/custom/chat";
import { getChatById, getMessages } from "@/db/queries";

export async function generateMetadata({
  params,
}: {
  params: any;
}): Promise<Metadata> {
  const { id } = params;

  if (!id || id === "undefined" || id === "null") {
    return {
      title: "Chat Not Found",
      description: "The requested chat conversation could not be found.",
    };
  }

  try {
    const chatFromDb = await getChatById({ id });

    if (!chatFromDb) {
      return {
        title: "Chat Not Found",
        description: "The requested chat conversation could not be found.",
      };
    }

    const messages = await getMessages(id);
    const firstMessage = messages[0]?.body || "";
    const truncatedMessage =
      firstMessage.length > 100
        ? firstMessage.substring(0, 100) + "..."
        : firstMessage;

    return {
      title: `Chat Conversation - ${truncatedMessage || "AI Assistant"}`,
      description: `Continue your conversation with our AI assistant. ${
        truncatedMessage ||
        "Get intelligent responses and boost your productivity."
      }`,
      robots: {
        index: false, // Don't index private chat conversations
        follow: false,
      },
    };
  } catch (error) {
    return {
      title: "Chat Conversation",
      description: "Continue your conversation with our AI assistant.",
      robots: {
        index: false,
        follow: false,
      },
    };
  }
}

export default async function Page({ params }: { params: any }) {
  const { id } = params;

  // Check if id is valid before making database call
  if (!id || id === "undefined" || id === "null") {
    notFound();
  }

  const chatFromDb = await getChatById({ id });

  if (!chatFromDb) notFound();

  // verify access
  const session = await auth();

  // Extract the actual ID string from the user object
  const userId =
    typeof session?.user?.id === "object"
      ? (session.user.id as any).id
      : session?.user?.id;

  if (!session?.user || userId !== (chatFromDb as any).userId.toString()) {
    notFound();
  }

  // fetch top-level messages from DB and map to UI-friendly format
  const rawMessages = await getMessages(id);
  const uiMessages: Message[] = rawMessages.map((msg: any) => {
    const role: "user" | "assistant" =
      msg.senderId.toString() === userId ? "user" : "assistant";
    return {
      id: msg._id?.toString() || generateId(),
      role,
      content: msg.body,
    };
  });
  const isThread = false;

  return (
    <PreviewChat
      id={id}
      initialMessages={uiMessages}
      isThread={isThread}
      mainChatId={id}
    />
  );
}
