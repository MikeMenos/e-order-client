"use client";

import { useMemo } from "react";
import { useAuthStore } from "../../../../stores/auth";
import { useUsersForStore } from "../../../../hooks/useUsers";

export default function UsersManagementPage() {
  const { users, selectedUser } = useAuthStore();

  const storeUID = useMemo(() => {
    if (!users && !selectedUser) return null;
    return users?.hasSelectedStore === true
      ? users?.selectedStoreUID
      : selectedUser?.store?.storeUID
        ? selectedUser.store.storeUID
        : (users?.role?.store?.storeUID ?? null);
  }, [users, selectedUser]);

  const usersQuery = useUsersForStore(storeUID);

  const userList = usersQuery.data?.usersList ?? [];

  return (
    <main className="min-h-screen bg-slate-50 p-6 space-y-4 text-slate-900">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-slate-900">
          Users management
        </h1>
        <p className="text-sm text-slate-600">
          Read-only list of users for the current store.
        </p>
        {storeUID && (
          <p className="text-xs text-slate-700">
            Store UID: <span className="font-mono">{storeUID}</span>
          </p>
        )}
      </header>

      {usersQuery.isLoading && (
        <p className="text-xs text-slate-500">Loading users…</p>
      )}
      {usersQuery.error && (
        <p className="text-xs text-red-400">Failed to load users.</p>
      )}

      {userList.length === 0 && !usersQuery.isLoading ? (
        <p className="text-sm text-slate-600">No users found.</p>
      ) : (
        <div className="space-y-2">
          {userList.map((u: any) => (
            <div
              key={u.appUserUID}
              className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-900 shadow-sm"
            >
              <div className="min-w-0">
                <p className="truncate font-semibold">
                  {u.fname} {u.lname}
                </p>
                <p className="truncate text-xs text-slate-600">
                  {u.email ?? u.username}
                </p>
              </div>
              <span className="shrink-0 text-xs text-slate-700">
                {u.userType}
              </span>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
