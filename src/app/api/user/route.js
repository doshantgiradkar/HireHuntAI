import { NextResponse } from "next/server";
import { connect } from "@/lib/db";
import userModel from "@/models/userModel";
import { checkAuth } from "@/utils/checkAuth";

export async function GET() {
  try {
    await connect();

    const { userId } = await checkAuth({ allowedRoles: ["candidate"] });

    let user = await userModel.findOne({ clerkId: userId });

    console.log(user);
    if (!user) {
      return NextResponse.json(
        { message: `User not found with id: ${userId}` },
        { status: 404 },
      );
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error("GET_USER_ERROR:", error);

    return NextResponse.json(
      { message: "Failed to fetch user" },
      { status: 500 },
    );
  }
}
