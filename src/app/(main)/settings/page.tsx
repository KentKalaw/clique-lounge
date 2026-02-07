"use client";

import { ArrowLeft, User, Bell, Lock, Palette, HelpCircle, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ThemeSwitch } from "@/components/theme/theme-switch";
import { AvatarSettings } from "@/components/settings";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";

export default function SettingsPage() {
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
    <div className="max-w-xl mx-auto animate-fade-in animate-delay-100">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="flex items-center h-14 px-4 gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Settings</h1>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {/* Account */}
        <Card>
          <CardContent className="p-0">
            <div className="p-4 flex items-center gap-3">
              <User className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">Account</span>
            </div>
            <Separator />
            <AvatarSettings />
            <Separator />
            <button className="w-full p-4 text-left hover:bg-accent transition-colors">
              <p className="font-medium">Edit Profile</p>
              <p className="text-sm text-muted-foreground">
                Update your personal information
              </p>
            </button>
            <Separator />
            <button className="w-full p-4 text-left hover:bg-accent transition-colors">
              <p className="font-medium">Change Password</p>
              <p className="text-sm text-muted-foreground">
                Update your password
              </p>
            </button>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardContent className="p-0">
            <div className="p-4 flex items-center gap-3">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">Notifications</span>
            </div>
            <Separator />
            <div className="p-4 flex items-center justify-between">
              <div>
                <p className="font-medium">Push Notifications</p>
                <p className="text-sm text-muted-foreground">
                  Receive push notifications
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="p-4 flex items-center justify-between">
              <div>
                <p className="font-medium">Pomodoro Notifications</p>
                <p className="text-sm text-muted-foreground">
                  Get notified when sessions end
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="p-4 flex items-center justify-between">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-muted-foreground">
                  Receive email updates
                </p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        {/* Privacy */}
        <Card>
          <CardContent className="p-0">
            <div className="p-4 flex items-center gap-3">
              <Lock className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">Privacy</span>
            </div>
            <Separator />
            <div className="p-4 flex items-center justify-between">
              <div>
                <p className="font-medium">Private Account</p>
                <p className="text-sm text-muted-foreground">
                  Only followers can see your posts
                </p>
              </div>
              <Switch />
            </div>
            <Separator />
            <div className="p-4 flex items-center justify-between">
              <div>
                <p className="font-medium">Show Activity Status</p>
                <p className="text-sm text-muted-foreground">
                  Let others see when you&apos;re online
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card>
          <CardContent className="p-0">
            <div className="p-4 flex items-center gap-3">
              <Palette className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">Appearance</span>
            </div>
            <Separator />
            <div className="p-4 flex items-center justify-between">
              <div>
                <p className="font-medium">Theme</p>
                <p className="text-sm text-muted-foreground">
                  Toggle between light and dark mode
                </p>
              </div>
              <ThemeSwitch />
            </div>
          </CardContent>
        </Card>

        {/* Help */}
        <Card>
          <CardContent className="p-0">
            <div className="p-4 flex items-center gap-3">
              <HelpCircle className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">Help & Support</span>
            </div>
            <Separator />
            <button className="w-full p-4 text-left hover:bg-accent transition-colors">
              <p className="font-medium">Help Center</p>
            </button>
            <Separator />
            <button className="w-full p-4 text-left hover:bg-accent transition-colors">
              <p className="font-medium">Report a Problem</p>
            </button>
            <Separator />
            <button className="w-full p-4 text-left hover:bg-accent transition-colors">
              <p className="font-medium">Terms of Service</p>
            </button>
            <Separator />
            <button className="w-full p-4 text-left hover:bg-accent transition-colors">
              <p className="font-medium">Privacy Policy</p>
            </button>
          </CardContent>
        </Card>

        {/* Logout */}
        <Button
          variant="destructive"
          className="w-full"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Log Out
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Clique Lounge v1.0.0
        </p>
      </div>
    </div>
  );
}
