import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Message, Thread } from "@/models";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ threadId: string }> }
) {
  try {
    await dbConnect();

    const { threadId } = await params;
    const { searchParams } = new URL(request.url);
    const parentId = searchParams.get("parentId"); // Build query based on whether we want main thread or reply thread messages
    const query: { threadId: string; parentId?: string | null } = { threadId };

    if (parentId) {
      // Get messages in a specific reply thread
      query.parentId = parentId;
    } else {
      // Get main thread messages (parentId is null)
      query.parentId = null;
    }

    const messages = await Message.find(query)
      .populate("userId", "username email")
      .sort({ createdAt: 1 });

    // If getting reply thread messages, also include the parent message
    let allMessages = messages;
    if (parentId) {
      const parentMessage = await Message.findById(parentId).populate(
        "userId",
        "username email"
      );

      if (parentMessage) {
        allMessages = [parentMessage, ...messages];
      }
    }

    return NextResponse.json({ messages: allMessages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ threadId: string }> }
) {
  try {
    await dbConnect();

    const { threadId } = await params;
    const { content, userId, parentId } = await request.json();

    if (!content || !userId) {
      return NextResponse.json(
        { error: "Content and user ID are required" },
        { status: 400 }
      );
    }

    // Verify thread exists
    const thread = await Thread.findById(threadId);
    if (!thread) {
      return NextResponse.json({ error: "Thread not found" }, { status: 404 });
    }

    // If parentId is provided, verify the parent message exists and belongs to this thread
    if (parentId) {
      const parentMessage = await Message.findOne({
        _id: parentId,
        threadId,
      });

      if (!parentMessage) {
        return NextResponse.json(
          { error: "Parent message not found in this thread" },
          { status: 404 }
        );
      }
    }

    // Create the message
    const message = new Message({
      content,
      userId,
      threadId,
      parentId: parentId || null,
      isAiResponse: false,
    });

    await message.save();
    await message.populate("userId", "username email");

    // Update thread's lastMessageAt
    await Thread.findByIdAndUpdate(threadId, {
      lastMessageAt: new Date(),
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error("Error creating message:", error);
    return NextResponse.json(
      { error: "Failed to create message" },
      { status: 500 }
    );
  }
}
