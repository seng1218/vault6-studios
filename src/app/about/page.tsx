"use client";

import React from "react";
import Link from "next/link";
import { InfoPageTemplate } from "@/components/info-page-template";

const Section = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <div className="border-b border-foreground/10 pb-10 mb-10">
    <h2 className="text-xs font-black uppercase tracking-[0.4em] v6-accent-text mb-4">{title}</h2>
    <div className="space-y-4 text-foreground/80 text-sm leading-relaxed">{children}</div>
  </div>
);

export default function AboutPage() {
  return (
    <InfoPageTemplate 
      title="ABOUT US" 
      subtitle="Vault 6 Studios · Established 2023 · Malaysia"
      content={
        <>
          <Section title="Who We Are">
            <p>
              <strong className="text-foreground">Vault 6 Studios</strong> is a Malaysia-based private seller of Japanese collectible figures and related merchandise, operating under the brand <strong className="text-foreground">Crafted Legacies</strong>. We were established in 2023 with a focus on making premium anime and pop-culture collectibles accessible to Malaysian collectors through a transparent, trust-first approach.
            </p>
            <p>
              We operate exclusively within Malaysia and conduct all transactions through our online storefront at <strong className="text-foreground">vault6studios.com</strong>. Payments are processed securely via <strong className="text-foreground">Razorpay Curlec</strong> (Curlec Sdn. Bhd.), a Bank Negara Malaysia-licensed payment service provider.
            </p>
            <p className="text-foreground/60 text-xs border border-foreground/10 p-4 rounded-lg">
              <strong className="text-foreground">Business Type:</strong> Private individual seller &nbsp;·&nbsp; <strong className="text-foreground">Country of Operation:</strong> Malaysia &nbsp;·&nbsp; <strong className="text-foreground">Industry:</strong> Collectibles & Merchandise Retail &nbsp;·&nbsp; <strong className="text-foreground">Established:</strong> 2023
            </p>
          </Section>

          <Section title="What We Sell">
            <p>
              We specialise in <strong className="text-foreground">authenticated, condition-graded second-hand and new Japanese collectible figures</strong> from licensed manufacturers, including but not limited to:
            </p>
            <ul className="list-disc list-inside space-y-1 text-foreground/60 columns-2">
              <li className="text-foreground/80">Taito Corporation</li>
              <li className="text-foreground/80">FuRyu Corporation</li>
              <li className="text-foreground/80">Banpresto Co. Ltd.</li>
              <li className="text-foreground/80">Kotobukiya Co. Ltd.</li>
              <li className="text-foreground/80">Alter Co. Ltd.</li>
              <li className="text-foreground/80">Good Smile Company</li>
              <li className="text-foreground/80">Animester</li>
              <li className="text-foreground/80">Bear Panda</li>
            </ul>
            <p>
              Our inventory includes figures from popular anime, game, and manga franchises, covering prize figures, scale figures, non-scale figures, and licensed merchandise. Each item is individually graded and listed with our proprietary <strong className="text-foreground">10-point Dispatch Condition System</strong> before being made available on the storefront.
            </p>
            <p className="text-foreground/60 text-xs">
              Vault 6 Studios is not an authorised distributor of any of the manufacturers listed above. All character intellectual property belongs to the respective rights holders. Product names are used for descriptive identification purposes only.
            </p>
          </Section>

          <Section title="Our Grading Standards">
            <p>
              Every item in our inventory is assessed under our <strong className="text-foreground">10-point Dispatch Condition Grading System</strong>, ranging from <strong className="text-foreground">10/10 MISB</strong> (Mint in Sealed Box) to <strong className="text-foreground">1/10 Battle Scars</strong> (heavily damaged, sold for display/parts). This system ensures buyers receive an honest, consistent assessment of each item's physical state before purchase.
            </p>
            <p>
              In addition to condition grading, each product is assigned an <strong className="text-foreground">Authenticity Grade</strong>:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li><strong className="text-foreground">Verified Authentic</strong> — Authenticated through physical inspection of manufacturer markings, serial codes, and packaging quality.</li>     
              <li><strong className="text-foreground">Authentic but Unverified</strong> — Believed genuine based on available evidence; not subjected to full authentication protocol.</li>
              <li><strong className="text-foreground">Bootleg</strong> — Non-genuine, openly disclosed as unlicensed reproduction. Sold transparently under clear buyer acknowledgement.</li>
            </ul>
            <p className="text-foreground/60 text-xs">
              Our grading and authenticity standards reflect our commitment to transparency. We encourage buyers to contact us for additional photos or information before making a purchase decision.
            </p>
          </Section>

          <Section title="Our Ethos">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="border border-foreground/10 p-5 rounded-lg">
                <p className="text-foreground font-black text-[10px] uppercase tracking-[0.4em] mb-3">Curation</p>
                <p className="text-foreground/60 text-xs leading-relaxed">Every piece is hand-selected. If it isn't S-tier, it doesn't enter the Vault.</p>
              </div>
              <div className="border border-foreground/10 p-5 rounded-lg">
                <p className="text-foreground font-black text-[10px] uppercase tracking-[0.4em] mb-3">Authenticity</p>
                <p className="text-foreground/60 text-xs leading-relaxed">Direct sourcing and multi-stage verification. Every authenticity grade is disclosed without exception.</p>
              </div>
              <div className="border border-foreground/10 p-5 rounded-lg">
                <p className="text-foreground font-black text-[10px] uppercase tracking-[0.4em] mb-3">Integrity</p>
                <p className="text-foreground/60 text-xs leading-relaxed">Accurate condition reporting. What you see in the Archive is what reaches your hands.</p>
              </div>
            </div>
          </Section>

          <Section title="Business Information">
            <p>
              The following information is provided in accordance with Malaysian e-commerce transparency requirements and our payment service provider's compliance guidelines.
            </p>
            <div className="border border-foreground/10 p-6 rounded-lg space-y-3 text-sm">
              <div className="flex gap-4">
                <span className="text-foreground/60 font-black text-[10px] uppercase tracking-widest w-32 shrink-0">Business Name</span>
                <span className="text-foreground">Vault 6 Studios (Crafted Legacies)</span>
              </div>
              <div className="flex gap-4">
                <span className="text-foreground/60 font-black text-[10px] uppercase tracking-widest w-32 shrink-0">Business Type</span>
                <span className="text-foreground/80">Private seller — collectibles retail</span>
              </div>
              <div className="flex gap-4">
                <span className="text-foreground/60 font-black text-[10px] uppercase tracking-widest w-32 shrink-0">Established</span>
                <span className="text-foreground/80">2023</span>
              </div>
              <div className="flex gap-4">
                <span className="text-foreground/60 font-black text-[10px] uppercase tracking-widest w-32 shrink-0">Country</span>
                <span className="text-foreground/80">Malaysia</span>
              </div>
              <div className="flex gap-4">
                <span className="text-foreground/60 font-black text-[10px] uppercase tracking-widest w-32 shrink-0">Currency</span>
                <span className="text-foreground/80">Malaysian Ringgit (MYR)</span>
              </div>
              <div className="flex gap-4">
                <span className="text-foreground/60 font-black text-[10px] uppercase tracking-widest w-32 shrink-0">Payment</span>
                <span className="text-foreground/80">Processed by Razorpay Curlec (Curlec Sdn. Bhd.)</span>
              </div>
            </div>
            <p className="text-foreground/60 text-xs mt-4">
              For full contact details, trading address, and direct communication channels, see our <Link href="/contact" className="text-v6-accent hover:text-foreground transition-colors">Contact Us</Link> page.
            </p>
          </Section>

          <Section title="Legal & Compliance">
            <p>
              Vault 6 Studios operates in compliance with applicable Malaysian consumer protection and e-commerce legislation, including:
            </p>
            <ul className="list-disc list-inside space-y-1 text-foreground/60">
              <li>Consumer Protection Act 1999 (Act 599)</li>
              <li>Electronic Commerce Act 2006 (Act 658)</li>
              <li>Personal Data Protection Act 2010 (Act 709)</li>
              <li>Sale of Goods Act 1957 (Act 382)</li>
              <li>Trade Marks Act 2019 (Act 815)</li>
              <li>Copyright Act 1987 (Act 332)</li>
            </ul>
            <p className="mt-4">
              Our full legal terms, policies, and buyer rights are documented in the links below.
            </p>
          </Section>
        </>
      }
    />
  );
}
