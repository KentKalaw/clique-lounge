import { ThemeSwitch } from "@/components/theme/theme-switch";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <main className="relative min-h-screen animate-fade-in animate-delay-100">
      <header className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <span className="text-xl font-semibold">Clique Lounge</span>
        <div className="flex items-center gap-4">
          <ThemeSwitch />
        </div>
      </header>
      <section className="flex flex-col items-center justify-center px-6 py-32 text-center">
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight max-w-3xl">
          A Comfy Place to Study and Vibe
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-xl">
          Join your friends, focus together, and make studying feel less like a chore.
        </p>
        <div className="flex gap-4 mt-10">
          <Link href="/login">
            <Button size="lg">Get Started</Button>
          </Link>
         
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-20 max-w-4xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div className="space-y-3">
            <div className="text-3xl">🎧</div>
            <h3 className="font-semibold">Ambient Sounds</h3>
            <p className="text-sm text-muted-foreground">
              Curated lo-fi beats and ambient sounds to help you focus.
            </p>
          </div>
          <div className="space-y-3">
            <div className="text-3xl">👥</div>
            <h3 className="font-semibold">Interactive Study Rooms</h3>
            <p className="text-sm text-muted-foreground">
              Interactive virtual rooms where you can see who's studying, send messages, and share vibes.
            </p>
          </div>
          <div className="space-y-3">
            <div className="text-3xl">⏱️</div>
            <h3 className="font-semibold">Pomodoro Timer</h3>
            <p className="text-sm text-muted-foreground">
              Built-in timer to keep your study sessions productive.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 text-center text-sm text-muted-foreground border-t">
        <p>&copy; 2026 Clique Lounge. All rights reserved.</p>
      </footer>
    </main>
  );
}
