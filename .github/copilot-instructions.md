# Copilot Instructions

<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

This is an AI chat interface project with the following key features:

## Project Structure

- **Next.js 15** with TypeScript and App Router
- **MongoDB** for data persistence
- **Tailwind CSS** for styling
- **Threaded messaging** like Slack
- **Context-aware AI responses**

## Key Features

1. **Main chat thread** - Primary conversation flow
2. **Reply threads** - Users can reply to specific messages
3. **Smart context management** - Only relevant messages are sent to AI
4. **Real-time updates** - Live chat functionality
5. **MongoDB integration** - Persistent message storage

## Architecture Notes

- Messages have a `parentId` field for threading
- Main thread messages have `parentId: null`
- Reply threads only include context from messages before the parent message
- AI responses are context-aware based on thread structure

## Key Models

- **Message**: Core message entity with threading support
- **Thread**: Thread metadata and organization
- **User**: Basic user information

Please help generate code that follows Next.js 15 best practices, uses proper TypeScript types, and implements the threading logic correctly.
