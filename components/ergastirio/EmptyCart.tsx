"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ERGASTIRIO_BASE } from "@/lib/ergastirio-constants";
import { useTranslation } from "@/lib/i18n";

export default function ErgastirioEmptyCart() {
  const { t } = useTranslation();
  return (
    <Card className="mx-auto max-w-md rounded-2xl border-dashed border-slate-200 bg-app-card">
      <CardHeader className="flex flex-col items-center gap-2 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
          <ShoppingCart className="h-6 w-6 text-slate-500" />
        </div>
        <CardTitle className="text-slate-900">
          {t("erg_cart_empty_title")}
        </CardTitle>
        <CardDescription className="text-slate-500">
          {t("erg_cart_empty_description")}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center">
        <Button asChild className="rounded-xl bg-brand-500 hover:bg-brand-600">
          <Link href={ERGASTIRIO_BASE}>{t("erg_cart_back_home")}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
