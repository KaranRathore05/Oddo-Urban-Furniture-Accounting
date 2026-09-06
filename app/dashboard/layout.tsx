import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { SidebarNav } from "./SidebarNav";
import UserMenu from "@/components/dashboard/UserMenu";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  return (
    <div className="dashboard-layout">
      <SidebarNav user={session} />
      <div className="main-content">
        <div className="topbar">
          <div />
          <UserMenu user={session} />
        </div>
        <div className="page-content">{children}</div>
      </div>
    </div>
  );
}
