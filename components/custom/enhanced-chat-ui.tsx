"use client";

export function EnhancedChatUI({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-full h-full bg-white dark:bg-gray-900">
      {children}
    </div>
  );
}