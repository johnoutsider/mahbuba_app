"use client";

import { usePathname } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { useAuth } from "@/components/AuthProvider";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

const TITLES: Record<string, string> = {
  "/": "Boshqaruv paneli",
  "/collections": "To'plamlar",
  "/groups": "Guruhlar",
  "/results": "Natijalar",
};

function pageTitle(pathname: string) {
  if (TITLES[pathname]) return TITLES[pathname];
  if (pathname.startsWith("/collections/")) return "To'plam";
  return "";
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Skeleton className="h-8 w-32" />
      </div>
    );
  }
  if (!user) return null; // AuthProvider is already redirecting to /login

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-muted/40">
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-background/80 px-5 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-5" />
          <h1 className="text-base font-semibold tracking-tight">{pageTitle(pathname)}</h1>
        </header>
        <main className="flex-1">
          <div className="mx-auto w-full max-w-6xl px-6 py-8">{children}</div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
