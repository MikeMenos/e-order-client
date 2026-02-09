"use client";

import { usePathname } from "next/navigation";
import ErgastirioHeader from "./Header";
import ErgastirioFooter from "./Footer";

export default function ErgastirioAppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  return (
    <>
      {!isLoginPage && <ErgastirioHeader />}
      <main className="mx-auto w-full max-w-6xl py-2 px-3 flex-1">
        {children}
      </main>
      {!isLoginPage && <ErgastirioFooter />}
    </>
  );
}
