# Restack App

A powerful and customizable AI-powered chatbot built with modern web technologies.

Restack App provides a seamless and interactive chat experience, leveraging the power of large language models to deliver intelligent and helpful responses. This repository contains the full source code for the application.

## Features

- **Intuitive Chat Interface**: A clean, Slack-like user interface for a natural conversation flow.
- **Threaded Conversations**: Organize discussions with nested reply threads.
- **Real-time Responses**: Powered by the Vercel AI SDK for streaming text generation.
- **Secure Authentication**: User accounts are managed securely with NextAuth.js.
- **Persistent Chat History**: Conversations are saved, allowing users to pick up where they left off.
- **Customizable & Extendable**: Built with developers in mind, making it easy to add new features and integrations.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org) (App Router)
- **AI**: [Vercel AI SDK](https://sdk.vercel.ai/docs), [Google Gemini](https://ai.google.dev/)
- **UI**: [React](https://react.dev/), [Tailwind CSS](https://tailwindcss.com), [shadcn/ui](https://ui.shadcn.com), [Radix UI](https://radix-ui.com)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/)
- **Database**: [MongoDB](https://www.mongodb.com/)

## Getting Started

To run the application locally, follow these steps:

1.  **Clone the repository:**

    ```bash
    git clone <repository-url>
    cd restackapp
    ```

2.  **Install dependencies:**

    ```bash
    pnpm install
    ```

3.  **Set up environment variables:**
    Create a `.env.local` file in the root of the project and add the necessary environment variables. You can use `.env.example` as a template.

4.  **Run the development server:**

    ```bash
    pnpm dev
    ```

5.  Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Configuration

The application requires the following environment variables to be set:

- `MONGODB_URI`: Your MongoDB connection string.
- `AUTH_SECRET`: A secret key for NextAuth.js.
- `GOOGLE_GENERATIVE_AI_API_KEY`: Your API key for the Google Gemini model.

Refer to the `.env.example` file for a complete list of required and optional variables.
