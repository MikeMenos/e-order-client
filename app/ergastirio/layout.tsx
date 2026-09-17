"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ergastirioStore } from "@/stores/ergastirioStore";
import { ERGASTIRIO_INTRO_SESSION_KEY } from "@/lib/ergastirio-constants";
import ErgastirioAppShell from "@/components/ergastirio/AppShell";
import { ErgastirioLoginIntro } from "@/components/ergastirio/LoginIntro";
import { Spinner } from "@/components/ui/spinner";

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
  const [showLoginIntro, setShowLoginIntro] = useState(false);

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
      if (
        typeof sessionStorage !== "undefined" &&
        sessionStorage.getItem(ERGASTIRIO_INTRO_SESSION_KEY) === "1"
      ) {
        sessionStorage.removeItem(ERGASTIRIO_INTRO_SESSION_KEY);
        setShowLoginIntro(true);
      }
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

  const bgClass = "min-h-dvh bg-cover bg-center bg-no-repeat text-slate-900";
  const bgStyle = { backgroundImage: "url(/assets/background.png)" };

  if (allowed === null) {
    return (
      <div
        className={`flex items-center justify-center min-h-dvh ${bgClass}`}
        style={bgStyle}
      >
        <Spinner size={40} />
      </div>
    );
  }

  if (!allowed) {
    return null;
  }

  return (
    <div className={`flex flex-col ${bgClass}`} style={bgStyle}>
      {showLoginIntro && (
        <ErgastirioLoginIntro onComplete={() => setShowLoginIntro(false)} />
      )}
      <ErgastirioAppShell className={showLoginIntro ? "invisible" : undefined}>
        {children}
      </ErgastirioAppShell>
    </div>
  );
}
