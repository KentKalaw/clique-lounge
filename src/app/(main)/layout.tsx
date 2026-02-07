import { ThemeProvider } from "@/components/theme/theme-provider";
import { Sidebar } from "@/components/shared/sidebar";
import { BottomNav } from "@/components/shared/bottom-nav";
import { MiniPlayer } from "@/components/music/mini-player";
import { Toaster } from "@/components/ui/sonner";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <div className="min-h-screen bg-background">
        <Sidebar />
        <main className="md:ml-64 pb-32 md:pb-20">
          {children}
        </main>
        <MiniPlayer />
        <BottomNav />
      </div>
      <Toaster position="top-center" />
    </ThemeProvider>
  );
}
