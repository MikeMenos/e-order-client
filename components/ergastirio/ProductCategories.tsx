"use client";

import { Card, CardContent } from "@/components/ui/card";
import type { IFamilyCategories } from "@/lib/ergastirio-interfaces";
import Link from "next/link";
import ErgastirioHeading from "./Heading";
import { ERGASTIRIO_BASE } from "@/lib/ergastirio-constants";
import { useTranslation } from "@/lib/i18n";

const categoryImages: Record<string, string> = {
  DONUT: "/categories/lixoudis.jpg",
  ΑΡΤΟΠΟΙΗΜΑΤΑ: "/categories/diaxeiros.jpg",
  ΣΦΟΛΙΑΤΑ: "/categories/diaxeiros.jpg",
  ΑΛΛΟ: "/categories/allo.jpg",
};

interface ProductCategoriesProps {
  data?: IFamilyCategories[];
}

export default function ErgastirioProductCategories({
  data,
}: ProductCategoriesProps) {
  const { t } = useTranslation();
  return (
    <>
      <ErgastirioHeading
        title={t("erg_select_family")}
        description={t("erg_select_family_description")}
      />
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {data?.map((item, index) => (
          <Link
            href={`${ERGASTIRIO_BASE}/products/${item.FAMILY.trim()}`}
            key={index}
          >
            <CategoryCard key={item.FAMILY} family={item.FAMILY} />
          </Link>
        ))}
      </div>
    </>
  );
}

function CategoryCard({ family }: { family: string }) {
  const key = family.trim();
  const imageSrc = categoryImages[key] ?? "/categories/default.jpg";

  return (
    <Card className="group overflow-hidden border border-slate-200 bg-app-card shadow-sm transition hover:-translate-y-1 hover:border-brand-200 hover:shadow-md">
      <div className="flex justify-center p-4">
        <img
          src={imageSrc}
          alt={family}
          className="h-25 w-25 rounded-full object-cover transition duration-300 group-hover:scale-105"
        />
      </div>
      <CardContent className="p-3 text-center">
        <h3 className="text-sm font-semibold tracking-tight text-brand-600">
          {family}
        </h3>
      </CardContent>
    </Card>
  );
}
