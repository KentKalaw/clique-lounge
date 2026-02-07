"use client";

import { useEffect } from "react";
import { PomodoroTimer } from "@/components/pomodoro/pomodoro-timer";
import { PomodoroSettings } from "@/components/pomodoro/pomodoro-settings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Timer, Settings, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePomodoroStore } from "@/lib/stores/pomodoro-store";
import { supabase } from "@/lib/supabase/client";

export default function PomodoroPage() {
  const { completedSessions, workDuration, setUserId } = usePomodoroStore();
  
  // Load user-specific data on mount
  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    loadUser();
  }, [setUserId]);
  
  // Calculate today's stats
  const totalMinutes = completedSessions * workDuration;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return (
    <div className="max-w-2xl mx-auto p-4 animate-fade-in animate-delay-100">
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Focus Mode</h1>
        <p className="text-muted-foreground">
          Stay productive with the Pomodoro technique
        </p>
      </header>

      <Tabs defaultValue="timer" className="w-full">
        <TabsList className="w-full grid grid-cols-3 mb-6">
          <TabsTrigger value="timer" className="flex items-center gap-2">
            <Timer className="h-4 w-4" />
            Timer
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Stats
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="timer" className="mt-0">
          <PomodoroTimer />
        </TabsContent>

        <TabsContent value="stats" className="mt-0">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Today&apos;s Sessions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{completedSessions}</div>
                <p className="text-sm text-muted-foreground">
                  Focus sessions completed
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Focus Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {hours}h {minutes}m
                </div>
                <p className="text-sm text-muted-foreground">
                  Time spent focusing
                </p>
              </CardContent>
            </Card>
            <Card className="md:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Weekly Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-2 h-32">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                    (day, i) => {
                      const height = Math.random() * 100;
                      const isToday = i === new Date().getDay() - 1;
                      return (
                        <div
                          key={day}
                          className="flex-1 flex flex-col items-center gap-2"
                        >
                          <div
                            className={`w-full rounded-t ${
                              isToday ? "bg-primary" : "bg-muted"
                            }`}
                            style={{ height: `${height}%` }}
                          />
                          <span
                            className={`text-xs ${
                              isToday
                                ? "font-semibold text-primary"
                                : "text-muted-foreground"
                            }`}
                          >
                            {day}
                          </span>
                        </div>
                      );
                    }
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="mt-0">
          <PomodoroSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
