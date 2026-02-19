import type {
  SelectStorePolicy,
  SelectStoreStoreAccess,
  SelectStoreUserInfos,
} from "./dashboard";

export type StoreUser = SelectStoreUserInfos;

export type UsersGetResponse = {
  statusCode?: number;
  message?: string;
  detailedMessage?: string;
  listUsers?: StoreUser[];
};

export type UsersViewProfileResponse = {
  statusCode?: number;
  message?: string;
  detailedMessage?: string;
  userProfile?: StoreUser | null;
};

export type UsersAddOrUpdateRequest = {
  appUserUID?: string | null;
  username?: string;
  email?: string;
  fname?: string;
  lname?: string;
  mobile?: string;
  profilePic?: string;
  roleLevel?: number;
  accessPolicies?: { code: string; name: string; hasAccess: boolean }[];
  newPassword1?: string;
  newPassword2?: string;
};

export type UsersAddOrUpdateResponse = {
  statusCode?: number;
  message?: string;
  detailedMessage?: string;
  appuserUID?: string;
};

export type UsersSetPermissionsRequest = {
  appUserUID: string;
  roleLevel: number;
  accessPolicies: { code: string; name: string; hasAccess: boolean }[];
};

export type { SelectStorePolicy, SelectStoreStoreAccess };
