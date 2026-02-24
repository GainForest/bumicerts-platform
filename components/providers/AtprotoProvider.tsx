"use client";

import { useEffect, useRef } from "react";
import { useAtprotoStore } from "@/components/stores/atproto";
import { checkSession, getProfile } from "@/components/actions/oauth";

/**
 * Provider component that initializes ATProto session state.
 *
 * This component handles session initialization in a useEffect to avoid the
 * "Server Functions cannot be called during initial render" error that occurs
 * when calling server actions during module evaluation or initial render.
 *
 * Must be placed in the component tree before any components that use
 * useAtprotoStore.
 *
 * @example
 * ```tsx
 * // In your layout.tsx
 * <AtprotoProvider>
 *   {children}
 * </AtprotoProvider>
 * ```
 */
export function AtprotoProvider({ children }: { children: React.ReactNode }) {
  const initialized = useRef(false);
  const setAuth = useAtprotoStore((state) => state.setAuth);

  useEffect(() => {
    // Prevent double initialization in React Strict Mode
    if (initialized.current) return;
    initialized.current = true;

    const initSession = async () => {
      try {
        const result = await checkSession();
        if (result.authenticated) {
          // Fetch profile to get handle, displayName, avatar.
          // getProfile returns null when the OAuth session is dead (e.g. deleted
          // by another process). In that case we treat the user as logged out so
          // the UI stays in sync with the actual session state.
          const profile = await getProfile(result.did);
          if (!profile) {
            setAuth(null);
            return;
          }

          // Use handle from session cookie if profile.get() returns invalid handle
          const validHandle =
            profile.handle && profile.handle !== "handle.invalid"
              ? profile.handle
              : result.handle;

          setAuth({
            did: result.did,
            handle: validHandle,
            displayName: profile.displayName,
            avatar: profile.avatar,
          });
        } else {
          setAuth(null);
        }
      } catch (error) {
        console.error("Error checking session:", error);
        setAuth(null);
      }
    };

    initSession();
  }, [setAuth]);

  return <>{children}</>;
}
