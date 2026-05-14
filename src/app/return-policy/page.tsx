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

export default function ReturnPolicyPage() {
  return (
    <InfoPageTemplate 
      title="RETURN POLICY" 
      subtitle="Effective: 1 January 2025 · Jurisdiction: Malaysia"
      content={
        <>
          <Section title="1. Overview">
            <p>
              This Return & Refund Policy is governed by the <strong className="text-foreground">Consumer Protection Act 1999 (Act 599)</strong> and the <strong className="text-foreground">E-Commerce Consumer Protection Guidelines</strong> issued by the Ministry of Domestic Trade & Cost of Living (KPDN), Malaysia.
            </p>
            <p>
              By purchasing from Vault 6 Studios, you acknowledge and agree to the terms set out in this policy.
            </p>
          </Section>

          <Section title="2. Eligibility for Returns">
            <p>Returns are accepted under the following conditions only:</p>
            <ul className="list-disc list-inside space-y-2 text-foreground/60">
              <li>Item received is <strong className="text-foreground">damaged or defective</strong> due to transit or manufacturing fault.</li>
              <li>Item received is <strong className="text-foreground">materially different</strong> from the product listing (e.g. wrong figure, wrong variant).</li>
              <li>Item is <strong className="text-foreground">missing components</strong> that were explicitly stated as included in the listing.</li>
            </ul>
            <p className="text-foreground/60 text-xs mt-4">
              Returns are <strong className="text-foreground">not accepted</strong> for change of mind, collector's remorse, or minor cosmetic variations inherent to prize figure manufacturing tolerances.
            </p>
          </Section>

          <Section title="3. Return Window">
            <p>
              Return requests must be submitted within <strong className="text-foreground">7 calendar days</strong> from the date of delivery, in accordance with Section 14 of the Consumer Protection Act 1999.
            </p>
            <p>
              Requests submitted after this window will not be entertained unless the defect is latent and could not reasonably have been discovered within the return period.      
            </p>
          </Section>

          <Section title="4. Condition of Returned Items">
            <p>All returned items must be:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>In the <strong className="text-foreground">same condition as received</strong> — including all original packaging, accessories, and documentation.</li>
              <li>Securely packed to prevent additional damage in transit.</li>
              <li>Accompanied by <strong className="text-foreground">photographic evidence</strong> of the defect or discrepancy, submitted at the time of the return request.</li>      
            </ul>
            <p className="text-foreground/60 text-xs mt-4">
              Items returned in a condition worse than received, or without original packaging, may be subject to partial refund or rejection at our discretion.
            </p>
          </Section>

          <Section title="5. Non-Returnable Items">
            <p>The following are strictly non-returnable:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Items listed as <strong className="text-foreground">Pre-Order</strong> — unless the item arrives damaged or incorrect.</li>
              <li>Items where the original seal has been <strong className="text-foreground">broken by the buyer</strong> after receipt, unless the defect is internal.</li>
              <li>Items purchased during <strong className="text-foreground">clearance or final-sale</strong> promotions, where explicitly marked as non-returnable.</li>
            </ul>
          </Section>

          <Section title="6. How to Request a Return">
            <p>To initiate a return:</p>
            <ol className="list-decimal list-inside space-y-3">
              <li>Contact us via WhatsApp within the 7-day window.</li>
              <li>Provide your <strong className="text-foreground">order reference</strong>, photos of the defective or incorrect item, and a brief description of the issue.</li>       
              <li>Await confirmation. We will respond within <strong className="text-foreground">2 business days</strong>.</li>
              <li>If approved, ship the item back to the address provided. <strong className="text-foreground">Return shipping cost</strong> is borne by the buyer unless the fault is ours.</li>
            </ol>
          </Section>

          <Section title="7. Refunds">
            <p>Upon receipt and inspection of the returned item:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Approved refunds will be processed within <strong className="text-foreground">7–14 business days</strong>.</li>
              <li>Refunds are issued via the <strong className="text-foreground">original payment method</strong> (bank transfer, e-wallet, or platform credit).</li>
              <li>Original shipping fees are non-refundable unless the return is due to our error.</li>
            </ul>
          </Section>

          <Section title="8. Exchanges">
            <p>
              We do not offer direct exchanges. If your return is approved, a <strong className="text-foreground">full refund</strong> will be issued and you may place a new order for the correct item, subject to stock availability.
            </p>
          </Section>

          <Section title="9. Governing Law">
            <p>
              This policy is subject to and construed in accordance with the laws of <strong className="text-foreground">Malaysia</strong>. Any disputes shall be resolved under the jurisdiction of the Malaysian courts, with reference to:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>Consumer Protection Act 1999 (Act 599)</li>
              <li>Sale of Goods Act 1957 (Act 382)</li>
              <li>Electronic Commerce Act 2006 (Act 658)</li>
            </ul>
          </Section>

          <Section title="10. Contact">
            <p>
              For all return and refund enquiries, please visit our <Link href="/contact" className="text-v6-accent hover:text-foreground transition-colors">Contact Us</Link> page.      
            </p>
          </Section>
        </>
      }
    />
  );
}
