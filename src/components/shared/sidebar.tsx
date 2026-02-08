"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Search,
  PlusSquare,
  Timer,
  User,
  Music,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeSwitch } from "@/components/theme/theme-switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const mainNavItems = [
  { href: "/feed", icon: Home, label: "Feed" },
  { href: "/explore", icon: Search, label: "Explore" },
  { href: "/create", icon: PlusSquare, label: "Create" },
  { href: "/stories", icon: PlusSquare, label: "Stories" },];

const toolNavItems = [
  { href: "/pomodoro", icon: Timer, label: "Pomodoro" },
  { href: "/music", icon: Music, label: "Music" },
];

const accountNavItems = [
  { href: "/profile", icon: User, label: "Profile" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Failed to log out");
      return;
    }
    toast.success("Logged out successfully");
    router.push("/");
  };

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen border-r bg-background fixed left-0 top-0">
      <div className="flex items-center justify-between p-4">
        <Link href="/feed" className="text-xl font-bold">
          Clique Lounge
        </Link>
        <ThemeSwitch />
      </div>

      <Separator />

      <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
        {/* Main Navigation */}
        <div className="space-y-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Social
          </p>
          {mainNavItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Tools Navigation */}
        <div className="space-y-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Tools
          </p>
          {toolNavItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Account Navigation */}
        <div className="space-y-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Account
          </p>
          {accountNavItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <Separator />

      <div className="p-4">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
          <span>Log out</span>
        </Button>
      </div>
    </aside>
  );
}
