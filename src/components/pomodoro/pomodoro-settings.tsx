"use client";

import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePomodoroStore } from "@/lib/stores/pomodoro-store";

export function PomodoroSettings() {
  const {
    workDuration,
    breakDuration,
    longBreakDuration,
    sessionsUntilLongBreak,
    autoStartBreaks,
    autoStartWork,
    setWorkDuration,
    setBreakDuration,
    setLongBreakDuration,
    setSessionsUntilLongBreak,
    toggleAutoStartBreaks,
    toggleAutoStartWork,
  } = usePomodoroStore();

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Timer Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Work Duration */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Focus Duration</Label>
            <span className="text-sm font-medium">{workDuration} min</span>
          </div>
          <Slider
            value={[workDuration]}
            min={5}
            max={60}
            step={5}
            onValueChange={(value) => setWorkDuration(value[0])}
          />
        </div>

        {/* Break Duration */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Short Break</Label>
            <span className="text-sm font-medium">{breakDuration} min</span>
          </div>
          <Slider
            value={[breakDuration]}
            min={1}
            max={15}
            step={1}
            onValueChange={(value) => setBreakDuration(value[0])}
          />
        </div>

        {/* Long Break Duration */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Long Break</Label>
            <span className="text-sm font-medium">{longBreakDuration} min</span>
          </div>
          <Slider
            value={[longBreakDuration]}
            min={5}
            max={30}
            step={5}
            onValueChange={(value) => setLongBreakDuration(value[0])}
          />
        </div>

        {/* Sessions until long break */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Sessions until long break</Label>
            <span className="text-sm font-medium">{sessionsUntilLongBreak}</span>
          </div>
          <Slider
            value={[sessionsUntilLongBreak]}
            min={2}
            max={8}
            step={1}
            onValueChange={(value) => setSessionsUntilLongBreak(value[0])}
          />
        </div>

        {/* Auto-start settings */}
        <div className="space-y-4 pt-4 border-t">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto-start Breaks</Label>
              <p className="text-sm text-muted-foreground">
                Automatically start break when focus ends
              </p>
            </div>
            <Switch
              checked={autoStartBreaks}
              onCheckedChange={toggleAutoStartBreaks}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Auto-start Focus</Label>
              <p className="text-sm text-muted-foreground">
                Automatically start focus when break ends
              </p>
            </div>
            <Switch
              checked={autoStartWork}
              onCheckedChange={toggleAutoStartWork}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
