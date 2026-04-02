import { NextResponse } from "next/server";

const ALLOWED_PROTOCOLS = new Set(["https:", "http:"]);
const BLOB_PATH = "/xrpc/com.atproto.sync.getBlob";

function badRequest(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawUrl = searchParams.get("url");

  if (!rawUrl) {
    return badRequest("Missing blob url.");
  }

  let upstreamUrl: URL;
  try {
    upstreamUrl = new URL(rawUrl);
  } catch {
    return badRequest("Invalid blob url.");
  }

  if (!ALLOWED_PROTOCOLS.has(upstreamUrl.protocol)) {
    return badRequest("Unsupported blob protocol.");
  }

  if (upstreamUrl.pathname !== BLOB_PATH) {
    return badRequest("Unsupported blob path.");
  }

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
