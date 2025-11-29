import { NextResponse } from "next/server";
import { connect } from "@/lib/db";
import User from "@/models/userModel";

export async function POST(req) {
    try {
        const { user } = await req.json();
        if (!user) {
            return NextResponse.json({ error: "User data is required" }, { status: 400 });
        }
        await connect();
        const { id, email_addresses, first_name, last_name, image_url, role } = user;
        const existingUser = await User.findOne({ clerkId: id });
        if (!existingUser) {
            const newUser = new User({
                clerk_id: id,
                email: email_addresses[0].email_address,
                first_name: first_name,
                last_name: last_name,
                image_url: image_url,
                role: role
            });
            await newUser.save();
            return NextResponse.json({ success: true, message: "User created successfully" });
        } else {
            return NextResponse.json({ success: true, message: "User already exists" });
        }
    } catch (error) {
        console.error("Error creating user:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
