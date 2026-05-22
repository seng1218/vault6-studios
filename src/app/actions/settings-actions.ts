"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getSettings() {
  try {
    const settings = await prisma.siteSetting.findMany();
    // Convert to a simple key-value object for easier frontend use
    const settingsObj = settings.reduce((acc: any, curr) => {
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
    await prisma.siteSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
    revalidatePath("/", "layout");
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Database Error:", error);
    return { success: false, error: "Failed to update setting." };
  }
}

export async function seedDefaultSettings() {
  const defaults = [
    { key: "hero_title", value: "Vault 6" },
    { key: "hero_subtitle", value: "Studios" },
    { key: "hero_subheading", value: "Premium Artifact Database" },
    { key: "hero_description", value: "Authenticated Japanese collectible figures — curated for serious collectors." },
  ];

  try {
    for (const item of defaults) {
      await prisma.siteSetting.upsert({
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
