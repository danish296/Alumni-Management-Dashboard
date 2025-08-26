
import { Navbar } from "./navbar";
import { Sidebar } from "./sidebar";
import { Outlet } from "react-router-dom";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Info } from "lucide-react";

export function AppShell() {
  return (
    <div className="flex h-screen flex-col">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto p-6">
          <div className="absolute top-20 right-8 z-10">
            <HoverCard>
              <HoverCardTrigger asChild>
                <button className="rounded-full p-2 bg-primary/10 hover:bg-primary/20 transition-colors duration-200">
                  <Info className="h-4 w-4 text-primary" />
                </button>
              </HoverCardTrigger>
              <HoverCardContent className="w-80 p-4">
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold">AlmaDatum Portal</h4>
                  <p className="text-xs text-muted-foreground">
                    Manage your alumni database efficiently. Use the dashboard to monitor statistics and
                    configure crawlers to automate data collection.
                  </p>
                </div>
              </HoverCardContent>
            </HoverCard>
          </div>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
