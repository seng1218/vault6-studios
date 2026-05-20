import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const FIUU_VERIFY_KEY = process.env.FIUU_VERIFY_KEY ?? "";

export async function POST(req: NextRequest) {
  try {
    const body = await req.formData();

    const status = body.get("status") as string;
    const tranID = body.get("tranID") as string;
    const orderid = body.get("orderid") as string;
    const domain = body.get("domain") as string;
    const amount = body.get("amount") as string;
    const skey = body.get("skey") as string;

    if (!status || !tranID || !orderid || !domain || !amount || !skey) {
      return new NextResponse("INVALID_PARAMS", { status: 400 });
    }

    // Verify skey: MD5(tranID + domain + status + amount + verify_key)
    const expectedSkey = crypto
      .createHash("md5")
      .update(tranID + domain + status + amount + FIUU_VERIFY_KEY)
      .digest("hex");

    if (expectedSkey !== skey) {
      console.error("[callback] skey mismatch", { expectedSkey, received: skey });
      return new NextResponse("INVALID_SIGNATURE", { status: 400 });
    }

    // "00" = success, "11" = failed, "22" = pending
    const orderStatus = status === "00" ? "PAID" : status === "22" ? "PENDING" : "FAILED";

    await prisma.order.update({
      where: { orderNumber: orderid },
      data: { status: orderStatus, transactionId: tranID },
    });

    revalidatePath("/admin");
    return new NextResponse("OK", { status: 200 });
  } catch (error) {
    console.error("[payment/callback]", error);
    return new NextResponse("ERROR", { status: 500 });
  }
}
