import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { MessagingInterface } from "@/components/layout/MessagingInterface";

export default async function MentorMessagesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-charcoal dark:text-white">
          Messages
        </h1>
        <p className="mt-1 text-sm text-slate">
          Chat with your mentees.
        </p>
      </div>
      <MessagingInterface currentUserId={session.user.id} />
    </div>
  );
}
