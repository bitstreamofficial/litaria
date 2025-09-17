import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { ErrorBoundary } from "@/components/ui/error-boundary";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      {/* <DashboardHeader user={session.user} /> */}
      <div className="flex w-full">
        {/* Sidebar - hidden on mobile, visible on desktop */}
        <div className="hidden lg:block">
          <DashboardSidebar />
        </div>
        <main className="flex-1 min-w-0 p-4 lg:p-6 lg:ml-56">
          <div className="max-w-7xl mx-auto">
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </div>
        </main>
      </div>
    </div>
  );
}