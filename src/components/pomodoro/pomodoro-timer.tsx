"use client";

import { useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Settings,
  Coffee,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { usePomodoroStore } from "@/lib/stores/pomodoro-store";
import { cn } from "@/lib/utils";

export function PomodoroTimer() {
  const {
    isRunning,
    mode,
    timeRemaining,
    workDuration,
    completedSessions,
    currentTask,
    start,
    pause,
    reset,
    tick,
    setTask,
    skipToBreak,
    skipToWork,
  } = usePomodoroStore();

  // Request notification permission on mount
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      Notification.requestPermission();
    }
  }, []);

  // Timer tick effect
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [isRunning, tick]);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  }, []);

  const progressPercent =
    mode === "work"
      ? ((workDuration * 60 - timeRemaining) / (workDuration * 60)) * 100
      : 100 - (timeRemaining / (workDuration * 60)) * 100;

  const circumference = 2 * Math.PI * 140; // radius = 140
  const strokeDashoffset =
    circumference - (progressPercent / 100) * circumference;

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-8">
        {/* Mode indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <motion.div
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium",
              mode === "work"
                ? "bg-red-500/10 text-red-500"
                : "bg-green-500/10 text-green-500"
            )}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 0.3 }}
            key={mode}
          >
            {mode === "work" ? (
              <>
                <Target className="h-4 w-4" />
                <span>Focus Time</span>
              </>
            ) : (
              <>
                <Coffee className="h-4 w-4" />
                <span>Break Time</span>
              </>
            )}
          </motion.div>
        </div>

        {/* Timer Circle */}
        <div className="relative flex items-center justify-center mb-8">
          <svg className="w-72 h-72 -rotate-90" viewBox="0 0 300 300">
            {/* Background circle */}
            <circle
              cx="150"
              cy="150"
              r="140"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-muted/20"
            />
            {/* Progress circle */}
            <motion.circle
              cx="150"
              cy="150"
              r="140"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className={cn(
                mode === "work" ? "text-red-500" : "text-green-500"
              )}
              initial={false}
              animate={{ strokeDashoffset }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </svg>

          {/* Timer Display */}
          <div className="absolute flex flex-col items-center">
            <motion.span
              className="text-6xl font-bold tabular-nums"
              key={timeRemaining}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.1 }}
            >
              {formatTime(timeRemaining)}
            </motion.span>
            <span className="text-sm text-muted-foreground mt-2">
              Session {completedSessions + 1}
            </span>
          </div>
        </div>

        {/* Task Input */}
        <div className="mb-6">
          <Input
            placeholder="What are you working on?"
            value={currentTask}
            onChange={(e) => setTask(e.target.value)}
            className="text-center"
          />
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="icon"
            className="h-12 w-12 rounded-full"
            onClick={reset}
          >
            <RotateCcw className="h-5 w-5" />
          </Button>

          <Button
            size="icon"
            className={cn(
              "h-16 w-16 rounded-full",
              mode === "work"
                ? "bg-red-500 hover:bg-red-600"
                : "bg-green-500 hover:bg-green-600"
            )}
            onClick={isRunning ? pause : start}
          >
            {isRunning ? (
              <Pause className="h-8 w-8" />
            ) : (
              <Play className="h-8 w-8 ml-1" />
            )}
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="h-12 w-12 rounded-full"
            onClick={mode === "work" ? skipToBreak : skipToWork}
          >
            <SkipForward className="h-5 w-5" />
          </Button>
        </div>

        {/* Sessions completed */}
        <div className="flex items-center justify-center gap-2 mt-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <motion.div
              key={i}
              className={cn(
                "w-3 h-3 rounded-full",
                i < completedSessions % 4
                  ? "bg-primary"
                  : "bg-muted"
              )}
              animate={{
                scale: i === completedSessions % 4 && isRunning ? [1, 1.2, 1] : 1,
              }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            />
          ))}
        </div>
        <p className="text-center text-sm text-muted-foreground mt-2">
          {completedSessions} sessions completed today
        </p>
      </CardContent>
    </Card>
  );
}
