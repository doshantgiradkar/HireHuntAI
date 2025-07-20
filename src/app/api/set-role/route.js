import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req) {
  const { userId } = await auth();
  const body = await req.json();
  const { role } = body;

  console.log("userId:", userId);
  console.log("role:", role);

  if (!userId || !role) {
    return NextResponse.json(
      { error: "Unauthorized or missing role" },
      { status: 400 }
    );
  }

  try {
    // ✅ get the actual client object
    const client = await clerkClient(); 
    await client.users.updateUser(userId, {
      publicMetadata: { role },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to update metadata:", err); // ✅ log actual error
    return NextResponse.json(
      { error: "Failed to update metadata" },
      { status: 500 }
    );
  }
}
