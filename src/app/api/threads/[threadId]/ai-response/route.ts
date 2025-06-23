import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { User, Thread, Message } from "@/models";
import { createAIResponse } from "@/lib/aiService";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ threadId: string }> }
) {
  try {
    await dbConnect();

    const { threadId } = await params;
    const { parentId } = await request.json();

    // Verify thread exists
    const thread = await Thread.findById(threadId);
    if (!thread) {
      return NextResponse.json({ error: "Thread not found" }, { status: 404 });
    }

    // If parentId is provided, verify the parent message exists
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

    // Find or create AI user
    let aiUser = await User.findOne({ username: "AI Assistant" });
    if (!aiUser) {
      aiUser = new User({
        username: "AI Assistant",
        email: "ai@assistant.com",
      });
      await aiUser.save();
    }

    // Generate AI response
    const aiMessage = await createAIResponse(threadId, aiUser._id, parentId);

    // Update thread's lastMessageAt
    await Thread.findByIdAndUpdate(threadId, {
      lastMessageAt: new Date(),
    });

    return NextResponse.json({ message: aiMessage }, { status: 201 });
  } catch (error) {
    console.error("Error generating AI response:", error);
    return NextResponse.json(
      { error: "Failed to generate AI response" },
      { status: 500 }
    );
  }
}
