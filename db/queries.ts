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

const User = mongoose.models.User || mongoose.model<IUser>("User", userSchema);
const Chat = mongoose.models.Chat || mongoose.model<IChat>("Chat", chatSchema);
const Reservation =
  mongoose.models.Reservation ||
  mongoose.model<IReservation>("Reservation", reservationSchema);

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
    return await Chat.find({ userId: id }).sort({ createdAt: -1 }).lean();
  } catch (error) {
    console.error("Failed to get chats by user from database");
    throw error;
  }
}

export async function getChatById({ id }: { id: string }) {
  try {
    await connectToDatabase();
    const chat = await Chat.findById(id).lean();
    return chat;
  } catch (error) {
    console.error("Failed to get chat by id from database");
    throw error;
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

export async function getReservationById({ id }: { id: string }) {
  await connectToDatabase();
  const reservation = await Reservation.findById(id).lean();
  return reservation;
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

// Export types for compatibility with existing code
export type User = IUser;
export type Chat = Omit<IChat, "messages"> & {
  messages: Array<Message>;
};
export type Reservation = IReservation;
