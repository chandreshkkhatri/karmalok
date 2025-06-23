import OpenAI from "openai";
import { Message, IMessage } from "@/models";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

/**
 * Get relevant context messages for AI response
 * For main thread: Include all main thread messages (parentId: null)
 * For reply thread: Include main thread messages up to the parent message + reply thread messages
 */
export async function getContextMessages(
  threadId: string,
  parentId?: string
): Promise<IMessage[]> {
  if (!parentId) {
    // Main thread - get all main thread messages
    return await Message.find({
      threadId,
      parentId: null,
    })
      .sort({ createdAt: 1 })
      .populate("userId");
  } else {
    // Reply thread - get context differently
    const parentMessage = await Message.findById(parentId).populate("userId");
    if (!parentMessage) {
      throw new Error("Parent message not found");
    }

    // Get main thread messages up to the parent message
    const mainThreadMessages = await Message.find({
      threadId,
      parentId: null,
      createdAt: { $lte: parentMessage.createdAt },
    })
      .sort({ createdAt: 1 })
      .populate("userId");

    // Get all reply messages in this thread
    const replyMessages = await Message.find({
      threadId,
      parentId,
    })
      .sort({ createdAt: 1 })
      .populate("userId");

    // Combine: main thread context + parent message + reply thread
    return [...mainThreadMessages, parentMessage, ...replyMessages];
  }
}

/**
 * Convert database messages to OpenAI chat format
 */
export function formatMessagesForAI(messages: IMessage[]): ChatMessage[] {
  const systemMessage: ChatMessage = {
    role: "system",
    content: `You are a helpful AI assistant in a chat interface. Users can reply to specific messages to create threaded conversations. 
    When responding, be helpful, concise, and consider the context of the conversation thread.
    If you're in a reply thread, focus on the specific topic being discussed in that thread.`,
  };

  const chatMessages: ChatMessage[] = messages.map((msg) => ({
    role: msg.isAiResponse ? "assistant" : "user",
    content: `${msg.user?.username || "User"}: ${msg.content}`,
  }));

  return [systemMessage, ...chatMessages];
}

/**
 * Generate AI response using OpenAI
 */
export async function generateAIResponse(
  threadId: string,
  parentId?: string
): Promise<string> {
  try {
    // Get relevant context messages
    const contextMessages = await getContextMessages(threadId, parentId);

    // Format for OpenAI
    const chatMessages = formatMessagesForAI(contextMessages);

    // Generate response
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-3.5-turbo",
      messages: chatMessages,
      max_tokens: 500,
      temperature: 0.7,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error("No response generated from AI");
    }

    return response;
  } catch (error) {
    console.error("Error generating AI response:", error);
    throw new Error("Failed to generate AI response");
  }
}

/**
 * Create AI response message and save to database
 */
export async function createAIResponse(
  threadId: string,
  aiUserId: string,
  parentId?: string
): Promise<IMessage> {
  try {
    const aiResponse = await generateAIResponse(threadId, parentId);

    const aiMessage = new Message({
      content: aiResponse,
      userId: aiUserId,
      threadId,
      parentId,
      isAiResponse: true,
    });

    await aiMessage.save();
    await aiMessage.populate("userId");

    return aiMessage;
  } catch (error) {
    console.error("Error creating AI response:", error);
    throw error;
  }
}
