import { requireMembership } from "@/lib/auth";
import { Sidebar } from "@/components/panel/Sidebar";
import { SupportButton } from "@/components/panel/SupportButton";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const membership = await requireMembership();

  return (
    <div className="flex-1 flex flex-col sm:flex-row">
      <Sidebar businessName={membership.tenant.business_name} businessMode={membership.tenant.business_mode} />
      <div className="flex-1 min-w-0">{children}</div>
      <SupportButton />
    </div>
  );
}
