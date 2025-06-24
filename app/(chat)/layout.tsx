import { auth } from "@/app/(auth)/auth";
import { History } from "@/components/custom/history";

export default async function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <div className="flex h-dvh pt-16 bg-white">
      <History user={session?.user} />
      <main className="flex-1 flex flex-col min-w-0">{children}</main>
    </div>
  );
}
