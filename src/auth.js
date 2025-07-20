export const runtime = 'nodejs'
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
// import Nodemailer from "next-auth/providers/nodemailer";
// import Credentials from "next-auth/providers/credentials"
// import client from "./lib/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google,
    GitHub,
    // Nodemailer({
    //   server: process.env.EMAIL_SERVER,
    //   from: process.env.EMAIL_FROM,
    // }),
  ],
});
