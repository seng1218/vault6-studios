import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { getPrisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const FIUU_VERIFY_KEY = process.env.FIUU_VERIFY_KEY ?? "";

export async function GET() {
  return new NextResponse("RECEIVEOK", { status: 200 });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.formData();

    const status = body.get("status") as string;
    const tranID = body.get("tranID") as string;
    const orderid = body.get("orderid") as string;
    const domain = body.get("domain") as string;
    const amount = body.get("amount") as string;
    const currency = (body.get("currency") as string) || "MYR";
    const paydate = body.get("paydate") as string;
    const appcode = body.get("appcode") as string;
    const skey = body.get("skey") as string;

    if (!status || !tranID || !orderid || !domain || !amount || !skey) {
      return new NextResponse("RECEIVEOK", { status: 200 });
    }

    // Extended skey verification (two-step):
    // key0 = MD5(tranID + orderid + status + domain + amount + currency)
    // key1 = MD5(paydate + domain + key0 + appcode + verify_key)
    const key0 = crypto
      .createHash("md5")
      .update(tranID + orderid + status + domain + amount + currency)
      .digest("hex");
    const expectedSkey = crypto
      .createHash("md5")
      .update((paydate ?? "") + domain + key0 + (appcode ?? "") + FIUU_VERIFY_KEY)
      .digest("hex");

    if (expectedSkey !== skey) {
      console.error("[callback] skey mismatch", { expectedSkey, received: skey });
      return new NextResponse("RECEIVEOK", { status: 200 });
    }

    // "00" = success, "11" = failed, "22" = pending
    const orderStatus = status === "00" ? "PAID" : status === "22" ? "PENDING" : "FAILED";

    const db = await getPrisma();
    await db.order.update({
      where: { orderNumber: orderid },
      data: { status: orderStatus, transactionId: tranID },
    });

    revalidatePath("/admin");
    return new NextResponse("RECEIVEOK", { status: 200 });
  } catch (error) {
    console.error("[payment/callback]", error);
    return new NextResponse("RECEIVEOK", { status: 200 });
  }
}
