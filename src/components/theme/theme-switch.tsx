"use client"

import * as React from "react"
import { Switch } from "@/components/ui/switch"
import { useTheme } from "next-themes"
import { Sun, Moon } from "lucide-react"
import { cn } from "@/lib/utils"

export function ThemeSwitch() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const isDark = theme === "dark"

  return (
    <div className="flex items-center gap-2">

      <div className="relative h-5 w-5">
        <Sun
          className={cn(
            "absolute h-5 w-5 transition-transform transition-opacity duration-300 ease-in-out",
            isDark
              ? "scale-0 rotate-90 opacity-0"
              : "scale-100 rotate-0 opacity-100 text-yellow-500"
          )}
        />
        <Moon
          className={cn(
            "absolute h-5 w-5 transition-transform transition-opacity duration-300 ease-in-out",
            isDark
              ? "scale-100 rotate-0 opacity-100 text-blue-400"
              : "scale-0 -rotate-90 opacity-0"
          )}
        />
      </div>


      <Switch
        checked={isDark}
        onCheckedChange={(checked) =>
          setTheme(checked ? "dark" : "light")
        }
      />
    </div>
  )
}