import { NextRequest } from "next/server";

import { auth } from "@/app/(auth)/auth";
import { getThreadMessages, getChatById } from "@/db/queries";
import {
  createUnauthorizedResponse,
  createBadRequestResponse,
  createJsonResponse,
  createInternalErrorResponse,
} from "@/lib/api-responses";

export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session || !session.user) {
    return createUnauthorizedResponse();
  }

  // Extract the actual ID string from the user object
  const userId =
    typeof session.user.id === "object"
      ? (session.user.id as any).id
      : session.user.id;

  if (!userId) {
    return createUnauthorizedResponse();
  }

  const { searchParams } = new URL(request.url);
  const parentMessageId = searchParams.get("parentMessageId");
  const mainChatId = searchParams.get("mainChatId");

  if (!parentMessageId || !mainChatId) {
    return createBadRequestResponse("Missing required parameters");
  }

  try {
    // Verify user has access to the main chat
    const mainChat = await getChatById({ id: mainChatId });
    if (!mainChat || (mainChat as any).userId.toString() !== userId) {
      return createUnauthorizedResponse();
    }

    const dbMessages = await getThreadMessages(parentMessageId);

    const uiMessages = dbMessages.map((msg: any) => ({
      id: msg._id.toString(),
      role: msg.senderId.toString() === userId ? "user" : "assistant",
      content: msg.body,
    }));

    return createJsonResponse({ threads: uiMessages });
  } catch (error) {
    console.error("Failed to get threads:", error);
    return createInternalErrorResponse();
  }
}
