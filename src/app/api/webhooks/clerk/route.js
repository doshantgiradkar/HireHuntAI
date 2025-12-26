export const runtime = "nodejs";

import { Webhook } from "svix";
import { NextResponse } from "next/server";
import { connect } from "@/lib/db";
import User from "@/models/userModel";
import { strict } from "assert";


export async function POST(req) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) {
    throw new Error("Missing CLERK_WEBHOOK_SECRET");
  }

  const svix_id = req.headers.get("svix-id");
  const svix_timestamp = req.headers.get("svix-timestamp");
  const svix_signature = req.headers.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Missing svix headers", { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);

  let evt;
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });
  } catch (err) {
    console.error("Webhook verification failed:", err);
    return new Response("Invalid signature", { status: 400 });
  }

  const eventType = evt.type;
  const data = evt.data;

  try {
    await connect();

    if (eventType === "user.created" || eventType === "user.updated") {
      const email = data.email_addresses?.[0]?.email_address;

      if (!email) {
        return new Response("No email found", { status: 400 });
      }

      await User.findOneAndUpdate(
        { clerkId: data.id },
        {
          clerkId: data.id,
          email,
          firstName: data.first_name,
          lastName: data.last_name,
          imageUrl: data.image_url,
          role: data.public_metadata?.role || "candidate",
        },
        { upsert: true, new: true,strict:false }
      );

      if(data.public_metadata?.role == "recruiter"){
      }
      
      console.log(`User synced: ${data.id}`);
    }

    return new Response("", { status: 200 });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return new Response("Webhook error", { status: 500 });
  }
}
