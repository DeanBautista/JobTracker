import { useState } from "react";
import { Outlet } from "react-router-dom";
import MobileTabBar from "./MobileTabBar";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { AddJobProvider } from "@/features/jobs";

export default function AppShell() {
  const [navOpen, setNavOpen] = useState(false);

  return (
    <AddJobProvider>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-100 focus:rounded-md focus:bg-ink focus:px-3.5 focus:py-2 focus:text-on-ink"
      >
        Skip to content
      </a>

      <div className="grid min-h-screen grid-cols-[minmax(0,1fr)] shell:grid-cols-[var(--spacing-sidebar)_minmax(0,1fr)]">
        <Sidebar open={navOpen} onClose={() => setNavOpen(false)} />

        <div className="flex min-w-0 flex-col">
          <Topbar onMenuClick={() => setNavOpen(true)} />
          <main
            id="main"
            className="mx-auto w-full max-w-content px-4 pt-5 pb-25 shell:px-7 shell:pt-7 shell:pb-18"
          >
            <Outlet />
          </main>
        </div>
      </div>

      <MobileTabBar />
    </AddJobProvider>
  );
}