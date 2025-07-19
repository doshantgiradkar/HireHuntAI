// src/auth.ts
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import Nodemailer from "next-auth/providers/nodemailer"
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import client from "./lib/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: MongoDBAdapter(client),
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email", placeholder: "johndoe@gmail.com" },
        password: { label: "Password", type: "password", placeholder: "*****" },
      },
      authorize: async (credentials) => {
        try {
          const { email, password } = await signInSchema.parseAsync(credentials);
          const pwHash = saltAndHashPassword(password);
          const user = await getUserFromDb(email, pwHash);
          if (!user) throw new Error("Invalid credentials.");
          if (!user.emailVerified) throw new Error("Please verify your email.");
          return user;
        } catch (error) {
          if (error instanceof ZodError) return null;
          throw error;
        }
      },
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Nodemailer({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM,
      // Verification link will be sent automatically
    }),
  ],
  callbacks: {
    async session({ session, user, token }) {
      session.user.id = user?.id || token?.sub;
      session.user.role = user?.role || token?.role;
      session.user.emailVerified = user?.emailVerified || token?.emailVerified;
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.emailVerified = user.emailVerified;
      }
      return token;
    },
  },
  pages: {
    signIn: "/login",
    verifyRequest: "/verify", 
    error: "/login", 
  },
});
