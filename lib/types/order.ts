/** Line item from order (list or Order_View response) */
export type OrderLineItem = {
  productUID?: string;
  productTitle?: string;
  productOriginalTitle?: string;
  quantity?: number;
  unitPrice?: number;
  totalPrice?: number;
  productImage?: string | null;
  productPackaging?: string;
  productDescription?: string;
  [key: string]: unknown;
};

export type OrderHistoryOrder = {
  orderID: number;
  orderUID: string;
  supplierTitle: string | null;
  supplierLogo: string | null;
  supplierSubtitle: string | null;
  supplierUID: string;
  storeTitle: string;
  storeUID: string;
  shopperUID: string;
  shipAddress: string | null;
  deliveryCost: number | null;
  productsCost: number | null;
  totalCost: number | null;
  totalItems: number | null;
  deliveryDate: string | null;
  deliveryDateText: string | null;
  orderRefDate: string | null;
  orderRefDateText: string | null;
  dateCreated: string | null;
  createdBy: string | null;
  shopperComments: string | null;
  supplierComments: string | null;
  statusID: number | null;
  statusDescription: string | null;
  statusColor: string | null;
  items: OrderLineItem[];
  orderCode: string | null;
  minOrderAmount?: number | null;
  remainingAmount?: number | null;
  nextAvailDeliveryMessage?: string | null;
};

export type OrderHistoryResponse = {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  listOrders: OrderHistoryOrder[];
  statusCode?: number;
  message?: string;
  detailedMessage?: string;
};

export type OrderViewOrder = {
  orderUID?: string;
  items?: OrderLineItem[];
  [key: string]: unknown;
};

export type OrderViewResponse = {
  statusCode?: number;
  message?: string;
  order?: OrderViewOrder;
};

export type OrderRetakePayload = {
  orderRefDate: string;
  orderUID: string;
  updateMode?: 0 | 1;
};

export type OrderAddPayload = {
  orderRefDate: string;
  supplierUID: string;
  extraComments?: string;
  desiredDeliveryDate: string;
};

export type OrderAddResponse = { message?: string };

export type OrderTempSavePayload = {
  orderRefDate: string;
  supplierUID: string;
  extraComments?: string;
  desiredDeliveryDate: string;
};

export type OrderTempSaveResponse = {
  statusCode?: number;
  message?: string;
  detailedMessage?: string;
};
