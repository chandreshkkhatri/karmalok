import { NextRequest } from "next/server";

import { auth } from "@/app/(auth)/auth";
import { getThreadCountByParentMessage, getChatById } from "@/db/queries";
import {
  createUnauthorizedResponse,
  createBadRequestResponse,
  createJsonResponse,
  createInternalErrorResponse,
} from "@/lib/api-responses";

export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
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
    if (!mainChat || mainChat.userId !== session.user.id) {
      return createUnauthorizedResponse();
    }

    const threadCount = await getThreadCountByParentMessage({
      parentMessageId,
      mainChatId,
    });

    return createJsonResponse({ count: threadCount });
  } catch (error) {
    console.error("Failed to get thread count:", error);
    return createInternalErrorResponse();
  }
}
