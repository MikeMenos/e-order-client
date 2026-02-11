import type {
  WeekDeliveryScheduleItem,
  WeekDailyAnalysisItem,
  SupplierDisplayCategory,
} from "./supplier-api";

/** Response shape from Shop/Supplier_BasicInfos */
export type SupplierBasicInfoSupplier = {
  originalTitle?: string;
  customTitle?: string;
  supplierUID?: string;
  logo?: string | null;
  phone?: string | null;
  customPhone?: string | null;
  email?: string | null;
  customEmail?: string | null;
  vat?: string | null;
  address?: string | null;
  postalCode?: string | null;
  city?: string | null;
  mainActivity?: string | null;
  personalNotes?: string | null;
  minOrderAmount?: number | null;
  deliveryCost?: number | null;
  weekDeliveryDaysText?: string | null;
  weekDeliverySchedule?: Array<{
    deliveryDay?: string;
    shortDay?: string;
    description?: string;
    orderTillDay?: string;
  }>;
  weekDailyAnalysis?: Array<{
    shortDay?: string;
    infos?: string;
    dateObj?: string;
    supplierCanDeliver?: boolean;
    supplierCanProcessOrder?: boolean;
    dayIsClosed?: boolean;
    shopperCanOrder?: boolean;
    shopperCanOrderTheNextDay?: boolean;
  }>;
  [key: string]: unknown;
};

export type SupplierBasicInfoResponse = {
  statusCode?: number;
  message?: string;
  detailedMessage?: string;
  supplier?: SupplierBasicInfoSupplier;
  /** Some backends may return a list when no SupplierUID is passed */
  suppliers?: SupplierBasicInfoSupplier[];
};

/** Response shape from Shop/Suppliers_GetList */
export type SuppliersListItem = {
  title: string;
  customTitle: string | null;
  supplierUID: string;
  logo: string | null;
  bgImage: string | null;
  productsImage: string | null;
  subTitle: string | null;
  nextAvailDeliveryMessage: string | null;
  nextAvailDeliveryText: string | null;
  nextAvailDeliveryDate: string | null;
  orderTillText: string | null;
  orderTillDate: string | null;
  labelOrderTimeExpiresAt: string | null;
  dayTillNextDeliveryText: string | null;
  labelStockForDays: string | null;
  weekDeliveryDaysText: string | null;
  weekDeliverySchedule: WeekDeliveryScheduleItem[];
  weekDailyAnalysis: WeekDailyAnalysisItem[];
  tileColor: string | null;
  tileColorMode: string | null;
  basketIconColor: string | null;
  basketIconMode: string | null;
  basketIconStatus: number | null;
  basketIconStatusDescr: string | null;
  minOrderAmount: number | null;
  deliveryCost: number | null;
  isInPrefDaySchedule: boolean;
  counterTodayOrders: number;
  counterOpenBaskets: number;
  categories: SupplierDisplayCategory[];
};

export type SuppliersListResponse = {
  statusCode?: number;
  message?: string;
  detailedMessage?: string;
  selectedDate?: string;
  dayNameShort?: string;
  listSuppliers?: SuppliersListItem[];
};

/** Response shape from Account/User_SelectStore */
export type SelectStorePolicy = {
  code: string;
  name: string;
  hasAccess: boolean;
};

export type SelectStoreStore = {
  title: string;
  storeUID: string;
  vat: string;
  isMainStore: boolean;
};

export type SelectStoreStoreAccess = {
  userTypeId: number;
  userType: string;
  isActive: boolean;
  store: SelectStoreStore;
  policies: SelectStorePolicy[];
};

export type SelectStoreUserInfos = {
  appUserUID: string;
  username: string;
  email: string;
  fname: string;
  lname: string;
  mobile: string;
  profilePic: string;
  isActive: boolean;
  dateCreated: string;
  storeAccess: SelectStoreStoreAccess[];
};

export type SelectStoreResponse = {
  statusCode?: number;
  message?: string;
  detailedMessage?: string;
  accessToken?: string | null;
  tokenType?: string | null;
  expiresIn?: number | null;
  hasSelectedStore?: boolean;
  selectedStoreUID?: string | null;
  userInfos?: SelectStoreUserInfos | null;
  warningMessage?: string | null;
};

/** Response shape from Account/MyProfile */
export type MyProfileResponse = {
  statusCode?: number;
  message?: string;
  detailedMessage?: string;
  userInfos?: SelectStoreUserInfos | null;
};

/** Request body for Account/MyProfile_Update */
export type MyProfileUpdateRequest = {
  email: string;
  fname: string;
  lname: string;
  mobile: string;
  newPassword1: string;
  newPassword2: string;
  profilePic: string;
};
