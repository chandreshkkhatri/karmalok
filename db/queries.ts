import "server-only";

import { genSaltSync, hashSync } from "bcrypt-ts";
import { Message } from "ai";
import mongoose, { Schema, Document } from "mongoose";

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local"
  );
}

async function connectToDatabase() {
  try {
    if (mongoose.connection.readyState === 1) {
      return mongoose.connection;
    }

    const opts = {
      bufferCommands: false,
    };

    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI, opts);
    console.log("MongoDB connected successfully");
    return mongoose.connection;
  } catch (error) {
    console.error("MongoDB connection error:", error);
    console.error("Make sure your MONGODB_URI is correct in .env.local");
    throw error;
  }
}

// Schemas and Models
interface IUser extends Document {
  _id: string;
  email: string;
  password?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface IChat extends Document {
  _id: string;
  messages: Message[];
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface IReservation extends Document {
  _id: string;
  details: any;
  hasCompletedPayment: boolean;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface IThread extends Document {
  _id: string;
  messages: Message[];
  userId: string;
  parentMessageId: string;
  mainChatId: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String },
  },
  {
    timestamps: true,
  }
);

const chatSchema = new Schema<IChat>(
  {
    messages: { type: Schema.Types.Mixed, required: true },
    userId: { type: String, required: true, ref: "User" },
  },
  {
    timestamps: true,
  }
);

const reservationSchema = new Schema<IReservation>(
  {
    details: { type: Schema.Types.Mixed, required: true },
    hasCompletedPayment: { type: Boolean, required: true, default: false },
    userId: { type: String, required: true, ref: "User" },
  },
  {
    timestamps: true,
  }
);

const threadSchema = new Schema<IThread>(
  {
    messages: { type: Schema.Types.Mixed, required: true },
    userId: { type: String, required: true, ref: "User" },
    parentMessageId: { type: String, required: true },
    mainChatId: { type: String, required: true, ref: "Chat" },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model<IUser>("User", userSchema);
const Chat = mongoose.models.Chat || mongoose.model<IChat>("Chat", chatSchema);
const Reservation =
  mongoose.models.Reservation ||
  mongoose.model<IReservation>("Reservation", reservationSchema);
const Thread = mongoose.models.Thread || mongoose.model<IThread>("Thread", threadSchema);

export async function getUser(email: string): Promise<Array<any>> {
  try {
    await connectToDatabase();
    const users = await User.find({ email }).lean();
    return users;
  } catch (error) {
    console.error("Failed to get user from database");
    throw error;
  }
}

export async function createUser(email: string, password: string) {
  let salt = genSaltSync(10);
  let hash = hashSync(password, salt);

  try {
    await connectToDatabase();
    return await User.create({ email, password: hash });
  } catch (error) {
    console.error("Failed to create user in database");
    throw error;
  }
}

export async function saveChat({
  id,
  messages,
  userId,
}: {
  id: string;
  messages: any;
  userId: string;
}) {
  try {
    await connectToDatabase();

    const existingChat = await Chat.findById(id);

    if (existingChat) {
      return await Chat.findByIdAndUpdate(id, { messages }, { new: true });
    }

    return await Chat.create({
      _id: id,
      messages,
      userId,
    });
  } catch (error) {
    console.error("Failed to save chat in database");
    throw error;
  }
}

export async function deleteChatById({ id }: { id: string }) {
  try {
    await connectToDatabase();
    return await Chat.findByIdAndDelete(id);
  } catch (error) {
    console.error("Failed to delete chat by id from database");
    throw error;
  }
}

export async function getChatsByUserId({ id }: { id: string }) {
  try {
    await connectToDatabase();
    // Only fetch main chats, exclude threads
    const chats = await Chat.find({ userId: id })
      .sort({ createdAt: -1 })
      .lean();

    // Transform _id to id for frontend compatibility
    return chats.map((chat: any) => ({
      ...chat,
      id: chat._id.toString(),
    }));
  } catch (error) {
    console.error("Failed to get chats by user from database");
    throw error;
  }
}

export async function getChatById({ id }: { id: string }): Promise<any | null> {
  try {
    await connectToDatabase();
    const chat = await Chat.findById(id).lean();
    if (!chat) return null;

    // Transform _id to id for frontend compatibility
    return {
      ...chat,
      id: (chat as any)._id.toString(),
    };
  } catch (error) {
    console.error("Failed to get chat by id from database");
    return null; // Return null instead of throwing
  }
}

export async function getMainChatMessages({
  chatId,
  beforeTimestamp,
}: {
  chatId: string;
  beforeTimestamp: Date;
}): Promise<Message[]> {
  try {
    await connectToDatabase();
    const chat = await Chat.findById(chatId).lean();
    if (!chat) return [];

    const messages = (chat.messages as Message[]).filter((message) => {
      const messageTimestamp = message.createdAt || (message as any).timestamp;
      return messageTimestamp && new Date(messageTimestamp) < beforeTimestamp;
    });

    return messages;
  } catch (error) {
    console.error("Failed to get main chat messages from database", error);
    return [];
  }
}

export async function createReservation({
  id,
  userId,
  details,
}: {
  id: string;
  userId: string;
  details: any;
}) {
  await connectToDatabase();
  return await Reservation.create({
    _id: id,
    userId,
    hasCompletedPayment: false,
    details,
  });
}

export async function getReservationById({
  id,
}: {
  id: string;
}): Promise<any | null> {
  try {
    await connectToDatabase();
    const reservation = await Reservation.findById(id).lean();
    if (!reservation) return null;

    // Transform _id to id for frontend compatibility
    return {
      ...reservation,
      id: (reservation as any)._id.toString(),
    };
  } catch (error) {
    console.error("Failed to get reservation by id from database");
    throw error;
  }
}

export async function updateReservation({
  id,
  hasCompletedPayment,
}: {
  id: string;
  hasCompletedPayment: boolean;
}) {
  await connectToDatabase();
  return await Reservation.findByIdAndUpdate(
    id,
    { hasCompletedPayment },
    { new: true }
  );
}

// Thread-related functions
export async function createThread({
  id,
  messages,
  userId,
  parentMessageId,
  mainChatId,
}: {
  id: string;
  messages: any;
  userId: string;
  parentMessageId: string;
  mainChatId: string;
}) {
  try {
    await connectToDatabase();
    return await Thread.create({
      _id: id,
      messages,
      userId,
      parentMessageId,
      mainChatId,
    });
  } catch (error) {
    console.error("Failed to create thread in database");
    throw error;
  }
}

export async function getThreadsByMainChatId({
  mainChatId,
}: {
  mainChatId: string;
}) {
  try {
    await connectToDatabase();
    const threads = await Thread.find({ mainChatId }).sort({ createdAt: -1 }).lean();
    return threads.map((thread: any) => ({
      ...thread,
      id: thread._id.toString(),
    }));
  } catch (error) {
    console.error("Failed to get threads by main chat from database");
    throw error;
  }
}

export async function getThreadsByParentMessage({
  parentMessageId,
  mainChatId,
}: {
  parentMessageId: string;
  mainChatId: string;
}) {
  try {
    await connectToDatabase();
    const threads = await Thread.find({ parentMessageId, mainChatId }).sort({ createdAt: -1 }).lean();
    return threads.map((thread: any) => ({
      ...thread,
      id: thread._id.toString(),
    }));
  } catch (error) {
    console.error("Failed to get threads by parent message from database");
    return [];
  }
}

// Count threads for a given parent message
export async function getThreadCountByParentMessage({
  parentMessageId,
  mainChatId,
}: {
  parentMessageId: string;
  mainChatId: string;
}): Promise<number> {
  try {
    await connectToDatabase();
    return await Thread.countDocuments({ parentMessageId, mainChatId });
  } catch (error) {
    console.error("Failed to get thread count from database", error);
    return 0;
  }
}

// Export types for compatibility with existing code
export type User = IUser;
export type Chat = {
  id: string;
  messages: Array<Message>;
  userId: string;
  parentMessageId?: string;
  isThread?: boolean;
  mainChatId?: string;
  createdAt: Date;
  updatedAt: Date;
};
export type Reservation = IReservation;
