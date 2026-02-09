export interface ClientResponse {
  success: boolean;
  count: number;
  data: IStoreInfo[];
}

export interface IStoreInfo {
  TRDR: string;
  KEY_CODE: string;
  BRANCH: string;
  TYPOS: string;
  BRANCHES: string;
  NAME: string;
  AFM: string;
  ADDRESS: string;
  DISTRICT?: string;
  CITY: string;
  ZIP: string;
  PHONE01?: string;
  PIN_A: string;
  PIN_B: string;
  PAYMENT?: string;
  BASKET_KEY?: string;
  GROUP_CHAIN?: string;
  SALESMAN?: string;
  PROGRAMMATISMOS?: string;
}

export interface IFamilyCategories {
  FAMILY: string;
}

export interface IProductItem {
  SUPPLIER: string;
  ITEMUID: string;
  CODE: string;
  FULL_DESCRIPTION: string;
  TITLE: string;
  DESCRIPTION: string;
  PRICE_PER_MU1: string;
  INVOICE_UNIT: string;
  ORDER_UNIT: string;
  SXESI: string;
  MANUFACTOR: string;
  CATEGORY: string;
  MARKA: string;
  FAMILY: string;
  IMAGE?: string;
  FAV: string;
  FINDOC: string;
  TRDR: string;
  BRANCH: string;
  MTRL: string;
  Qty1: string;
  Qty2: number;
  LINEVAL?: string;
  SXPERC?: string;
}

export interface ICart {
  success: boolean;
  count: number;
  data: IProductItem[];
}

export interface SalDocEntry {
  SERIES: string;
  TRDR: number;
  TRDBRANCH: number;
  PAYMENT: number;
  TRUCKS: number;
  DELIVDATE: string;
  COMMENTS: string;
  REMARKS: string;
}

export interface MtrDocEntry {
  TRUCKS: number;
  DELIVDATE: string;
  DEPTRDR?: number;
  BILLTRDR?: number;
}

export interface ItemLineEntry {
  LINENUM?: number;
  MTRL: number;
  QTY2: number;
}

export interface DataPayload {
  SALDOC?: SalDocEntry[];
  MTRDOC?: MtrDocEntry[];
  ITELINES: ItemLineEntry[];
}

export interface AddToCartPayload {
  service: "setData";
  clientID?: string;
  appId?: string;
  OBJECT: "SALDOC";
  KEY: string;
  LOCATEINFO?: "ITELINES:MTRL,LINENUM,QTY1,QTY2,MTRL_MTRL_CODE,MTRL_MTRL_NAME";
  data: DataPayload;
}

export type CartResponse = {
  success: false;
  errorcode?: number;
  error?: string;
  id?: string;
};

export interface CartPricingIteline {
  LINENUM: string;
  MTRL: string;
  MTRL_ITEM_CODE?: string;
  MTRL_ITEM_NAME?: string;
  QTY2: string;
  LINEVAL: string;
  SXPERC: string;
}

export interface CartPricingSaldoc {
  TRDR: string;
  SERIES: string;
  PAYMENT: string;
  SUMAMNT: string;
}

export interface CartPricingData {
  SALDOC: CartPricingSaldoc[];
  ITELINES: CartPricingIteline[];
}

export interface CartPricingResponse {
  success: boolean;
  readOnly?: boolean;
  data: CartPricingData;
  prtname?: string;
  caption?: string;
  calc?: boolean;
  einvoice?: boolean;
  remoteKey?: string;
}
