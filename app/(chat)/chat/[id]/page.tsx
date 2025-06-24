import { notFound } from "next/navigation";
import { auth } from "@/app/(auth)/auth";
import { Chat as PreviewChat } from "@/components/custom/chat";
import { getChatById, getMessages } from "@/db/queries";
import { convertToUIMessages } from "@/lib/utils";

export default async function Page({ params }: { params: any }) {
  const { id } = params;
  const chatFromDb = await getChatById({ id });

  if (!chatFromDb) notFound();

  // verify access
  const session = await auth();
  if (!session?.user || session.user.id !== (chatFromDb as any).userId)
    notFound();

  // fetch top-level messages
  const rawMessages = await getMessages(id);
  const uiMessages = convertToUIMessages(rawMessages);
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
