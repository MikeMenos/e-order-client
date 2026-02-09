"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ergastirioStore } from "@/stores/ergastirioStore";
import ErgastirioAppShell from "@/components/ergastirio/AppShell";

const ERGASTIRIO_SESSION_COOKIE = "ergastirio_session";

function deleteErgastirioSessionCookie() {
  if (typeof document !== "undefined") {
    document.cookie = `${ERGASTIRIO_SESSION_COOKIE}=; path=/; max-age=0`;
  }
}

export default function ErgastirioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    ergastirioStore.persist.rehydrate();
    ergastirioStore.getState().setHydrated();

    const hasCookie =
      typeof document !== "undefined" &&
      document.cookie.includes(`${ERGASTIRIO_SESSION_COOKIE}=1`);
    const hasStoreData =
      (ergastirioStore.getState().clientData?.length ?? 0) > 0 ||
      (ergastirioStore.getState().vat?.length ?? 0) > 0;

    if (hasCookie || hasStoreData) {
      setAllowed(true);
    } else {
      setAllowed(false);
      router.replace("/");
    }
  }, [router]);

  const handleLogout = () => {
    ergastirioStore.getState().resetState();
    ergastirioStore.persist.clearStorage();
    deleteErgastirioSessionCookie();
    router.replace("/");
  };

  if (allowed === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-app-bg">
        <p className="text-slate-500">Loading…</p>
      </div>
    );
  }

  if (!allowed) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-app-bg text-slate-900">
      <ErgastirioAppShell>{children}</ErgastirioAppShell>
    </div>
  );
}
