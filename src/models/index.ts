import mongoose, { Schema, Document } from "mongoose";

// User interface and model
export interface IUser extends Document {
  _id: string;
  username: string;
  email?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
  },
  {
    timestamps: true,
  }
);

// Message interface and model
export interface IMessage extends Document {
  _id: string;
  content: string;
  userId: mongoose.Types.ObjectId;
  user: IUser;
  threadId: mongoose.Types.ObjectId;
  parentId?: mongoose.Types.ObjectId | null; // null for main thread messages, messageId for replies
  isAiResponse: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    content: {
      type: String,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    threadId: {
      type: Schema.Types.ObjectId,
      ref: "Thread",
      required: true,
    },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
    isAiResponse: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Thread interface and model
export interface IThread extends Document {
  _id: string;
  title?: string;
  description?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  lastMessageAt: Date;
}

const ThreadSchema = new Schema<IThread>(
  {
    title: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
MessageSchema.index({ threadId: 1, createdAt: 1 });
MessageSchema.index({ parentId: 1, createdAt: 1 });
MessageSchema.index({ threadId: 1, parentId: 1, createdAt: 1 });

// Populate user data automatically
MessageSchema.pre(/^find/, function (this: mongoose.Query<unknown, IMessage>) {
  this.populate({
    path: "userId",
    select: "username email",
  });
});

// Export models
export const User =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
export const Message =
  mongoose.models.Message || mongoose.model<IMessage>("Message", MessageSchema);
export const Thread =
  mongoose.models.Thread || mongoose.model<IThread>("Thread", ThreadSchema);
