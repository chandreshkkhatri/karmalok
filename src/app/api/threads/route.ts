import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { Thread, User } from "@/models";

export async function GET() {
  try {
    await dbConnect();

    const threads = await Thread.find()
      .populate("createdBy", "username")
      .sort({ lastMessageAt: -1 });

    return NextResponse.json({ threads });
  } catch (error) {
    console.error("Error fetching threads:", error);
    return NextResponse.json(
      { error: "Failed to fetch threads" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const { title, description, createdBy } = await request.json();

    if (!createdBy) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Ensure user exists
    const user = await User.findById(createdBy);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const thread = new Thread({
      title: title || "New Chat",
      description,
      createdBy,
    });

    await thread.save();
    await thread.populate("createdBy", "username");

    return NextResponse.json({ thread }, { status: 201 });
  } catch (error) {
    console.error("Error creating thread:", error);
    return NextResponse.json(
      { error: "Failed to create thread" },
      { status: 500 }
    );
  }
}
