// Load environment variables from .env.local if present
require("dotenv").config({ path: ".env.local" });

const mongoose = require("mongoose");

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error(
    "Error: MONGODB_URI environment variable not set. Please define it in .env.local"
  );
  process.exit(1);
}

async function main() {
  try {
    await mongoose.connect(uri, { bufferCommands: false });
    const db = mongoose.connection.db;

    console.log("Creating indexes...");

    await db
      .collection("users")
      .createIndex({ displayName: 1 }, { background: true });
    console.log("- users.displayName index created");

    await db
      .collection("chats")
      .createIndex({ userId: 1, lastMsgAt: -1 }, { background: true });
    console.log("- chats.userId + lastMsgAt index created");

    await db
      .collection("chats")
      .createIndex({ lastMsgAt: -1 }, { background: true });
    console.log("- chats.lastMsgAt index created");

    await db
      .collection("messages")
      .createIndex({ chatId: 1, createdAt: 1 }, { background: true });
    console.log("- messages.chatId + createdAt index created");

    await db
      .collection("messages")
      .createIndex({ parentMsgId: 1, createdAt: 1 }, { background: true });
    console.log("- messages.parentMsgId + createdAt index created");

    console.log("All indexes created successfully");
    process.exit(0);
  } catch (error) {
    console.error("Index creation failed:", error);
    process.exit(1);
  }
}

main();
