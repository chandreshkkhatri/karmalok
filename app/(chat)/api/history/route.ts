import { auth } from "@/app/(auth)/auth";
import { getChatsByUserId } from "@/db/queries";
import { getSessionUserId } from "@/lib/get-session-user-id";

export async function GET() {
  const session = await auth();

  if (!session || !session.user) {
    return Response.json("Unauthorized!", { status: 401 });
  }

  const userId = getSessionUserId(session);
  if (!userId) {
    return Response.json("User ID not found", { status: 400 });
  }

  const chats = await getChatsByUserId(userId);
  return Response.json(chats);
}
