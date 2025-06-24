import "server-only";
import mongoose, { Schema, Document } from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;
if (!MONGODB_URI) throw new Error("Define MONGODB_URI in .env.local");

async function connectToDatabase() {
  if (mongoose.connection.readyState === 1) return mongoose.connection;
  await mongoose.connect(MONGODB_URI, { bufferCommands: false });
  return mongoose.connection;
}

// User schema
interface IUser extends Document {
  email: string;
  displayName: string;
  avatarUrl?: string;
  isBot: boolean;
  createdAt: Date;
  updatedAt: Date;
}
const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    displayName: { type: String, required: true },
    avatarUrl: { type: String },
    isBot: { type: Boolean, default: false },
  },
  { timestamps: true }
);
userSchema.index({ displayName: 1 });
const User = mongoose.models.User || mongoose.model<IUser>("User", userSchema);

// Chat schema (single chat per conversation)
interface IChat extends Document {
  userId: string;
  aiId: string;
  title?: string;
  lastMsgAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
const chatSchema = new Schema<IChat>(
  {
    userId: { type: Schema.Types.ObjectId, required: true },
    aiId: { type: Schema.Types.ObjectId, required: true },
    title: { type: String },
    lastMsgAt: { type: Date, default: Date.now, required: true },
  },
  { timestamps: true }
);
chatSchema.index({ userId: 1, lastMsgAt: -1 });
chatSchema.index({ lastMsgAt: -1 });
const Chat = mongoose.models.Chat || mongoose.model<IChat>("Chat", chatSchema);

// Message schema
interface IMessage extends Document {
  chatId: string;
  senderId: string;
  parentMsgId?: string | null;
  body: string;
  files: Array<{ name: string; url: string; mime: string }>;
  reactions: Array<{ userId: string; emoji: string }>;
  createdAt: Date;
  editedAt?: Date;
}
const messageSchema = new Schema<IMessage>(
  {
    chatId: { type: Schema.Types.ObjectId, required: true },
    senderId: { type: Schema.Types.ObjectId, required: true },
    parentMsgId: { type: Schema.Types.ObjectId, default: null },
    body: { type: String, required: true },
    files: [{ name: String, url: String, mime: String }],
    reactions: [
      {
        userId: { type: Schema.Types.ObjectId, required: true },
        emoji: { type: String, required: true },
      },
    ],
  },
  { timestamps: { createdAt: true, updatedAt: "editedAt" } }
);
messageSchema.index({ chatId: 1, createdAt: 1 });
messageSchema.index({ parentMsgId: 1, createdAt: 1 });
const Message =
  mongoose.models.Message || mongoose.model<IMessage>("Message", messageSchema);

// User functions
export async function createUser(
  email: string,
  displayName: string,
  avatarUrl?: string,
  isBot = false
) {
  await connectToDatabase();
  return User.create({ email, displayName, avatarUrl, isBot });
}
export async function getUserByEmail(email: string) {
  await connectToDatabase();
  return User.findOne({ email }).lean();
}

// Chat functions
export async function createChat(userId: string, aiId: string, title?: string) {
  await connectToDatabase();
  const chat = await Chat.create({ userId, aiId, title });
  return chat.toObject();
}
export async function getChatsByUserId(userId: string) {
  await connectToDatabase();
  return Chat.find({ userId }).sort({ lastMsgAt: -1 }).lean();
}
export async function getChatById({ id }: { id: string }) {
  await connectToDatabase();
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
  await connectToDatabase();
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
  await connectToDatabase();
  return Message.find({ chatId, parentMsgId: null })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
}

export async function getThreadMessages(parentMsgId: string) {
  await connectToDatabase();
  return Message.find({ parentMsgId }).sort({ createdAt: 1 }).lean();
}

export async function getThreadCountByParentMessage({
  parentMessageId,
}: {
  parentMessageId: string;
}) {
  await connectToDatabase();
  return Message.countDocuments({ parentMsgId: parentMessageId });
}

// Helper to fetch a single message (for parent content)
export async function getMessageById({ id }: { id: string }) {
  await connectToDatabase();
  return Message.findById(id).lean();
}

// Delete a chat and all its messages
export async function deleteChatById({ id }: { id: string }) {
  await connectToDatabase();
  await Message.deleteMany({ chatId: id });
  return Chat.findByIdAndDelete(id);
}
