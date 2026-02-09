import type { IProductItem, AddToCartPayload } from "@/lib/ergastirio-interfaces";

type ExistingLine = {
  LINENUM: number;
  MTRL: number;
  QTY2: number;
};

export function buildUpdatedLines(params: {
  cartLines?: IProductItem[];
  product: IProductItem;
  qty: number;
  isDelete?: boolean;
  baseLineNum?: number;
}): ExistingLine[] {
  const { cartLines, product, qty, isDelete, baseLineNum = 9000001 } = params;

  const existingLines: ExistingLine[] =
    cartLines?.map((line, index) => ({
      LINENUM: baseLineNum + index,
      MTRL: Number(line.MTRL),
      QTY2: Number(line.Qty2),
    })) ?? [];

  const clickedMtrl = Number(product.ITEMUID || product.MTRL);

  if (isDelete) {
    return existingLines.filter((l) => l.MTRL !== clickedMtrl);
  }

  const exists = existingLines.some((l) => l.MTRL === clickedMtrl);

  if (exists) {
    return existingLines.map((l) =>
      l.MTRL === clickedMtrl ? { ...l, QTY2: qty } : l,
    );
  }
  return [
    ...existingLines,
    {
      MTRL: clickedMtrl,
      QTY2: qty,
      LINENUM: baseLineNum + existingLines.length,
    },
  ];
}

export const buildFirstBasketKeyPayload = ({
  trdr,
  branch,
}: {
  trdr: number;
  branch: number;
}): AddToCartPayload => ({
  service: "setData",
  OBJECT: "SALDOC",
  KEY: "",
  data: {
    SALDOC: [
      {
        SERIES: "7001",
        TRDR: trdr,
        TRDBRANCH: branch,
        PAYMENT: 1003,
        TRUCKS: 2,
        DELIVDATE: "",
        COMMENTS: "",
        REMARKS: "",
      },
    ],
    MTRDOC: [{ TRUCKS: 2, DELIVDATE: "" }],
    ITELINES: [{ LINENUM: 9000001, MTRL: 2924, QTY2: 0.1 }],
  },
});

export function getGroupChainIconSrc(groupChain?: string) {
  const text = (groupChain ?? "").toUpperCase();
  if (text.includes("L'ARTIGIANO")) return "/group-chain/lartigiano.png";
  if (text.includes("BEAT")) return "/group-chain/beat.png";
  return null;
}
