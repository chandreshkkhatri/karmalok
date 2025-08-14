import { auth } from "@/app/(auth)/auth";
import { History } from "@/components/custom/history";
import { EnhancedChatUI } from "@/components/custom/enhanced-chat-ui";
import { KeyboardShortcuts } from "@/components/custom/keyboard-shortcuts";

export default async function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <EnhancedChatUI>
      <div className="flex h-dvh pt-16">
        <History user={session?.user} />
        <main className="flex-1 flex flex-col min-w-0">{children}</main>
        <KeyboardShortcuts />
      </div>
    </EnhancedChatUI>
  );
}
