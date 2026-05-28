"use server";

import { getPrisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getSettings() {
  try {
    const db = await getPrisma();
    const settings = await db.siteSetting.findMany();
    const settingsObj = settings.reduce((acc: any, curr: { key: string; value: string }) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});
    return { success: true, data: settingsObj };
  } catch (error) {
    console.error("Database Error:", error);
    return { success: false, error: "Failed to fetch settings." };
  }
}

export async function updateSetting(key: string, value: string) {
  try {
    const db = await getPrisma();
    await db.siteSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
    try { revalidatePath("/", "layout"); revalidatePath("/admin"); } catch {}
    return { success: true };
  } catch (error: any) {
    console.error("Database Error:", error);
    return { success: false, error: error?.message || "Failed to update setting." };
  }
}

export async function seedDefaultSettings() {
  const defaults = [
    { key: "hero_title", value: "Vault 6" },
    { key: "hero_subtitle", value: "Studios" },
    { key: "hero_subheading", value: "By Crafted Legacies" },
    { key: "hero_description", value: "Authenticated Japanese collectible figures — curated for serious collectors." },
  ];

  try {
    const db = await getPrisma();
    for (const item of defaults) {
      await db.siteSetting.upsert({
        where: { key: item.key },
        update: {},
        create: item,
      });
    }
    return { success: true };
  } catch (error) {
    console.error("Seeding Error:", error);
    return { success: false };
  }
}
