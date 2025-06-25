import { auth } from "@/app/(auth)/auth";
import { getChatsByUserId } from "@/db/queries";

export async function GET() {
  const session = await auth();

  if (!session || !session.user) {
    return Response.json("Unauthorized!", { status: 401 });
  }

  // Extract the actual ID string from the user object
  const userId =
    typeof session.user.id === "object"
      ? (session.user.id as any).id
      : session.user.id;

  if (!userId) {
    return Response.json("User ID not found", { status: 400 });
  }

  const chats = await getChatsByUserId(userId);
  return Response.json(chats);
}
