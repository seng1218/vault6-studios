import { NextRequest, NextResponse } from "next/server";

const SITE_URL = process.env.SITE_URL ?? "http://localhost:3000";

function buildRedirect(params: URLSearchParams): NextResponse {
  const status = params.get("status") ?? "";
  const orderid = params.get("orderid") ?? "";
  const tranID = params.get("tranID") ?? "";

  const qs = new URLSearchParams({ status, orderid, tranID }).toString();
  return NextResponse.redirect(`${SITE_URL}/payment/return?${qs}`, 302);
}

export async function GET(req: NextRequest) {
  return buildRedirect(req.nextUrl.searchParams);
}

export async function POST(req: NextRequest) {
  let params: URLSearchParams;
  try {
    const form = await req.formData();
    params = new URLSearchParams();
    form.forEach((v, k) => params.set(k, v.toString()));
  } catch {
    params = new URLSearchParams();
  }
  return buildRedirect(params);
}
