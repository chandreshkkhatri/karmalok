import { Metadata } from "next";
import { Toaster } from "sonner";

import { Navbar } from "@/components/custom/navbar";
import { StructuredData } from "@/components/custom/structured-data";
import { ThemeProvider } from "@/components/custom/theme-provider";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://karmalok.vercel.app"), // Update this to your actual domain
  title: {
    default: "Karmalok - AI-Powered Chat Assistant",
    template: "%s | Karmalok",
  },
  description:
    "Advanced AI chatbot powered by Google Gemini. Get intelligent responses, have natural conversations, and boost your productivity with our cutting-edge chat assistant.",
  keywords: [
    "AI chatbot",
    "Google Gemini",
    "artificial intelligence",
    "chat assistant",
    "conversational AI",
    "productivity tool",
  ],
  authors: [{ name: "Karmalok Team" }],
  creator: "Karmalok",
  publisher: "Karmalok",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://karmalok.vercel.app",
    title: "Karmalok - AI-Powered Chat Assistant",
    description:
      "Advanced AI chatbot powered by Google Gemini. Get intelligent responses, have natural conversations, and boost your productivity.",
    siteName: "Karmalok",
    images: [
      {
        url: "/images/og-image.png", // We'll create this
        width: 1200,
        height: 630,
        alt: "Karmalok - AI Chat Assistant",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Karmalok - AI-Powered Chat Assistant",
    description:
      "Advanced AI chatbot powered by Google Gemini. Get intelligent responses and boost your productivity.",
    images: ["/images/twitter-image.png"], // We'll create this
    creator: "@karmalok", // Update with your Twitter handle
  },
  verification: {
    google: "your-google-verification-code", // Add your Google Search Console verification
    yandex: "your-yandex-verification-code", // Optional
    yahoo: "your-yahoo-verification-code", // Optional
  },
  alternates: {
    canonical: "https://karmalok.vercel.app",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/images/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <StructuredData />
          <Toaster position="top-center" />
          <Navbar />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
