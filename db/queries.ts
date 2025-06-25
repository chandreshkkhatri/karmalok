import "server-only";
import connectToDatabase from "./connection";
import { User, Chat, Message } from "./models";

connectToDatabase();

// User functions
export async function createUser(
  email: string,
  displayName: string,
  avatarUrl?: string,
  isBot = false
) {
  return User.create({ email, displayName, avatarUrl, isBot });
}
export async function getUserByEmail(email: string) {
  return User.findOne({ email }).lean();
}

// Chat functions
export async function createChat(userId: string, aiId: string, title?: string) {
  const chat = await Chat.create({ userId, aiId, title });
  return chat.toObject();
}
export async function getChatsByUserId(userId: string) {
  return Chat.find({ userId }).sort({ lastMsgAt: -1 }).lean();
}
export async function getChatById({ id }: { id: string }) {
  return Chat.findById(id).lean();
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
  return Message.find({ chatId, parentMsgId: null })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
}

export async function getThreadMessages(parentMsgId: string) {
  return Message.find({ parentMsgId }).sort({ createdAt: 1 }).lean();
}

export async function getThreadCountByParentMessage({
  parentMessageId,
}: {
  parentMessageId: string;
}) {
  return Message.countDocuments({ parentMsgId: parentMessageId });
}
export async function getMessageById({ id }: { id: string }) {
  return Message.findById(id).lean();
}
export async function deleteChatById({ id }: { id: string }) {
  await Message.deleteMany({ chatId: id });
  return Chat.findByIdAndDelete(id);
}
