import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { getPrisma } from "@/lib/prisma";

const FIUU_MERCHANT_ID = process.env.FIUU_MERCHANT_ID ?? "";
const FIUU_VERIFY_KEY = process.env.FIUU_VERIFY_KEY ?? "";
const FIUU_PAYMENT_URL =
  process.env.FIUU_PAYMENT_URL ?? "https://payment.fiuu.com/RMS/pay/";
const SITE_URL = process.env.SITE_URL ?? "http://localhost:3000";

export async function POST(req: NextRequest) {
  if (!FIUU_MERCHANT_ID || !FIUU_VERIFY_KEY) {
    return NextResponse.json(
      { error: "Payment gateway not configured." },
      { status: 503 }
    );
  }

  try {
    const body = await req.json();
    const {
      customerName,
      customerEmail,
      customerPhone,
      address,
      city,
      state,
      zip,
      country,
      subtotal,
      shipping,
      total,
      items,
    } = body;

    if (
      !customerName ||
      !customerEmail ||
      !customerPhone ||
      !total ||
      !items?.length
    ) {
      return NextResponse.json(
        { error: "Missing required fields." },
        { status: 400 }
      );
    }

    const orderNumber = `V6-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const amount = Number(total).toFixed(2);

    const db = await getPrisma();
    await db.order.create({
      data: {
        orderNumber,
        customerName,
        customerEmail,
        phone: customerPhone,
        address,
        city,
        state,
        zip,
        country,
        subtotal: Number(subtotal),
        shipping: Number(shipping),
        total: Number(total),
        status: "PENDING",
        items: {
          create: items.map((item: {
            artifactId: string;
            artifactName: string;
            price: number;
            quantity: number;
          }) => ({
            artifactId: item.artifactId,
            artifactName: item.artifactName,
            price: item.price,
            quantity: item.quantity,
          })),
        },
      },
    });

    // vcode = MD5(amount + merchant_id + orderid + verify_key)
    const vcode = crypto
      .createHash("md5")
      .update(amount + FIUU_MERCHANT_ID + orderNumber + FIUU_VERIFY_KEY)
      .digest("hex");

    const fiuuCountry = country === "INTERNATIONAL" ? "OT" : "MY";

    return NextResponse.json({
      paymentUrl: FIUU_PAYMENT_URL,
      params: {
        merchant_id: FIUU_MERCHANT_ID,
        orderid: orderNumber,
        amount,
        bill_name: customerName,
        bill_email: customerEmail,
        bill_mobile: customerPhone,
        bill_desc: `Vault 6 Studios Order ${orderNumber}`,
        country: fiuuCountry,
        currency: "MYR",
        returnurl: `${SITE_URL}/api/payment/return`,
        callbackurl: `${SITE_URL}/api/payment/callback`,
        vcode,
        lang: "en",
      },
    });
  } catch (error) {
    console.error("[payment/create]", error);
    return NextResponse.json(
      { error: "Failed to create payment." },
      { status: 500 }
    );
  }
}
