"use client";

import Link from "next/link";
import { ergastirioStore } from "@/stores/ergastirioStore";
import { getGroupChainIconSrc } from "@/lib/ergastirio-utils";
import type { ClientResponse } from "@/lib/ergastirio-interfaces";

interface LogoProps {
  pathname: string;
  clientData?: ClientResponse | null;
}

export function ErgastirioLogo({ pathname, clientData }: LogoProps) {
  const currentBranch = ergastirioStore((s) => s.currentBranch);
  const groupChain = clientData?.data?.[0]?.GROUP_CHAIN;
  const headerIconSrc = getGroupChainIconSrc(groupChain);

  const logoContent = (
    <>
      {headerIconSrc ? (
        <img
          src={headerIconSrc}
          alt="Group icon"
          width={80}
          height={80}
          className="object-contain"
        />
      ) : (
        <img
          src="/assets/logo.png"
          alt="E-Order"
          width={60}
          height={60}
          className={`object-contain ${
            pathname.startsWith("/ergastirio/products") &&
            currentBranch?.GROUP_CHAIN !== "L'ARTIGIANO"
              ? "hidden md:block"
              : "block"
          }`}
        />
      )}
    </>
  );

  if (
    pathname === "/ergastirio/stores" ||
    (currentBranch?.GROUP_CHAIN === "L'ARTIGIANO" &&
      pathname.startsWith("/ergastirio/products"))
  ) {
    return <div className="flex items-center shrink-0">{logoContent}</div>;
  }

  return (
    <Link href="/ergastirio" className="flex items-center shrink-0">
      {logoContent}
    </Link>
  );
}
