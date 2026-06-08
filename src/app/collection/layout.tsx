import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Waifu & Anime Figures for Sale in Malaysia | Vault 6 Studios",
  description:
    "Browse hand-inspected waifu and anime figures available now in Malaysia. Scale figures, prize figures, and character figures. Free shipping on orders RM100+.",
  openGraph: {
    title: "Waifu & Anime Figures Malaysia | Vault 6 Studios",
    description:
      "Hand-inspected anime figures in stock now. Free shipping from RM100. Pay via FPX, card, or e-wallet.",
  },
  alternates: {
    canonical: "https://www.vault6studios.com/collection",
  },
};

export default function CollectionLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": "Waifu & Anime Figures — Vault 6 Studios",
            "description": "Hand-inspected waifu and anime figures available in Malaysia. Free shipping on orders RM100 and above.",
            "url": "https://www.vault6studios.com/collection",
            "isPartOf": { "@id": "https://www.vault6studios.com/#website" },
            "breadcrumb": {
              "@type": "BreadcrumbList",
              "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.vault6studios.com" },
                { "@type": "ListItem", "position": 2, "name": "Collection", "item": "https://www.vault6studios.com/collection" }
              ]
            }
          })
        }}
      />
      {children}
    </>
  );
}
