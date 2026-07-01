"use client";

import { cn } from "@/lib/utils";

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  disabled?: boolean;
  "aria-label"?: string;
}

// iOS tarzı animasyonlu switch (açık = yeşil).
export function Switch({ checked, onCheckedChange, disabled, ...rest }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "relative h-7 w-[46px] shrink-0 rounded-full transition-colors duration-200 ease-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-success/40",
        checked ? "bg-success" : "bg-muted",
        disabled && "opacity-50"
      )}
      {...rest}
    >
      <span
        className={cn(
          "absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-sm transition-transform duration-200 ease-out",
          checked ? "translate-x-[20px]" : "translate-x-0.5"
        )}
      />
    </button>
  );
}
