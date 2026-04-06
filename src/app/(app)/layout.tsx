import { redirect } from "next/navigation";
import { auth } from "../../../auth";
import { AppSidebar } from "@/components/nav/app-sidebar";
import { MobileNav } from "@/components/nav/mobile-nav";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="flex min-h-dvh">
      <MobileNav user={session.user} />
      <AppSidebar user={session.user} />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-8 pb-8">
          {children}
        </div>
      </main>
    </div>
  );
}
