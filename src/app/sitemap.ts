import { MetadataRoute } from "next";
import { fetchArtifacts } from "@/app/actions/artifact-actions";

const BASE = "https://www.vault6studios.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Static routes
  const routes: MetadataRoute.Sitemap = [
    { url: BASE,                                          lastModified: now, changeFrequency: "weekly",  priority: 1.0 },
    { url: `${BASE}/collection`,                          lastModified: now, changeFrequency: "daily",   priority: 0.9 },
    { url: `${BASE}/kits`,                                lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/join`,                                lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/tracking`,                            lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/about`,                               lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/contact`,                             lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/shipping`,                            lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/return-policy`,                       lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/payment-policy`,                      lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/privacy-policy`,                      lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
    { url: `${BASE}/terms`,                               lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
    // Competitor & comparison pages
    { url: `${BASE}/vs/toypanic`,                         lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/alternatives/toypanic`,               lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/alternatives/toypanic-alternatives`,  lastModified: now, changeFrequency: "monthly", priority: 0.8 },
  ];

  // Dynamic artifact routes
  try {
    const res = await fetchArtifacts();
    if (res.success && res.data) {
      const artifactRoutes = res.data.map((artifact: any) => ({
        url: `${BASE}/collection/${artifact.id}`,
        lastModified: artifact.updatedAt || artifact.createdAt || now,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      }));
      routes.push(...artifactRoutes);
    }
  } catch (error) {
    console.error("Sitemap generation error:", error);
  }

  return routes;
}
