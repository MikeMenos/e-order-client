"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import ErgastirioHeader from "./Header";
import ErgastirioFooter from "./Footer";

export default function ErgastirioAppShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  return (
    <div className={cn("flex min-h-0 w-full flex-1 flex-col", className)}>
      {!isLoginPage && <ErgastirioHeader />}
      <main className="mx-auto w-full max-w-6xl flex-1 px-3 py-2">
        {children}
      </main>
      {!isLoginPage && <ErgastirioFooter />}
    </div>
  );
}
