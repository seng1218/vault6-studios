import { Metadata } from "next";
import { notFound } from "next/navigation";
import { fetchArtifactById, fetchArtifacts } from "@/app/actions/artifact-actions";
import ArtifactClient from "./artifact-client";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const res = await fetchArtifactById(id);
  
  if (!res.success || !res.data) {
    return {
      title: "Artifact Not Found | Vault 6 Studios",
    };
  }

  const artifact = res.data;
  const description = `${artifact.series} Series. ${artifact.category} by ${artifact.manufacturer}. Authenticated Japanese physical figurine - curated for serious collectors in Malaysia.`;

  return {
    title: `${artifact.name} | ${artifact.series} | Vault 6 Studios`,
    description,
    openGraph: {
      title: `${artifact.name} | Vault 6 Studios Malaysia`,
      description,
      images: artifact.imageUrls ? [artifact.imageUrls.split("\n")[0].trim()] : ["/logo.png"],
    },
    twitter: {
      card: "summary_large_image",
      title: `${artifact.name} | Vault 6 Studios Malaysia`,
      description,
    },
  };
}

export async function generateStaticParams() {
  const res = await fetchArtifacts();
  if (!res.success || !res.data) return [];

  return res.data.map((artifact: any) => ({
    id: artifact.id,
  }));
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const res = await fetchArtifactById(id);

  if (!res.success || !res.data) {
    notFound();
  }

  return <ArtifactClient artifact={res.data} />;
}
