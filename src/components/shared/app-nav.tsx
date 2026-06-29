"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, TrendingUp, Receipt, ShoppingBag, Wallet, User, Bell, Sparkles,
} from "lucide-react";
import { useNotifications } from "@/hooks/use-notifications";
import { cn } from "@/lib/utils";

const primary = [
  { href: "/dashboard", label: "Panel", icon: LayoutDashboard },
  { href: "/income", label: "Gelir", icon: TrendingUp },
  { href: "/expenses", label: "Gider", icon: Receipt },
  { href: "/spending", label: "Harcama", icon: ShoppingBag },
  { href: "/balance", label: "Kalan", icon: Wallet },
];

export function Sidebar() {
  const pathname = usePathname();
  const { notifications } = useNotifications();
  const secondary = [
    { href: "/notifications", label: "Bildirimler", icon: Bell, badge: notifications.length },
    { href: "/profile", label: "Profil", icon: User, badge: 0 },
  ];

  const Item = ({ href, label, icon: Icon, badge = 0 }: { href: string; label: string; icon: typeof Bell; badge?: number }) => {
    const active = pathname === href;
    return (
      <Link
        href={href}
        className={cn(
          "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
          active ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
        )}
      >
        <Icon className="h-5 w-5" />
        <span className="flex-1">{label}</span>
        {badge > 0 && (
          <span className="grid h-5 min-w-5 place-items-center rounded-full bg-danger px-1.5 text-[11px] font-semibold text-white">
            {badge}
          </span>
        )}
      </Link>
    );
  };

  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col gap-2 border-r border-border bg-card/40 p-4">
      <div className="flex items-center gap-2 px-2 py-4">
        <div className="grid h-9 w-9 place-items-center rounded-xl gradient-brand text-white">
          <Sparkles className="h-5 w-5" />
        </div>
        <span className="text-lg font-semibold tracking-tight">Aile Finans</span>
      </div>
      <nav className="flex flex-col gap-1">
        {primary.map((i) => <Item key={i.href} {...i} />)}
        <div className="my-2 h-px bg-border" />
        {secondary.map((i) => <Item key={i.href} {...i} />)}
      </nav>
    </aside>
  );
}

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 glass border-t border-border">
      <div className="mx-auto flex max-w-md items-center justify-around px-2 pb-[env(safe-area-inset-bottom)]">
        {primary.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition-colors",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className={cn("h-[22px] w-[22px]", active && "scale-110 transition-transform")} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
