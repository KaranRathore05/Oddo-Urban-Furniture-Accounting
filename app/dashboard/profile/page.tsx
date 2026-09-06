import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import ProfileForm from "@/components/dashboard/ProfileForm";

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) return redirect("/login");

  const user = await prisma.user.findUnique({ where: { id: session.id } });

  return (
    <div>
      <div className="page-header">
        <h1>User Profile</h1>
      </div>

      <ProfileForm user={user} />
    </div>
  );
}
