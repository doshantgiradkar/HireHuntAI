import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { connect } from '@/lib/db';
import User from '@/models/userModel';
export async function POST(req) {
    // You can find this in the Clerk Dashboard -> Webhooks -> choose the webhook
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
    if (!WEBHOOK_SECRET) {
        throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local');
    }

    const headerPayload = headers();
    const svix_id = headerPayload.get("svix-id");
    const svix_timestamp = headerPayload.get("svix-timestamp");
    const svix_signature = headerPayload.get("svix-signature");

    if (!svix_id || !svix_timestamp || !svix_signature) {
        return new Response('Error occured -- no svix headers', {
            status: 400
        });
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
        console.error('Error verifying webhook:', err);
        return new Response('Error occured', {
            status: 400
        });
    }

    const { id } = evt.data;
    const eventType = evt.type;
    console.log(`Webhook with an ID of ${id} and type of ${eventType}`);

    try {
        await connect();
        if (eventType === 'user.created') {
            const { id, email_addresses, first_name, last_name, image_url } = evt.data;

            const newUser = new User({
                clerk_id: id,
                email: email_addresses[0].email_address,
                first_name: first_name,
                last_name: last_name,
                image_url: image_url,
            });
            await newUser.save();
            console.log('New user created:', newUser);
        }
        if (eventType === 'user.updated') {
            const { id, first_name, last_name, image_url, role } = evt.data;
            await User.findOneAndUpdate(
                { clerk_id: id },
                {
                    first_name: first_name,
                    last_name: last_name,
                    image_url: image_url,
                    role: role
                }
            );
            console.log('User updated:', id);
        }
        return new Response('', { status: 200 });
    } catch (error) {
        console.error('Error processing webhook:', error);
        return new Response('Error occured', { status: 500 });
    }
}
