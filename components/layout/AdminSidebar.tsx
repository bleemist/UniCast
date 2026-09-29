"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Radio,
  MessageSquare,
  Calendar,
  Layers,
  Users,
  Mic,
  Headphones,
  Newspaper,
  Bell,
  BarChart3,
  Settings,
  LogOut,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";

interface NavGroup {
  label: string;
  items: {
    href: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }[];
}

const ADMIN_NAV_GROUPS: NavGroup[] = [
  {
    label: "STUDIO DESK",
    items: [
      { href: "/admin", label: "Overview", icon: LayoutDashboard },
      { href: "/admin/broadcast", label: "Live Broadcast", icon: Radio, badge: "AIR" },
      { href: "/admin/requests", label: "Song Requests", icon: MessageSquare },
    ],
  },
  {
    label: "PROGRAMMING",
    items: [
      { href: "/admin/programmes", label: "Programmes", icon: Layers },
      { href: "/admin/schedule", label: "Show Schedule", icon: Calendar },
      { href: "/admin/presenters", label: "Presenters", icon: Mic },
    ],
  },
  {
    label: "CONTENT & MEDIA",
    items: [
      { href: "/admin/podcasts", label: "Podcasts / Audio", icon: Headphones },
      { href: "/admin/news", label: "Radio News", icon: Newspaper },
      { href: "/admin/announcements", label: "Announcements", icon: Bell },
    ],
  },
  {
    label: "MANAGEMENT",
    items: [
      { href: "/admin/users", label: "Users & Roles", icon: Users },
      { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
      { href: "/admin/settings", label: "Settings", icon: Settings },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/admin/login";
    } catch {
      window.location.href = "/admin/login";
    }
  };

  return (
    <aside className="w-64 bg-navy-950 border-r border-navy-800 flex flex-col flex-shrink-0 min-h-screen">
      {/* Studio Header Brand */}
      <div className="h-16 border-b border-navy-800 px-5 flex items-center justify-between">
        <Link href="/admin" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-radio-500 flex items-center justify-center text-navy-950 shadow-md">
            <Radio className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-sm tracking-tight text-white block">
              STUDIO DESK
            </span>
            <span className="text-[10px] text-radio-400 font-mono">
              KYU 107.4 FM
            </span>
          </div>
        </Link>

        <Badge variant="live" size="sm">
          READY
        </Badge>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {ADMIN_NAV_GROUPS.map((group) => (
          <div key={group.label} className="space-y-1">
            <div className="px-3 text-[10px] font-bold tracking-wider uppercase text-slate-500 mb-1.5">
              {group.label}
            </div>
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors group",
                    isActive
                      ? "bg-radio-500/15 text-radio-300 font-semibold border border-radio-500/30"
                      : "text-slate-400 hover:text-slate-200 hover:bg-navy-850"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={cn(
                        "w-4 h-4 transition-colors",
                        isActive
                          ? "text-radio-400"
                          : "text-slate-400 group-hover:text-slate-300"
                      )}
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded font-bold bg-live/20 text-red-400 border border-live/30">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* Bottom Profile / Public Site Link / Logout */}
      <div className="p-3 border-t border-navy-800 space-y-1 bg-navy-950/70">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-navy-850 transition-colors"
        >
          <div className="flex items-center gap-2">
            <ExternalLink className="w-3.5 h-3.5 text-radio-400" />
            <span>Open Public Site</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
        </Link>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out of Studio</span>
        </button>
      </div>
    </aside>
  );
}
