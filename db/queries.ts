import "server-only";
import { ensureConnection } from "./connection";
import { User, Chat, Message } from "./models";

// Re-export types for external use
export { Chat } from "./models";

// User functions
export async function createUser(
  email: string,
  displayName: string,
  avatarUrl?: string,
  isBot = false
) {
  await ensureConnection();
  return User.create({ email, displayName, avatarUrl, isBot });
}
export async function getUserByEmail(email: string) {
  await ensureConnection();
  return User.findOne({ email }).lean();
}

// Chat functions
export async function createChat(
  userId: string,
  aiId: string,
  title?: string,
  chatId?: string
) {
  await ensureConnection();
  const chatData: any = { userId, aiId };

  if (title) {
    chatData.title = title;
  }

  // Allow the caller to specify the _id so that the client-generated id and
  // the MongoDB document id stay in sync.
  if (chatId) {
    chatData._id = chatId;
  }

  const chat = await Chat.create(chatData);
  return chat.toObject();
}
export async function getChatsByUserId(userId: string) {
  await ensureConnection();
  const chats = await Chat.find({ userId })
    .sort({ lastMsgAt: -1 })
    .lean();

  // Ensure each chat has an `id` field (lean documents don\'t include the virtual by default)
  return chats.map((chat: any) => ({
    ...chat,
    id: chat._id.toString(),
  }));
}
export async function getChatById({ id }: { id: string }) {
  await ensureConnection();
  const chat = await Chat.findById(id).lean();
  if (chat && !Array.isArray(chat)) {
    return { ...chat, id: (chat as any)._id.toString() } as any;
  }
  return chat;
}

// Message functions
export async function createMessage({
  chatId,
  senderId,
  parentMsgId = null,
  body,
  files = [],
}: {
  chatId: string;
  senderId: string;
  parentMsgId?: string | null;
  body: string;
  files?: Array<{ name: string; url: string; mime: string }>;
}) {
  await ensureConnection();
  const message = await Message.create({
    chatId,
    senderId,
    parentMsgId,
    body,
    files,
  });
  await Chat.findByIdAndUpdate(chatId, { lastMsgAt: new Date() });
  return message.toObject();
}

export async function getMessages(chatId: string, limit = 50) {
  await ensureConnection();
  return Message.find({ chatId, parentMsgId: null })
    .sort({ createdAt: 1 })
    .limit(limit)
    .lean();
}

export async function getThreadMessages(parentMsgId: string) {
  await ensureConnection();
  return Message.find({ parentMsgId }).sort({ createdAt: 1 }).lean();
}

export async function getThreadCountByParentMessage({
  parentMessageId,
}: {
  parentMessageId: string;
}) {
  await ensureConnection();
  return Message.countDocuments({ parentMsgId: parentMessageId });
}
export async function getMessageById({ id }: { id: string }) {
  await ensureConnection();
  return Message.findById(id).lean();
}
export async function deleteChatById({ id }: { id: string }) {
  await ensureConnection();
  await Message.deleteMany({ chatId: id });
  return Chat.findByIdAndDelete(id);
}
