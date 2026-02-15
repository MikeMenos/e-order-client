import { create } from "zustand";
import { persist } from "zustand/middleware";
import { setCookie } from "../lib/cookies";

type AnyObject = Record<string, any>;

export interface AuthState {
  isLoggedIn: boolean;
  accessToken: string | null;
  storeAccessToken: string | null;
  /** Persisted store UID so we can call select-store on return when storeAccessToken cookie is missing */
  selectedStoreUID: string | null;
  refreshToken: string | null;
  isAddUser: boolean;
  users: AnyObject | null;
  selectedUser: AnyObject | null;
  setLoggedIn: (payload: {
    isLoggedIn: boolean;
    users: AnyObject;
    isAddUser: boolean;
  }) => void;
  setSelectedUser: (user: AnyObject | null) => void;
  setAccessToken: (token: string | null) => void;
  setStoreAccessToken: (token: string | null) => void;
  setSelectedStoreUID: (uid: string | null) => void;
  setRefreshToken: (token: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isLoggedIn: false,
      accessToken: null,
      storeAccessToken: null,
      selectedStoreUID: null,
      refreshToken: null,
      isAddUser: false,
      users: null,
      selectedUser: null,
      setLoggedIn: ({ isLoggedIn, users, isAddUser }) =>
        set(() => ({
          isLoggedIn,
          users,
          isAddUser,
        })),
      setSelectedUser: (user) =>
        set(() => ({
          selectedUser: user,
        })),
      setAccessToken: (token) => {
        // Always sync to cookie when token changes
        if (typeof window !== "undefined") {
          setCookie("accessToken", token);
        }
        set(() => ({
          accessToken: token,
        }));
      },
      setStoreAccessToken: (token) => {
        if (typeof window !== "undefined") {
          setCookie("storeAccessToken", token);
        }
        set(() => ({
          storeAccessToken: token,
        }));
      },
      setSelectedStoreUID: (uid) => {
        if (typeof window !== "undefined") {
          setCookie("selectedStoreUID", uid);
        }
        set(() => ({
          selectedStoreUID: uid,
        }));
      },
      setRefreshToken: (token) =>
        set(() => ({
          refreshToken: token,
        })),
      logout: () => {
        setCookie("accessToken", null);
        setCookie("storeAccessToken", null);
        setCookie("selectedStoreUID", null);
        set(() => ({
          isLoggedIn: false,
          accessToken: null,
          storeAccessToken: null,
          selectedStoreUID: null,
          refreshToken: null,
          isAddUser: false,
          users: null,
          selectedUser: null,
        }));
      },
    }),
    { name: "auth-storage" },
  ),
);

/**
 * When selectedUser is null and storeAccess has exactly one item, use that as the effective user (e.g. for store title, store UID).
 */
export function useEffectiveSelectedUser(): AnyObject | null {
  return useAuthStore((state) => {
    if (state.selectedUser) return state.selectedUser;
    const storeAccess = state.users?.userInfos?.storeAccess;
    if (Array.isArray(storeAccess) && storeAccess.length === 1)
      return storeAccess[0] ?? null;
    return null;
  });
}
