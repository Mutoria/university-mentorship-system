import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "STUDENT" | "MENTOR" | "ADMIN";
      avatarInitials: string;
      avatarColor: string;
    } & DefaultSession["user"];
  }

  interface User {
    role: "STUDENT" | "MENTOR" | "ADMIN";
    avatarInitials: string;
    avatarColor: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "STUDENT" | "MENTOR" | "ADMIN";
    avatarInitials: string;
    avatarColor: string;
  }
}