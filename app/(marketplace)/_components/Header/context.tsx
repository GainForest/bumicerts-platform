"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { useAtprotoStore } from "@/components/stores/atproto";

interface HeaderContextValue {
  leftContent: ReactNode;
  setLeftContent: (node: ReactNode) => void;
  rightContent: ReactNode;
  setRightContent: (node: ReactNode) => void;
  subHeaderContent: ReactNode;
  setSubHeaderContent: (node: ReactNode) => void;
  /** True when the user is confirmed unauthenticated — use to downgrade primary CTAs */
  isUnauthenticated: boolean;
}

const HeaderContext = createContext<HeaderContextValue>({
  leftContent: null,
  setLeftContent: () => {},
  rightContent: null,
  setRightContent: () => {},
  subHeaderContent: null,
  setSubHeaderContent: () => {},
  isUnauthenticated: false,
});

export function HeaderProvider({ children }: { children: ReactNode }) {
  const [leftContent, setLeftContentState] = useState<ReactNode>(null);
  const [rightContent, setRightContentState] = useState<ReactNode>(null);
  const [subHeaderContent, setSubHeaderContentState] = useState<ReactNode>(null);

  const auth = useAtprotoStore((s) => s.auth);
  const isUnauthenticated = auth.status === "UNAUTHENTICATED";

  const setLeftContent = useCallback((node: ReactNode) => setLeftContentState(node), []);
  const setRightContent = useCallback((node: ReactNode) => setRightContentState(node), []);
  const setSubHeaderContent = useCallback((node: ReactNode) => setSubHeaderContentState(node), []);

  return (
    <HeaderContext.Provider
      value={{
        leftContent,
        setLeftContent,
        rightContent,
        setRightContent,
        subHeaderContent,
        setSubHeaderContent,
        isUnauthenticated,
      }}
    >
      {children}
    </HeaderContext.Provider>
  );
}

export function useHeaderContext() {
  return useContext(HeaderContext);
}
