"use client";

import Link from "next/link";
import { Sparkles, User } from "lucide-react";
import { NotificationsBell } from "@/components/shared/notifications-bell";

export function MobileTopBar() {
  return (
    <header className="lg:hidden sticky top-0 z-30 glass border-b border-border pt-safe">
      <div className="flex items-center justify-between px-4 py-3">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg gradient-brand text-white">
            <Sparkles className="h-[18px] w-[18px]" />
          </span>
          <span className="font-semibold tracking-tight">Aile Finans</span>
        </Link>
        <div className="flex items-center gap-1">
          <NotificationsBell />
          <Link
            href="/profile"
            aria-label="Profil"
            className="grid h-10 w-10 place-items-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <User className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </header>
  );
}
