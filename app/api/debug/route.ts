import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const headers = Object.fromEntries(request.headers.entries());

  console.log(`🐛 DEBUG REQUEST from:`, {
    url: request.url,
    origin: headers.origin,
    host: headers.host,
    referer: headers.referer,
    userAgent: headers["user-agent"]?.substring(0, 100),
  });

  return NextResponse.json({
    message: "Debug endpoint reached",
    url: request.url,
    headers: {
      origin: headers.origin,
      host: headers.host,
      referer: headers.referer,
    },
    timestamp: new Date().toISOString(),
  });
}
