"use client";

import { createContext, useContext, useMemo, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { SessionData } from "@/lib/session/config";

type SessionProviderProps = {
  initialSession: SessionData | null;
  children: React.ReactNode;
};

type SessionContextValue = {
  session: SessionData | null;
};

const SessionContext = createContext<SessionContextValue | undefined>(
  undefined
);

export function SessionProvider({
  initialSession,
  children,
}: SessionProviderProps) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (initialSession) {
      queryClient.setQueryData(["session"], initialSession);
    } else {
      queryClient.removeQueries({ queryKey: ["session"] });
    }
  }, [initialSession, queryClient]);

  const value = useMemo<SessionContextValue>(
    () => ({ session: initialSession }),
    [initialSession]
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSessionContext() {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error("useSessionContext must be used inside SessionProvider");
  }
  return ctx;
}
