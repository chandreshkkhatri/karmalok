import mongoose, { Schema, Document } from "mongoose";

// User schema
export interface IUser extends Document {
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
export const User =
  mongoose.models.User || mongoose.model<IUser>("User", userSchema);

// Chat schema (single chat per conversation)
export interface IChat extends Document {
  userId: string;
  aiId: string;
  title?: string;
  lastMsgAt: Date;
  createdAt: Date;
  updatedAt: Date;
  messages: IMessage[];
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
export const Chat =
  mongoose.models.Chat || mongoose.model<IChat>("Chat", chatSchema);

// Message schema
export interface IMessage extends Document {
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
export const Message =
  mongoose.models.Message || mongoose.model<IMessage>("Message", messageSchema);
