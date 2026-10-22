"use client";

import React, { createContext, useContext } from "react";
import type { SessionUser } from "@/lib/types";

const SessionContext = createContext<SessionUser>(null);

export function SessionProvider({ user, children }: { user: SessionUser; children: React.ReactNode }) {
  return <SessionContext.Provider value={user}>{children}</SessionContext.Provider>;
}

export function useSession() {
  return useContext(SessionContext);
}
