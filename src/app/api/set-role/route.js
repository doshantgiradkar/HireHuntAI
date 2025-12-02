import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { connect } from "@/lib/db";
import User from "@/models/userModel";

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
        const client = await clerkClient(); // ✅ get the actual client object
        await client.users.updateUser(userId, {
            publicMetadata: { role },
        });

        await connect();
        const user = await User.findOne({ clerk_id: userId });

        if (user) {
            user.role = role;
            await user.save();
        } else {
            console.log("user not found");
        }
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("Failed to update metadata:", err); // ✅ log actual error
        return NextResponse.json(
            { error: "Failed to update metadata" },
            { status: 500 }
        );
    }
}
