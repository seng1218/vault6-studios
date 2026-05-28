"use server";

import { getPrisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createOrder(orderData: {
  customerName: string;
  customerEmail: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  subtotal: number;
  shipping: number;
  total: number;
  items: {
    artifactId: string;
    artifactName: string;
    price: number;
    quantity: number;
  }[];
}) {
  try {
    const db = await getPrisma();
    const orderNumber = `V6-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const order = await db.order.create({
      data: {
        orderNumber,
        customerName: orderData.customerName,
        customerEmail: orderData.customerEmail,
        address: orderData.address,
        city: orderData.city,
        state: orderData.state,
        zip: orderData.zip,
        country: orderData.country,
        subtotal: orderData.subtotal,
        shipping: orderData.shipping,
        total: orderData.total,
        status: "PAID",
        items: {
          create: orderData.items.map((item) => ({
            artifactId: item.artifactId,
            artifactName: item.artifactName,
            price: item.price,
            quantity: item.quantity,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    revalidatePath("/admin");
    return { success: true, data: order };
  } catch (error) {
    console.error("Order Creation Error:", error);
    return { success: false, error: "Failed to create order." };
  }
}

export async function fetchOrders() {
  try {
    const db = await getPrisma();
    const orders = await db.order.findMany({
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: orders };
  } catch (error) {
    console.error("Database Error:", error);
    return { success: false, error: "Failed to fetch orders." };
  }
}
