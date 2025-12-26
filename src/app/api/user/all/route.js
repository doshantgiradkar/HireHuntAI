import { NextResponse } from "next/server"
import { connect } from "@/lib/db"
import userModel from "@/models/userModel"


export async function GET() {
    try {
        await connect()

        let user = await userModel.find();

        if (!user) {
            return NextResponse.json(
                { message: "No user found" },
                { status: 404 }
            )
        }

        return NextResponse.json({ user }, { status: 200 })
    } catch (error) {
        console.error("GET_USERS_ERROR:", error)

        return NextResponse.json(
            { message: "Failed to fetch user" },
            { status: 500 }
        )
    }
}
