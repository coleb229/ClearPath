"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon, Monitor, Palette } from "lucide-react";

const THEMES = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const;

export function PreferencesSection() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <div className="rounded-xl border border-border bg-card animate-fade-up animate-delay-1">
      <div className="flex items-center gap-3 border-b border-border px-5 py-4">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <Palette className="h-4 w-4 text-primary" />
        </span>
        <h2 className="text-sm font-semibold text-foreground">Preferences</h2>
      </div>

      <div className="p-5">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Appearance</p>
              <p className="text-xs text-muted-foreground">
                Choose your preferred color theme
              </p>
            </div>
          </div>

          <div className="inline-flex rounded-lg border border-border bg-muted/50 p-1 gap-1">
            {THEMES.map(({ value, label, icon: Icon }) => {
              const active = mounted && theme === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setTheme(value)}
                  className={`flex items-center gap-2 rounded-md px-3.5 py-2 text-sm font-medium transition-all duration-(--dur-state) ease-(--ease-out-quart) ${
                    active
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
