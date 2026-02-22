"use client";

import { usePathname } from "next/navigation";
import { NavbarContextProvider } from "./_components/Navbar/context";
import { HeaderProvider } from "./_components/Header/context";
import { TopNavbar } from "./_components/Navbar/TopNavbar";
import { DesktopSidebar } from "./_components/Navbar/DesktopSidebar";
import { MobileBottomNav } from "./_components/Navbar/MobileBottomNav";
import { Header } from "./_components/Header/Header";

export default function MarketplaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  if (isHomePage) {
    return (
      <NavbarContextProvider>
        <div className="min-h-screen flex flex-col">
          <TopNavbar />
          <main className="flex-1">{children}</main>
        </div>
      </NavbarContextProvider>
    );
  }

  return (
    <NavbarContextProvider>
      <HeaderProvider>
        {/* Desktop: sidebar + content */}
        <div className="hidden md:flex h-screen overflow-hidden">
          <DesktopSidebar />
          <main className="flex-1 flex flex-col overflow-hidden">
            <Header />
            <div className="flex-1 overflow-y-auto scrollbar-hidden">
              {children}
            </div>
          </main>
        </div>

        {/* Mobile: full width with bottom nav */}
        <div className="md:hidden flex flex-col min-h-screen">
          <div className="flex-1 pb-16 overflow-y-auto">
            {children}
          </div>
          <MobileBottomNav />
        </div>
      </HeaderProvider>
    </NavbarContextProvider>
  );
}
