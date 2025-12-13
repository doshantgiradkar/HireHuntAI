// app/api/users/route.js
import { connect } from "@/lib/db";
import User from "@/models/userModel";

import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connect();
    const users = await User.find();
    console.log(users);
    return NextResponse.json(users);
  } catch (error) {
    console.error("API ERROR:", error); 

    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
