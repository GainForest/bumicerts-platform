import { NextResponse } from "next/server";

const BLOB_PATH = "/xrpc/com.atproto.sync.getBlob";
const DID_PDS_SERVICE_TYPE = "AtprotoPersonalDataServer";
const didHostCache = new Map<string, string>();

const LOCAL_HOSTNAMES = new Set(["localhost", "127.0.0.1", "0.0.0.0", "::1"]);

function badRequest(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function isNonEmptyString(value: string | null): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function normalizeHost(host: string): string {
  return host.replace(/\/+$/, "");
}

function isPrivateIpv4(hostname: string): boolean {
  const match = hostname.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
  if (!match) {
    return false;
  }

  const [a, b] = [Number(match[1]), Number(match[2])];

  return (
    a === 10 ||
    a === 127 ||
    a === 0 ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168)
  );
}

function isPrivateIpv6(hostname: string): boolean {
  const normalized = hostname.replace(/^\[|\]$/g, "").toLowerCase();

  return (
    normalized === "::1" ||
    normalized.startsWith("fc") ||
    normalized.startsWith("fd") ||
    normalized.startsWith("fe80:")
  );
}

function isSafePublicHostname(hostname: string): boolean {
  const normalized = hostname.trim().toLowerCase();

  if (!normalized || LOCAL_HOSTNAMES.has(normalized)) {
    return false;
  }

  if (normalized.endsWith(".localhost") || normalized.endsWith(".local")) {
    return false;
  }

  if (isPrivateIpv4(normalized) || isPrivateIpv6(normalized)) {
    return false;
  }

  return true;
}

function assertSafePublicUrl(rawUrl: string, errorMessage: string): URL {
  let parsed: URL;

  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new Error(errorMessage);
  }

  if (parsed.protocol !== "https:") {
    throw new Error(errorMessage);
  }

  if (parsed.username || parsed.password || !isSafePublicHostname(parsed.hostname)) {
    throw new Error(errorMessage);
  }

  return parsed;
}

function getDidWebDocumentUrl(did: string): string {
  const encoded = did.slice("did:web:".length);
  const parts = encoded.split(":").map(decodeURIComponent);
  const [host, ...pathParts] = parts;

  if (!host || !isSafePublicHostname(host)) {
    throw new Error("Invalid did:web identifier.");
  }

  if (pathParts.length === 0) {
    return `https://${host}/.well-known/did.json`;
  }

  return `https://${host}/${pathParts.join("/")}/did.json`;
}

function extractServiceEndpoint(document: unknown): string | null {
  if (!document || typeof document !== "object") {
    return null;
  }

  const serviceEntries = (document as { service?: unknown }).service;
  if (!Array.isArray(serviceEntries)) {
    return null;
  }

  for (const entry of serviceEntries) {
    if (!entry || typeof entry !== "object") {
      continue;
    }

    const candidate = entry as {
      type?: unknown;
      serviceEndpoint?: unknown;
    };

    if (
      candidate.type === DID_PDS_SERVICE_TYPE &&
      typeof candidate.serviceEndpoint === "string"
    ) {
      return candidate.serviceEndpoint;
    }
  }

  return null;
}

async function resolvePdsHost(did: string): Promise<string> {
  const cached = didHostCache.get(did);
  if (cached) {
    return cached;
  }

  const didDocumentUrl = did.startsWith("did:plc:")
    ? `https://plc.directory/${encodeURIComponent(did)}`
    : did.startsWith("did:web:")
      ? getDidWebDocumentUrl(did)
      : null;

  if (!didDocumentUrl) {
    throw new Error("Unsupported DID method.");
  }

  const didDocumentResponse = await fetch(didDocumentUrl, {
    headers: {
      Accept: "application/json",
      "ngrok-skip-browser-warning": "true",
    },
    cache: "force-cache",
  });

  if (!didDocumentResponse.ok) {
    throw new Error("Unable to resolve DID document.");
  }

  const didDocument = await didDocumentResponse.json();
  const endpoint = extractServiceEndpoint(didDocument);
  if (!endpoint) {
    throw new Error("DID document does not expose a PDS service endpoint.");
  }

  const endpointUrl = assertSafePublicUrl(
    endpoint,
    "DID document exposes an unsupported PDS service endpoint."
  );
  const normalized = normalizeHost(endpointUrl.toString());
  didHostCache.set(did, normalized);
  return normalized;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const did = searchParams.get("did");
  const cid = searchParams.get("cid");

  if (!isNonEmptyString(did)) {
    return badRequest("Missing did.");
  }

  if (!isNonEmptyString(cid)) {
    return badRequest("Missing cid.");
  }

  let pdsHost: string;
  try {
    pdsHost = await resolvePdsHost(did);
  } catch (error) {
    return badRequest(
      error instanceof Error ? error.message : "Unable to resolve PDS host.",
      502
    );
  }

  const upstreamUrl = new URL(BLOB_PATH, `${pdsHost}/`);
  upstreamUrl.searchParams.set("did", did);
  upstreamUrl.searchParams.set("cid", cid);

  const upstream = await fetch(upstreamUrl.toString(), {
    headers: {
      Accept: "image/*,*/*;q=0.8",
      "ngrok-skip-browser-warning": "true",
    },
  });

  if (!upstream.ok || !upstream.body) {
    return badRequest("Unable to fetch blob.", upstream.status || 502);
  }

  const contentType = upstream.headers.get("content-type") ?? "application/octet-stream";
  const contentLength = upstream.headers.get("content-length");

  const headers = new Headers({
    "Content-Type": contentType,
    "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
    "Content-Disposition": "inline",
    "X-Content-Type-Options": "nosniff",
  });

  if (contentLength) {
    headers.set("Content-Length", contentLength);
  }

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers,
  });
}
