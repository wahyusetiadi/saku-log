import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { supabaseAdmin } from "@/lib/supabase";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password)
          throw new Error("Username dan password diperlukan");

        const { data: user, error } = await supabaseAdmin
          .from("users")
          .select("*")
          .eq("username", credentials.username.toLowerCase())
          .single();

        if (error || !user) throw new Error("Username tidak ditemukan");

        const isValid = await bcrypt.compare(credentials.password, user.password_hash);
        if (!isValid) throw new Error("Password salah");

        return {
          id: user.id,
          name: user.name,
          username: user.username,
          currency: user.currency,
          email: null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = (user as any).username;
        token.currency = (user as any).currency;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.currency = token.currency as string;
      }
      return session;
    },
  },
  pages: { signIn: "/login", error: "/login" },
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  secret: process.env.NEXTAUTH_SECRET,
};