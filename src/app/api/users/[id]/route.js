// app/api/users/[id]/route.js
import { connect } from "@/lib/db";
import User from "@/models/userModel";

import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  try {
    await connect();
    const user = await User.findById(params.id);

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }
    console.log(user)
    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid user ID" },
      { status: 400 }
    );
  }
}
