import { NextRequest } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { getThreadsByParentMessage, getChatById } from "@/db/queries";

export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const parentMessageId = searchParams.get("parentMessageId");
  const mainChatId = searchParams.get("mainChatId");

  if (!parentMessageId || !mainChatId) {
    return new Response("Missing required parameters", { status: 400 });
  }

  try {
    // Verify user has access to the main chat
    const mainChat = await getChatById({ id: mainChatId });
    if (!mainChat || mainChat.userId !== session.user.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    const threads = await getThreadsByParentMessage({
      parentMessageId,
      mainChatId,
    });

    return Response.json({ threads });
  } catch (error) {
    console.error("Failed to get threads:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
