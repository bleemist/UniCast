import prisma from "@/lib/prisma";
import { getServerSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Settings, Radio, Mail, Phone, Globe } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { SettingsForm } from "./SettingsForm";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const session = await getServerSession();
  if (!session) {
    redirect("/admin/login");
  }

  const settings = await prisma.radioSetting.findUnique({
    where: { id: "station_settings" },
  });

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-radio-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-radio-400">
            System Configuration
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Station Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Radio identity, broadcasting metadata, and university contact information.
        </p>
      </div>

      <Card className="border-navy-800 bg-navy-850/80 max-w-3xl">
        <CardHeader className="pb-4 border-b border-navy-750">
          <CardTitle className="text-base text-white">General Information</CardTitle>
          <CardDescription className="text-xs">
            These values are displayed across the public player and site headers.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <SettingsForm initialSettings={settings} />
        </CardContent>
      </Card>
    </div>
  );
}
