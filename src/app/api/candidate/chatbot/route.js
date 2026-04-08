// import { checkAuth } from "@/utils/checkAuth";
// import { NextResponse } from "next/server";
// import OpenAI from "openai";

// export async function POST(request) {
//   const authResult = await checkAuth({ allowedRoles: ["candidate"] });
//   if (authResult.status !== 200) {
//     return NextResponse.json(
//       { error: authResult.error },
//       { status: authResult.status },
//     );
//   }

//   const { message } = await request.json();
//   console.log("Received message:", message);

//   const openai = new OpenAI({
//     apiKey: process.env.OPENAI_API,
//   });

//   const resumeText = await ;

//   const response = await openai.chat.completions.create({
//     model: "gpt-4o-mini",
//     messages: [
//       { role: "system", content: "" },
//       { role: "user", content: message },
//     ],
//   });

//   return NextResponse.json({ reply: response.choices[0].message.content });
// }
