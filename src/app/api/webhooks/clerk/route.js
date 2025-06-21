import { clerkClient } from "@clerk/nextjs/server";

export async function POST(req) {
  const body = await req.json();
  const event = req.headers.get("svix-event-type");

  if (event === "user.created") {
    const userId = body.data.id;

    await clerkClient.users.updateUser(userId, {
      publicMetadata: { role: "candidate" }, // Default role
    });
  }

  return new Response("ok");
}
