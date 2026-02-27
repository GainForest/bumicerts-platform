"use server";

import { atprotoSDK } from "@/lib/atproto";
import {
  getAppSession,
  clearAppSession,
  AppSessionData,
} from "gainforest-sdk/oauth";
import { allowedPDSDomains } from "@/lib/config/gainforest-sdk";

/**
 * Initiates the OAuth authorization flow.
 *
 * This server action generates an authorization URL for the given handle.
 * The client should redirect to this URL to start the OAuth flow.
 *
 * @param handle - The user's ATProto handle (e.g., "alice.climateai.org" or just "alice")
 * @returns The authorization URL to redirect the user to
 *
 * @example
 * ```tsx
 * const { authorizationUrl } = await authorize("alice");
 * window.location.href = authorizationUrl;
 * ```
 */
export async function authorize(handle: string): Promise<{ authorizationUrl: string }> {
  // Normalize the handle - add domain if not present
  const normalizedHandle = handle.includes(".")
    ? handle
    : `${handle}.${allowedPDSDomains[0]}`;

  const authUrl = await atprotoSDK.authorize(normalizedHandle);

  return { authorizationUrl: authUrl.toString() };
}

/**
 * Logs out the current user.
 *
 * This server action clears the app session cookie, effectively logging
 * the user out. Note that this only clears the local session - the OAuth
 * tokens in Supabase may still be valid.
 *
 * @returns Success indicator
 *
 * @example
 * ```tsx
 * await logout();
 * // User is now logged out
 * ```
 */
export async function logout(): Promise<{ success: boolean }> {
  const session: AppSessionData = await getAppSession();
  try {
    if (session.did) {
      await atprotoSDK.revokeSession(session.did);
    }
  } catch (error) {
    console.error("Failed to revoke session:", error);
  } finally {
    await clearAppSession();
  }
  return { success: true };
}

/**
 * Checks the current session status.
 *
 * This server action reads the app session cookie and optionally verifies
 * that the OAuth session is still valid in Supabase.
 *
 * @returns Session status with user info if authenticated
 *
 * @example
 * ```tsx
 * const session = await checkSession();
 * if (session.authenticated) {
 *   console.log(`Logged in as ${session.did}`);
 * }
 * ```
 */
export async function checkSession(): Promise<
  | { authenticated: false }
  | { authenticated: true; did: string; handle?: string }
> {
  const session: AppSessionData = await getAppSession();

  if (!session.isLoggedIn || !session.did) {
    return { authenticated: false };
  }

  // Verify the OAuth session is still valid in Supabase.
  // This catches cases where the session was deleted by another process
  // (e.g. logging in from a different device/tab), preventing the UI from
  // showing the user as logged in when their tokens are actually gone.
  try {
    const oauthSession = await atprotoSDK.restoreSession(session.did);
    if (!oauthSession) {
      console.warn("COULD NOT RESTORE SESSION")
      await clearAppSession();
      return { authenticated: false };
    }
  } catch (e) {
    console.error("COULD NOT RESTORE SESSION", e)
    // Session is dead — clear the stale cookie so the UI stays in sync
    await clearAppSession();
    return { authenticated: false };
  }

  return {
    authenticated: true,
    did: session.did,
    handle: session.handle,
  };
}

/**
 * Profile data returned from ATProto
 */
export type ProfileData = {
  handle: string;
  displayName?: string;
  description?: string;
  avatar?: string;
};

/**
 * Fetches the user's ATProto profile using the hypercerts SDK.
 *
 * This server action restores the OAuth session and uses the repository
 * pattern to fetch the user's profile data including handle, display name,
 * and avatar.
 *
 * @param did - The user's DID
 * @returns Profile data or null if profile doesn't exist or session is invalid
 *
 * @example
 * ```tsx
 * const profile = await getProfile("did:plc:abc123");
 * if (profile) {
 *   console.log(`Hello, ${profile.displayName ?? profile.handle}!`);
 * }
 * ```
 */
export async function getProfile(did: string): Promise<ProfileData | null> {
  try {
    // Re-use the already-validated session from checkSession.
    // restoreSession here is a lightweight cache hit since checkSession
    // already verified the session is alive moments ago.
    const session = await atprotoSDK.restoreSession(did);
    if (!session) {
      console.error("Could not restore session for profile fetch");
      return null;
    }

    // Get repository and fetch profile
    // repository() is now async and returns Promise<Repository>
    const repo = await atprotoSDK.repository(session);

    // Try certified profile first, fall back to Bsky profile
    const certifiedProfile = await repo.profile.getCertifiedProfile();
    const profile = certifiedProfile ?? await repo.profile.getBskyProfile();

    // Avatar is already a string URL in both CertifiedProfile and BskyProfile
    const avatarUrl: string | undefined = profile?.avatar ?? undefined;

    return {
      handle: profile?.handle ?? did,
      displayName: profile?.displayName,
      description: profile?.description,
      avatar: avatarUrl,
    };
  } catch (error) {
    console.error("Error fetching profile:", error);
    // Don't clear the session here — restoreSession may fail for ePDS sessions
    // due to SDK version mismatch, but the session is still valid in Supabase.
    // The user stays logged in, just without profile data.
    return null;
  }
}
