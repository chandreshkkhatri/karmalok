import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Authentication - Restack App",
  description:
    "Sign in or create an account to access your personal AI chat assistant.",
  robots: {
    index: false, // Don't index auth pages
    follow: true,
  },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
