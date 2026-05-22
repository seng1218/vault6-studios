"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function fetchArtifacts() {
  try {
    const artifacts = await prisma.artifact.findMany({
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: artifacts };
  } catch (error) {
    console.error("Database Error:", error);
    return { success: false, error: "Failed to fetch artifacts." };
  }
}

export async function fetchArtifactById(id: string) {
  try {
    const artifact = await prisma.artifact.findUnique({
      where: { id },
    });
    if (!artifact) return { success: false, error: "Artifact not found." };
    return { success: true, data: artifact };
  } catch (error) {
    console.error("Database Error:", error);
    return { success: false, error: "Failed to fetch artifact." };
  }
}

export async function createArtifact(data: any) {
  try {
    const artifact = await prisma.artifact.create({
      data: {
        deploymentId: data.deploymentId,
        name: data.name,
        series: data.series,
        category: data.category,
        price: data.price,
        status: data.status,
        scale: data.scale,
        material: data.material,
        highlights: data.highlights || "",
        imageUrls: data.imageUrls || "",
        condition: data.condition || "MISB",
        manufacturer: data.manufacturer || "Unknown",
        inventory: data.inventory || 1,
      },
    });
    revalidatePath("/collection");
    revalidatePath("/admin");
    return { success: true, data: artifact };
  } catch (error) {
    console.error("Database Error:", error);
    return { success: false, error: "Failed to create artifact." };
  }
}

export async function updateArtifact(id: string, data: any) {
  try {
    const artifact = await prisma.artifact.update({
      where: { id },
      data: {
        deploymentId: data.deploymentId,
        name: data.name,
        series: data.series,
        category: data.category,
        price: data.price,
        status: data.status,
        scale: data.scale,
        material: data.material,
        highlights: data.highlights || "",
        imageUrls: data.imageUrls || "",
        condition: data.condition || "MISB",
        manufacturer: data.manufacturer || "Unknown",
        inventory: data.inventory || 1,
      },
    });
    revalidatePath("/collection");
    revalidatePath("/admin");
    return { success: true, data: artifact };
  } catch (error) {
    console.error("Database Error:", error);
    return { success: false, error: "Failed to update artifact." };
  }
}

export async function deleteArtifact(id: string) {
  try {
    await prisma.artifact.delete({
      where: { id },
    });
    revalidatePath("/collection");
    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Database Error:", error);
    return { success: false, error: "Failed to delete artifact." };
  }
}

export async function seedInitialData() {
  const initialArtifacts = [
    { id: "V6-001", name: "Krypton Legacy", series: "ORIGINS", category: "HEAD SCULPT", price: "$35", status: "AVAILABLE", scale: "1/6", material: "RESIN" },
    { id: "V6-002", name: "Detective Samurai", series: "NEO-NOIR", category: "HEAD SCULPT", price: "$38", status: "LIMITED", scale: "1/6", material: "PRO-POLY" },
    { id: "V6-003", name: "Jeet Kune Do Master", series: "LEGENDS", category: "FULL CUSTOM", price: "$180", status: "SOLD OUT", scale: "1/12", material: "MIXED" },
    { id: "V6-004", name: "Cyber Ronin", series: "NEO-NOIR", category: "FULL CUSTOM", price: "$210", status: "PRE-ORDER", scale: "1/6", material: "VINYL" },
    { id: "V6-005", name: "Neo Tokyo Pilot", series: "NEO-NOIR", category: "HEAD SCULPT", price: "$42", status: "AVAILABLE", scale: "1/6", material: "RESIN" },
    { id: "V6-006", name: "Gothic Sentinel", series: "ORIGINS", category: "FULL CUSTOM", price: "$195", status: "AVAILABLE", scale: "1/12", material: "MIXED" },
  ];

  try {
    for (const item of initialArtifacts) {
      await prisma.artifact.upsert({
        where: { deploymentId: item.id },
        update: {},
        create: {
          deploymentId: item.id,
          name: item.name,
          series: item.series,
          category: item.category,
          price: item.price,
          status: item.status,
          scale: item.scale,
          material: item.material,
          highlights: "Hyper-detailed hand painted facial and hair textures\nUniversally compatible with standard 1/6 action body frames\nPre-fitted modular neck connector socket",
          imageUrls: "",
          condition: "MISB",
          manufacturer: "Vault 6 Studios",
          inventory: 10,
        },
      });
    }
    return { success: true };
  } catch (error) {
    console.error("Seeding Error:", error);
    return { success: false };
  }
}
