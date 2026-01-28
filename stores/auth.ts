import { create } from "zustand";

type AnyObject = Record<string, any>;

export interface AuthState {
  isLoggedIn: boolean;
  accessToken: string | null;
  storeAccessToken: string | null;
  refreshToken: string | null;
  isAddUser: boolean;
  users: AnyObject | null;
  selectedUser: AnyObject | null;
  setLoggedIn: (payload: { isLoggedIn: boolean; users: AnyObject; isAddUser: boolean }) => void;
  setSelectedUser: (user: AnyObject | null) => void;
  setAccessToken: (token: string | null) => void;
  setStoreAccessToken: (token: string | null) => void;
  setRefreshToken: (token: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: false,
  accessToken: null,
  storeAccessToken: null,
  refreshToken: null,
  isAddUser: false,
  users: null,
  selectedUser: null,
  setLoggedIn: ({ isLoggedIn, users, isAddUser }) =>
    set(() => ({
      isLoggedIn,
      users,
      isAddUser
    })),
  setSelectedUser: (user) =>
    set(() => ({
      selectedUser: user
    })),
  setAccessToken: (token) =>
    set(() => ({
      accessToken: token
    })),
  setStoreAccessToken: (token) =>
    set(() => ({
      storeAccessToken: token
    })),
  setRefreshToken: (token) =>
    set(() => ({
      refreshToken: token
    })),
  logout: () =>
    set(() => ({
      isLoggedIn: false,
      accessToken: null,
      storeAccessToken: null,
      refreshToken: null,
      isAddUser: false,
      users: null,
      selectedUser: null
    }))
}));

