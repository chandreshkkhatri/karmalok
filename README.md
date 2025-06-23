# AI Chat Interface with Threaded Replies

A modern AI chat interface built with **Next.js 15**, **MongoDB**, and **OpenAI**, featuring Slack-like threaded messaging with context-aware AI responses.

## ✨ Key Features

- **🧵 Threaded Messaging**: Reply to specific messages like in Slack
- **🧠 Context-Aware AI**: Smart context management for different thread types
- **⚡ Real-time Updates**: Live chat functionality
- **📱 Responsive Design**: Modern UI with Tailwind CSS
- **🗄️ MongoDB Integration**: Persistent message storage
- **🔒 User Management**: Simple username-based authentication

## 🏗️ Architecture

### Threading Logic

- **Main Thread**: Primary conversation flow (`parentId: null`)
- **Reply Threads**: Users can reply to specific messages
- **Smart Context**: Only relevant messages are sent to AI
  - Main thread: All main thread messages
  - Reply thread: Main thread messages up to parent + reply thread messages

### Models

- **Message**: Core message entity with threading support
- **Thread**: Thread metadata and organization
- **User**: Basic user information

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- OpenAI API key

### Installation

1. **Clone and install dependencies**:

   ```bash
   git clone <your-repo-url>
   cd ai-chat-interface
   npm install
   ```

2. **Set up environment variables**:

   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` and add your configuration:

   ```env
   MONGODB_URI=mongodb://localhost:27017/ai-chat
   OPENAI_API_KEY=your_openai_api_key_here
   OPENAI_MODEL=gpt-3.5-turbo
   ```

3. **Start MongoDB** (if running locally):

   ```bash
   # macOS with Homebrew
   brew services start mongodb/brew/mongodb-community

   # Or using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

4. **Run the development server**:

   ```bash
   npm run dev
   ```

5. **Open** [http://localhost:3000](http://localhost:3000) in your browser

## 🎯 Usage

1. **Login**: Enter a username to start chatting
2. **Chat**: Send messages in the main thread
3. **Reply**: Click "Reply" on any message to start a threaded conversation
4. **AI Responses**: The AI automatically responds with context-aware messages

### Context Management

- **Main Thread**: When you send a message in the main thread, the AI sees all previous main thread messages
- **Reply Thread**: When you reply to a message, the AI only sees:
  - Main thread messages up to the parent message
  - All messages in the current reply thread
  - This prevents context pollution between different discussion topics

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, MongoDB, Mongoose
- **AI**: OpenAI GPT models (configurable)
- **Icons**: Lucide React
- **Date**: date-fns

## 📁 Project Structure

```
src/
├── app/
│   ├── api/                 # API routes
│   │   ├── threads/         # Thread management
│   │   └── users/           # User management
│   └── page.tsx             # Main page
├── components/              # React components
│   ├── ChatInterface.tsx    # Main chat interface
│   ├── MessageItem.tsx      # Individual message display
│   ├── MessageInput.tsx     # Message input component
│   └── ReplyThread.tsx      # Reply thread sidebar
├── lib/
│   ├── mongodb.ts           # Database connection
│   └── aiService.ts         # AI integration logic
└── models/
    └── index.ts             # MongoDB models
```

## 🔧 Configuration

### Environment Variables

| Variable         | Description               | Default                             |
| ---------------- | ------------------------- | ----------------------------------- |
| `MONGODB_URI`    | MongoDB connection string | `mongodb://localhost:27017/ai-chat` |
| `OPENAI_API_KEY` | OpenAI API key            | Required                            |
| `OPENAI_MODEL`   | OpenAI model to use       | `gpt-3.5-turbo`                     |

### AI Models

You can use different OpenAI models:

- `gpt-3.5-turbo` - Fast and cost-effective
- `gpt-4` - Higher quality responses
- `gpt-4-turbo` - Best performance

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### MongoDB Atlas

For production, use MongoDB Atlas:

1. Create a cluster at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Get your connection string
3. Update `MONGODB_URI` in your environment variables

## 🔄 API Endpoints

### Threads

- `GET /api/threads` - List all threads
- `POST /api/threads` - Create new thread

### Messages

- `GET /api/threads/[threadId]/messages` - Get messages in thread
- `POST /api/threads/[threadId]/messages` - Send message
- `POST /api/threads/[threadId]/ai-response` - Generate AI response

### Users

- `GET /api/users` - List users
- `POST /api/users` - Create user

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components with [Tailwind CSS](https://tailwindcss.com/)
- Icons by [Lucide](https://lucide.dev/)
- AI powered by [OpenAI](https://openai.com/)
