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

export default function PrivacyPolicyPage() {
  return (
    <InfoPageTemplate 
      title="PRIVACY POLICY" 
      subtitle="Effective: 1 May 2026 · Jurisdiction: Malaysia"
      content={
        <>
          <Section title="1. Data Controller & Overview">
            <p>
              This Privacy Policy governs the collection, use, storage, and disclosure of personal data by <strong className="text-foreground">Vault 6 Studios</strong> (“we”, “us”, “our”), operating at <strong className="text-foreground">vault6studios.com</strong>, in compliance with the <strong className="text-foreground">Personal Data Protection Act 2010 (Act 709) (PDPA)</strong> of Malaysia and, where applicable, the principles of the EU <strong className="text-foreground">General Data Protection Regulation (GDPR)</strong>.
            </p>
            <p>
              By placing an order, creating an account, subscribing to our newsletter, or otherwise interacting with this site, you consent to the practices described herein. If you do not agree, please refrain from using our services.
            </p>
            <p className="text-foreground/60 text-xs border border-foreground/10 p-4 rounded-lg">
              <strong className="text-foreground">Note to EU/EEA Residents:</strong> Where our processing activities fall within the territorial scope of GDPR (Article 3), we honour the GDPR rights set out in Section 9 of this policy in addition to your PDPA rights.
            </p>
          </Section>

          <Section title="2. Personal Data We Collect">
            <p>We collect the following categories of personal data when you interact with us:</p>

            <div className="space-y-6">
              <div>
                <p className="text-foreground font-bold text-xs uppercase tracking-widest mb-2">Identity & Contact Data</p>
                <ul className="list-disc list-inside space-y-1 text-foreground/60">
                  <li>Full name</li>
                  <li>Email address</li>
                  <li>Mobile phone number</li>
                  <li>Delivery address (street, city, postcode, state)</li>
                </ul>
              </div>

              <div>
                <p className="text-foreground font-bold text-xs uppercase tracking-widest mb-2">Transaction Data</p>
                <ul className="list-disc list-inside space-y-1 text-foreground/60">
                  <li>Order history, items purchased, quantities, and amounts paid</li>
                  <li>Payment method type (e.g. credit card, FPX, e-wallet) — we do not store full card numbers; payment is processed by Fiuu Sdn. Bhd. (Fiuu).</li>
                  <li>Shipping tracking numbers and dispatch records</li>
                  <li>Voucher codes used and discounts applied</li>
                </ul>
              </div>

              <div>
                <p className="text-foreground font-bold text-xs uppercase tracking-widest mb-2">Account & Membership Data (if applicable)</p>
                <ul className="list-disc list-inside space-y-1 text-foreground/60">
                  <li>Member email and name</li>
                  <li>Password (stored as a cryptographic hash — never in plaintext)</li>
                  <li>Membership tier, loyalty points, and total spend records</li>
                  <li>Admin notes and internal correspondence</li>
                </ul>
              </div>

              <div>
                <p className="text-foreground font-bold text-xs uppercase tracking-widest mb-2">Technical & Usage Data</p>
                <ul className="list-disc list-inside space-y-1 text-foreground/60">
                  <li>IP address and general geolocation (country/city) — processed by Cloudflare, Inc. as our infrastructure provider</li>
                  <li>Browser type, operating system, and device type</li>
                  <li>Pages visited and interaction patterns on this site</li>
                </ul>
              </div>

              <div>
                <p className="text-foreground font-bold text-xs uppercase tracking-widest mb-2">Communication Data</p>
                <ul className="list-disc list-inside space-y-1 text-foreground/60">
                  <li>Messages and enquiries submitted via WhatsApp or email</li>
                  <li>Feedback and reviews you voluntarily submit</li>
                </ul>
              </div>
            </div>
          </Section>

          <Section title="3. Legal Basis for Processing (Seven PDPA Principles)">
            <p>
              Under the PDPA 2010, we process personal data in accordance with the following seven Data Protection Principles:
            </p>
            <ul className="list-disc list-inside space-y-3">
              <li><strong className="text-foreground">General Principle:</strong> Data is collected only for lawful purposes directly related to our business activities.</li>
              <li><strong className="text-foreground">Notice & Choice:</strong> You are informed of the purposes at or before the point of collection. Consent is obtained for non-essential processing such as direct marketing.</li>
              <li><strong className="text-foreground">Disclosure:</strong> We do not disclose personal data to third parties except as described in Section 5 of this policy, or as required by law.</li>
              <li><strong className="text-foreground">Security:</strong> Appropriate technical and organisational measures are in place to protect data against unauthorised access, loss, or destruction.</li>
              <li><strong className="text-foreground">Retention:</strong> Data is not retained beyond what is necessary for the stated purposes, or the minimum retention period required by law.</li>  
              <li><strong className="text-foreground">Data Integrity:</strong> We take reasonable steps to ensure personal data is accurate, complete, and up-to-date.</li>
              <li><strong className="text-foreground">Access:</strong> You have the right to access and correct your personal data as described in Section 9.</li>
            </ul>
          </Section>

          <Section title="4. How We Use Your Personal Data">
            <p>We process your personal data for the following purposes:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>To <strong className="text-foreground">process and fulfil orders</strong>, including payment verification, packaging, and dispatch</li>
              <li>To <strong className="text-foreground">communicate with you</strong> regarding your order status, shipping updates, and returns</li>
              <li>To <strong className="text-foreground">maintain your membership account</strong> and administer loyalty points and tier benefits</li>
              <li>To <strong className="text-foreground">send marketing communications</strong> (newsletters, promotions) — only where you have subscribed or given explicit consent, and only until you withdraw such consent</li>
              <li>To <strong className="text-foreground">detect and prevent fraud</strong>, unauthorised transactions, and abuse of our platform</li>
              <li>To <strong className="text-foreground">comply with legal and regulatory obligations</strong>, including tax records required under the Income Tax Act 1967 and other applicable Malaysian statutes</li>
              <li>To <strong className="text-foreground">improve our services</strong> through aggregated, anonymised analysis of site usage patterns</li>
            </ul>
            <p className="text-foreground/60 text-xs mt-4">
              We do not use personal data for automated profiling or decision-making that produces legal or similarly significant effects without human review.
            </p>
          </Section>

          <Section title="5. Disclosure to Third Parties">
            <p>
              We do not sell, rent, or trade your personal data. We share personal data only with the following categories of third parties, strictly on a need-to-know basis:
            </p>
            <ul className="list-disc list-inside space-y-3">
              <li>
                <strong className="text-foreground">Fiuu Sdn. Bhd. (Payment Processor):</strong>{" "}Your payment details are submitted directly to Fiuu&apos;s secure gateway. We receive only transaction confirmation and payment method type. Fiuu&apos;s privacy policy governs their handling of payment data.
              </li>
              <li>
                <strong className="text-foreground">Courier Partners</strong> (J&T Express, PosLaju, NinjaVan, DHL eCommerce, etc.): Your name, delivery address, and phone number are shared with the assigned courier solely for the purpose of parcel delivery.
              </li>
              <li>
                <strong className="text-foreground">Cloudflare, Inc. (Infrastructure Provider):</strong> Technical data including IP addresses passes through Cloudflare's network for security, DDoS protection, and content delivery. Cloudflare is certified under SOC 2 Type II and ISO 27001.
              </li>
              <li>
                <strong className="text-foreground">Resend, Inc. (Transactional Email):</strong> Where email is used to deliver membership credentials or transactional notifications, Resend processes your email address solely for message delivery.
              </li>
            </ul>
          </Section>

          <Section title="6. Data Retention">
            <ul className="list-disc list-inside space-y-2">
              <li><strong className="text-foreground">Order and transaction records:</strong> Retained for a minimum of <strong className="text-foreground">7 years</strong> from the date of transaction, in accordance with the Income Tax Act 1967 and the Companies Act 2016 (audit trail requirements).</li>
              <li><strong className="text-foreground">Member account data:</strong> Retained for the duration of active membership plus <strong className="text-foreground">2 years</strong> after account deletion, to resolve any outstanding disputes.</li>
              <li><strong className="text-foreground">Newsletter subscription data:</strong> Retained until you unsubscribe or withdraw consent.</li>
              <li><strong className="text-foreground">Communication records:</strong> Retained for <strong className="text-foreground">3 years</strong> for dispute resolution purposes.</li>
              <li><strong className="text-foreground">Technical log data:</strong> Retained for up to <strong className="text-foreground">90 days</strong> by Cloudflare per their standard data retention policy.</li>
            </ul>
          </Section>

          <Section title="7. Data Security">
            <p>We implement the following technical and organisational security measures:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>All data transmitted between your browser and our site is encrypted using <strong className="text-foreground">TLS 1.2 or higher (HTTPS)</strong>.</li>
              <li>Member passwords are stored as <strong className="text-foreground">cryptographic hashes</strong> (one-way bcrypt or equivalent); no plaintext passwords are stored or accessible to us.</li>
              <li>Admin access to customer data is protected by a <strong className="text-foreground">time-limited session token system</strong> with no persistent access keys in the codebase.</li>   
              <li>Data is stored on <strong className="text-foreground">Cloudflare Workers KV</strong>, which operates within Cloudflare's global infrastructure with physical and logical access controls, SOC 2 Type II certification, and data residency in the APAC region.</li>
              <li>We apply the principle of <strong className="text-foreground">least privilege</strong>: only personnel with a direct operational need can access personal data.</li>
            </ul>
          </Section>

          <Section title="8. Cookies & Tracking Technologies">
            <p>We use minimal cookies:</p>
            <ul className="list-disc list-inside space-y-2">
              <li><strong className="text-foreground">Session cookie (admin_session):</strong> An HTTP-only, Secure, SameSite=Strict cookie used exclusively for administrative authentication. Not set for regular shoppers.</li>
              <li><strong className="text-foreground">Cloudflare security cookies:</strong> Cloudflare may set cookies (e.g. <code className="v6-accent-text text-xs">__cf_bm</code>) for bot detection and DDoS mitigation. These are strictly functional and not used for advertising.</li>
            </ul>
            <p>
              We do not use third-party advertising cookies, social media tracking pixels, or behavioural analytics tools (e.g. Google Analytics, Facebook Pixel).
            </p>
          </Section>

          <Section title="9. Your Rights">
            <p>
              Under the PDPA 2010, you have the following rights regarding your personal data:
            </p>
            <ul className="list-disc list-inside space-y-3">
              <li><strong className="text-foreground">Right of Access (Section 30, PDPA):</strong> You may request a copy of the personal data we hold about you. We will respond within <strong className="text-foreground">21 days</strong> of receipt of a valid written request.</li>
              <li><strong className="text-foreground">Right of Correction (Section 34, PDPA):</strong> You may request correction of inaccurate or incomplete personal data. We will correct or supplement the data within <strong className="text-foreground">21 days</strong> or notify you if we are unable to do so.</li>
              <li><strong className="text-foreground">Right to Withdraw Marketing Consent (Section 38, PDPA):</strong> You may opt out of direct marketing at any time by contacting us or using the unsubscribe link in any marketing email. Withdrawal does not affect the lawfulness of prior processing.</li>
              <li><strong className="text-foreground">Right to Restrict Processing:</strong> In limited circumstances, you may request that we restrict processing of your data while a dispute or correction request is pending.</li>
            </ul>
            <p className="mt-4">
              <strong className="text-foreground">For EU/EEA Residents (GDPR):</strong> In addition to the above, you have the right to data portability (Article 20), the right to object to processing based on legitimate interests (Article 21), and the right to lodge a complaint with your local data protection supervisory authority.
            </p>
            <p className="mt-4">
              To exercise any of these rights, contact us via WhatsApp or email with subject line <strong className="text-foreground">“PDPA Data Request”</strong>. We may require you to verify your identity before processing the request.
            </p>
          </Section>

          <Section title="10. Contact & Data Officer">
            <p>
              For all data protection enquiries, access requests, correction requests, or complaints, please visit our <Link href="/contact" className="text-v6-accent hover:text-foreground transition-colors">Contact Us</Link> page.
            </p>
            <p className="text-foreground/60 text-xs mt-2">
              Vault 6 Studios operates as a private seller of collectible figures, registered and operating within Malaysia.
            </p>
          </Section>
        </>
      }
    />
  );
}
