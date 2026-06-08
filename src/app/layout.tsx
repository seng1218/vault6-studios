import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { CustomCursor } from "@/components/custom-cursor";
import { SettingsProvider } from "@/components/settings-provider";
import { CartProvider } from "@/components/cart-provider";
import { SmoothScrollProvider } from "@/components/smooth-scroll-provider";
import { getSettings } from "@/app/actions/settings-actions";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Vault 6 Studios | Waifu & Anime Figures Malaysia",
  description: "Malaysia's dedicated waifu and anime figure store. Every figure hand-inspected before listing. Free shipping on orders RM100+. Pay via FPX, card, or e-wallet.",
  keywords: ["waifu figures Malaysia", "anime figures Malaysia", "buy waifu figure online Malaysia", "anime collectibles Malaysia", "figure store Malaysia", "anime figures Singapore", "buy anime figures SG", "authenticated waifu figures Singapore"],
  openGraph: {
    title: "Vault 6 Studios | Waifu & Anime Figures Malaysia & Singapore",
    description: "Hand-inspected waifu and anime figures. Free shipping on qualifying regional orders. Member loyalty programme for collectors.",
    type: "website",
    siteName: "Vault 6 Studios",
    locale: "en_MY",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vault 6 Studios | Waifu & Anime Figures Malaysia",
    description: "Hand-inspected waifu and anime figures. Free shipping from RM100.",
  },
  alternates: {
    canonical: "https://www.vault6studios.com",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settingsRes = await getSettings();
  const settingsDefaults = {
    hero_title: "VAULT 6",
    hero_subtitle: "STUDIOS",
    hero_subheading: "Premium Physical Inventory",
    hero_description: "Authenticated Japanese physical figurines — curated and secured for serious collectors.",
  };
  const initialSettings = { ...settingsDefaults, ...(settingsRes.success ? settingsRes.data : {}) };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* esbuild helper polyfill — OpenNext/reactCompiler can reference __name in RSC boundaries */}
        <script dangerouslySetInnerHTML={{ __html: 'var __name=(t,v)=>Object.defineProperty(t,"name",{value:v,configurable:true});' }} />
        {/* Preload entrance + morph images — ssr:false dynamic imports block Next.js from emitting these */}
        <link rel="preload" as="image" href="/logo.png" />
        <link rel="preload" as="image" href="/frames/01.png" />
        <link rel="preload" as="image" href="/frames/26.png" />
        <link rel="preload" as="image" href="/frames/27.png" />
        <link rel="preload" as="image" href="/frames/28.png" />
        {/* Organization + WebSite schema — helps AI engines identify and cite us correctly */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  "@id": "https://www.vault6studios.com/#organization",
                  "name": "Vault 6 Studios",
                  "url": "https://www.vault6studios.com",
                  "logo": "https://www.vault6studios.com/logo.png",
                  "description": "Malaysia's dedicated waifu and anime figure store. Every figure hand-inspected before listing. Free shipping on orders RM100 and above.",
                  "address": {
                    "@type": "PostalAddress",
                    "addressCountry": "MY"
                  },
                  "areaServed": "MY",
                  "currenciesAccepted": "MYR",
                  "paymentAccepted": "FPX, Credit Card, Debit Card, E-wallet",
                  "sameAs": []
                },
                {
                  "@type": "WebSite",
                  "@id": "https://www.vault6studios.com/#website",
                  "url": "https://www.vault6studios.com",
                  "name": "Vault 6 Studios",
                  "description": "Malaysia's dedicated waifu and anime figure store",
                  "publisher": { "@id": "https://www.vault6studios.com/#organization" },
                  "potentialAction": {
                    "@type": "SearchAction",
                    "target": {
                      "@type": "EntryPoint",
                      "urlTemplate": "https://www.vault6studios.com/collection?q={search_term_string}"
                    },
                    "query-input": "required name=search_term_string"
                  }
                }
              ]
            })
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased transition-colors duration-300`}
        suppressHydrationWarning
      >
        <SettingsProvider initialSettings={initialSettings}>
          <CartProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              enableSystem
              disableTransitionOnChange
            >
              <SmoothScrollProvider>
                {children}
              </SmoothScrollProvider>
            </ThemeProvider>
            <CustomCursor />
          </CartProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
