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
  title: "Vault 6 Studios | Authenticated Artifacts",
  description: "Experience the next generation of figurine collecting with our interactive 3D archive.",
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
    hero_subheading: "Premium Artifact Database",
    hero_description: "Authenticated Japanese collectible figures — curated for serious collectors.",
  };
  const initialSettings = { ...settingsDefaults, ...(settingsRes.success ? settingsRes.data : {}) };

  return (
    <html lang="en" suppressHydrationWarning>
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
