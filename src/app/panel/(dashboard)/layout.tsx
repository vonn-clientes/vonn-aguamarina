import { requireMembership } from "@/lib/auth";
import { Sidebar } from "@/components/panel/Sidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await requireMembership();

  return (
    <div className="flex-1 flex flex-col sm:flex-row">
      <Sidebar />
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
