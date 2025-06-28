import Script from "next/script";

export function StructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Restack App",
    description:
      "Advanced AI chatbot powered by Google Gemini. Get intelligent responses, have natural conversations, and boost your productivity.",
    url: "https://restackapp.vercel.app",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Any",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    creator: {
      "@type": "Organization",
      name: "Restack App Team",
    },
    featureList: [
      "AI-powered conversations",
      "Google Gemini integration",
      "Real-time chat interface",
      "Conversation history",
      "Multi-modal support",
    ],
    screenshot: "https://restackapp.vercel.app/images/demo-thumbnail.png",
  };

  return (
    <Script
      id="structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData),
      }}
    />
  );
}
