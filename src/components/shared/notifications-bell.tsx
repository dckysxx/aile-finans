"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import { useNotifications } from "@/hooks/use-notifications";

export function NotificationsBell({ className = "" }: { className?: string }) {
  const { notifications } = useNotifications();
  const count = notifications.length;
  return (
    <Link
      href="/notifications"
      aria-label="Bildirimler"
      className={`relative grid h-10 w-10 place-items-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground ${className}`}
    >
      <Bell className="h-5 w-5" />
      {count > 0 && (
        <span className="absolute right-1.5 top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-danger px-1 text-[10px] font-semibold text-white">
          {count}
        </span>
      )}
    </Link>
  );
}
