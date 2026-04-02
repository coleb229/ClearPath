import { auth } from "../../../../auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { AccountSection } from "@/components/settings/account-section";
import { PreferencesSection } from "@/components/settings/preferences-section";
import { DataSection } from "@/components/settings/data-section";
import { DangerZone } from "@/components/settings/danger-zone";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      image: true,
      createdAt: true,
    },
  });

  if (!user) redirect("/login");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Settings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your account and preferences.
        </p>
      </div>

      <div className="space-y-5">
        <AccountSection
          user={{
            name: user.name,
            email: user.email,
            image: user.image,
            createdAt: user.createdAt.toISOString(),
          }}
        />
        <PreferencesSection />
        <DataSection />
        <DangerZone userEmail={user.email} />
      </div>
    </div>
  );
}
