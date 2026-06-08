"use client";

import React from "react";
import Link from "next/link";
import { InfoPageTemplate } from "@/components/info-page-template";

const Section = ({ title, id, children }: { title: string, id?: string, children: React.ReactNode }) => (
  <div className="border-b border-foreground/10 pb-10 mb-10" id={id}>
    <h2 className="text-xs font-black uppercase tracking-[0.4em] v6-accent-text mb-4">{title}</h2>
    <div className="space-y-4 text-foreground/80 text-sm leading-relaxed">{children}</div>
  </div>
);

export default function ShippingPolicyPage() {
  return (
    <InfoPageTemplate 
      title="LOGISTICS PROTOCOL" 
      subtitle="ASEAN CORRIDOR DEPLOYMENT · REV: 2026.06.A"
      content={
        <>
          <Section title="1. Deployment Scope: ASEAN Corridor">
            <p>
              Vault 6 Studios operates a high-fidelity logistics network covering the <strong className="text-foreground text-v6-accent">ASEAN Corridor</strong>. We secure and deploy physical artifacts to the following regional nodes:
            </p>
            <ul className="list-disc list-inside space-y-2 text-foreground/60">
              <li><strong className="text-foreground">Malaysia</strong> (Peninsular, Sabah, Sarawak, Labuan)</li>
              <li><strong className="text-foreground">Singapore</strong> (City-State Wide)</li>
              <li><strong className="text-foreground">Indonesia</strong> (Java, Sumatra, Bali, and major provinces)</li>
              <li><strong className="text-foreground">Philippines</strong> (Luzon, Visayas, Mindanao)</li>
              <li><strong className="text-foreground">Thailand</strong> (Bangkok and nationwide)</li>
              <li><strong className="text-foreground">Vietnam</strong> (HCMC, Hanoi, and nationwide)</li>
            </ul>
            <p className="text-foreground/60 text-xs italic">
              Note: Remote or rural sectors may require extended transit times and additional logistics surcharges.
            </p>
          </Section>

          <Section title="2. The Inspection Protocol (Pre-Dispatch)">
            <p>
              Every artifact undergoes a multi-stage **Physical Verification Protocol** before it is cleared for departure.
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li><strong className="text-foreground">Box Integrity Scan:</strong> Visual inspection for factory seal (MISB) and corner integrity.</li>
              <li><strong className="text-foreground">Authenticity Check:</strong> Verification of manufacturer holographic seals and registration markers.</li>
              <li><strong className="text-foreground">Photo Documentation:</strong> High-resolution telemetry of the item is captured for our records prior to sealing the shipping carton.</li>
            </ul>
          </Section>

          <Section title="3. Processing & Handling">
            <p>
              Processing occurs Monday through Friday, 0900 – 1700 [GMT+8].
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>
                <strong className="text-foreground">Standard Hand-off:</strong> Orders are typically cleared for courier pickup within <strong className="text-foreground">1–2 business days</strong> of payment confirmation.
              </li>
              <li>
                <strong className="text-foreground">Pre-Order Deployment:</strong> Artifacts under pre-order status are shipped within 48 hours of arrival at the Vault 6 Command Centre.
              </li>
            </ul>
          </Section>

          <Section title="4. Regional Customs & De Minimis (Tax Framework)">
            <p>
              International shipments are subject to local customs regulations. The buyer (Importer of Record) is responsible for all duties, taxes, and brokerage fees.
            </p>
            
            <div className="overflow-x-auto mt-6">
              <table className="w-full text-[10px] border-collapse bg-foreground/[0.02] border border-foreground/10">
                <thead>
                  <tr className="border-b border-foreground/10 text-v6-accent">
                    <th className="text-left py-4 px-4 font-black uppercase tracking-widest">Sector</th>
                    <th className="text-left py-4 px-4 font-black uppercase tracking-widest">De Minimis (Tax-Free)</th>
                    <th className="text-left py-4 px-4 font-black uppercase tracking-widest">VAT / Duty Notes</th>
                  </tr>
                </thead>
                <tbody className="opacity-80">
                  <tr className="border-b border-foreground/5">
                    <td className="py-4 px-4 font-bold">SINGAPORE</td>
                    <td className="py-4 px-4 text-foreground">SGD 400.00</td>
                    <td className="py-4 px-4">Subject to 9% GST if above threshold.</td>
                  </tr>
                  <tr className="border-b border-foreground/5">
                    <td className="py-4 px-4 font-bold">INDONESIA</td>
                    <td className="py-4 px-4 text-foreground">USD 3.00</td>
                    <td className="py-4 px-4">Strict Threshold. 7.5% Duty + 11% VAT applies to almost all imports.</td>
                  </tr>
                  <tr className="border-b border-foreground/5">
                    <td className="py-4 px-4 font-bold">PHILIPPINES</td>
                    <td className="py-4 px-4 text-foreground">PHP 10,000.00</td>
                    <td className="py-4 px-4">Generous limit for collectors. 12% VAT applies if above.</td>
                  </tr>
                  <tr className="border-b border-foreground/5">
                    <td className="py-4 px-4 font-bold">THAILAND</td>
                    <td className="py-4 px-4 text-foreground">THB 1,500.00</td>
                    <td className="py-4 px-4">Duty-free under 1.5k, but 7% VAT applies to ALL imports.</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-foreground/40 text-[9px] mt-4 uppercase tracking-widest">
              VAT/GST and Duty calculations are handled by the receiving customs authority. Failure to pay may result in artifact destruction or return-to-sender at the buyer's expense.
            </p>
          </Section>

          <Section title="5. Strategic Packaging Protocol">
            <p>
              To ensure the structural integrity of every figure box, we use the **Vault 6 Multi-Layer Standard**:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li><strong className="text-foreground">L1: Moisture Seal</strong> — Industrial grade poly-wrap for humidity protection.</li>
              <li><strong className="text-foreground">L2: Shock Absorption</strong> — Double-layered 10mm bubble wrap cocoon.</li>
              <li><strong className="text-foreground">L3: Corner Reinforcement</strong> — Custom cardboard or foam corner protectors for premium scale figures.</li>
              <li><strong className="text-foreground">L4: Double-Walled Carton</strong> — Heavy-duty corrugated outer shipping box.</li>
              <li><strong className="text-foreground">L5: Tamper-Evident Seal</strong> — V6 holographic security tape.</li>
            </ul>
          </Section>

          <Section title="6. Transit Telemetry (Tracking)">
            <p>
              Once an order is dispatched, a **Logistics ID (Tracking Number)** is issued via WhatsApp and Email.
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li><strong className="text-foreground">Domestic (MY):</strong> J&T Express, NinjaVan, or PosLaju.</li>
              <li><strong className="text-foreground">International (ASEAN):</strong> Aramex, Janio, or DHL Express.</li>
            </ul>
            <p className="text-foreground/60 text-xs mt-2">
              Tracking data may take 12–24 hours to sync with regional hub telemetry.
            </p>
          </Section>

          <Section title="7. Delivery Failure & Re-Deployment">
            <p>
              Artifacts returned due to incorrect coordinates (address) or failed customs clearance can be re-deployed.
            </p>
            <ul className="list-disc list-inside space-y-2 text-foreground/60">
              <li><strong className="text-foreground">Re-shipping:</strong> Buyer covers the cost of the second transit attempt.</li>
              <li><strong className="text-foreground">Abandoned Shipments:</strong> Artifacts refused at customs or left uncollected for 14 days will be considered abandoned. No refunds are issued for abandoned international cargo.</li>
            </ul>
          </Section>

          <Section title="8. Box Condition Policy">
            <p>
              We guarantee **MISB (Mint in Sealed Box)** status at the point of dispatch. However, international logistics involves multi-hub handling that may result in minor superficial box wear (e.g., dented corners, surface scratches).
            </p>
            <p className="italic text-v6-accent/80 text-[11px]">
              Note: Collectors requiring "A+ Flawless" boxes for international transit should contact the Vault 6 Logistics Team for "Over-Engineered Packaging" quotes prior to order.
            </p>
          </Section>
        </>
      }
    />
  );
}
