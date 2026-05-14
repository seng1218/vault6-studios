"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, MessageCircle, Mail, MapPin, Clock } from "lucide-react";
import { InfoPageTemplate } from "@/components/info-page-template";

const Section = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <div className="border-b border-foreground/10 pb-10 mb-10">
    <h2 className="text-xs font-black uppercase tracking-[0.4em] v6-accent-text mb-4">{title}</h2>
    <div className="space-y-4 text-foreground/80 text-sm leading-relaxed">{children}</div>
  </div>
);

export default function ContactPage() {
  const whatsapp = "+60103581396";
  const email = "SUPPORT@VAULT6STUDIOS.COM";
  const address = "KUALA LUMPUR, MALAYSIA";

  return (
    <InfoPageTemplate 
      title="CONTACT US" 
      subtitle="Vault 6 Studios · Malaysia"
      content={
        <>
          <Section title="Company Details">
            <div className="border border-foreground/10 p-6 rounded-lg space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-background border border-foreground/10 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin size={14} className="v6-accent-text" />
                </div>
                <div>
                  <p className="text-foreground font-black text-[10px] uppercase tracking-widest mb-1">
                    Vault 6 Studios
                  </p>
                  <p className="text-foreground/60 text-xs">
                    by Crafted Legacies
                  </p>
                  <p className="text-foreground/80 text-sm mt-1">{address}</p>
                </div>
              </div>
            </div>
          </Section>

          <Section title="Contact Channels">
            <div className="space-y-4">
              <a
                href={`https://wa.me/${whatsapp.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-5 border border-foreground/10 hover:border-v6-accent/50 bg-foreground/5 hover:bg-v6-accent/10 p-5 rounded-xl transition-all group"
              >
                <div className="w-10 h-10 bg-green-600/10 border border-green-600/20 rounded-full flex items-center justify-center shrink-0">
                  <MessageCircle size={18} className="text-green-500" />
                </div>
                <div className="flex-1">
                  <p className="text-foreground font-black text-[10px] uppercase tracking-widest mb-1">WhatsApp</p>
                  <p className="text-foreground/80 text-sm">{whatsapp}</p>
                  <p className="text-foreground/60 text-xs mt-1">Preferred channel — fastest response</p>
                </div>
                <ArrowRight size={14} className="text-foreground/60 group-hover:text-v6-accent transition-colors" />
              </a>

              <a
                href={`mailto:${email}`}
                className="flex items-center gap-5 border border-foreground/10 hover:border-v6-accent/50 bg-foreground/5 hover:bg-v6-accent/10 p-5 rounded-xl transition-all group"
              >
                <div className="w-10 h-10 bg-v6-accent/10 border border-v6-accent/20 rounded-full flex items-center justify-center shrink-0">
                  <Mail size={18} className="v6-accent-text" />
                </div>
                <div className="flex-1">
                  <p className="text-foreground font-black text-[10px] uppercase tracking-widest mb-1">Email</p>
                  <p className="text-foreground/80 text-sm">{email}</p>
                  <p className="text-foreground/60 text-xs mt-1">For formal enquiries, PDPA requests, and written correspondence</p>
                </div>
                <ArrowRight size={14} className="text-foreground/60 group-hover:text-v6-accent transition-colors" />
              </a>
            </div>
          </Section>

          <Section title="Response Times">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-background border border-foreground/10 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                <Clock size={14} className="v6-accent-text" />
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-foreground font-black text-[10px] uppercase tracking-widest mb-1">WhatsApp</p>
                  <p className="text-foreground/60 text-xs">Typically within <strong className="text-foreground">a few hours</strong> during business hours. We aim to respond to all messages within 24 hours.</p>
                </div>
                <div>
                  <p className="text-foreground font-black text-[10px] uppercase tracking-widest mb-1">Email</p>
                  <p className="text-foreground/60 text-xs">Within <strong className="text-foreground">1–2 business days</strong>. For urgent matters, WhatsApp is recommended.</p>
                </div>
                <p className="text-foreground/60 text-xs border-t border-foreground/10 pt-3 mt-3">
                  Business hours: Monday – Friday, 10:00 AM – 10:00 PM (Malaysia Time, UTC+8). We may respond outside these hours but cannot guarantee it.
                </p>
              </div>
            </div>
          </Section>

          <Section title="What to Include in Your Message">
            <p>To help us resolve your enquiry as quickly as possible, please include the following where applicable:</p>
            <ul className="list-disc list-inside space-y-2 text-foreground/60">
              <li><strong className="text-foreground">Order reference number</strong> — found in your order confirmation or WhatsApp notification</li>
              <li><strong className="text-foreground">Your name</strong> as provided during checkout</li>
              <li><strong className="text-foreground">Description of the issue</strong> — with photos if your enquiry relates to condition, damage, or returns</li>
              <li><strong className="text-foreground">Your preferred resolution</strong> — refund, replacement, or other</li>
            </ul>
          </Section>

          <Section title="Types of Enquiries">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { title: 'Order & Payment', items: ['Payment confirmation', 'Order status', 'Pre-order timelines', 'Invoice requests'] },
                { title: 'Shipping & Delivery', items: ['Tracking numbers', 'Delayed deliveries', 'Failed delivery', 'Address corrections'] },
                { title: 'Returns & Refunds', items: ['Damaged items', 'Wrong item received', 'Refund status', 'Return logistics'] },
                { title: 'Product Enquiries', items: ['Additional photos', 'Condition clarification', 'Authenticity verification', 'Product availability'] },
              ].map(({ title, items }) => (
                <div key={title} className="border border-foreground/10 p-4 rounded-lg">
                  <p className="text-foreground font-black text-[10px] uppercase tracking-widest mb-3">{title}</p>
                  <ul className="space-y-1">
                    {items.map(item => (
                      <li key={item} className="text-foreground/60 text-xs flex items-center gap-2">
                        <span className="w-1 h-1 bg-v6-accent rounded-full shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Data Protection Enquiries">
            <p>
              For requests under the <strong className="text-foreground">Personal Data Protection Act 2010 (PDPA)</strong> — including data access, correction, or withdrawal of consent — please contact us via email with the subject line <strong className="text-foreground">“PDPA Data Request”</strong>. We will respond within <strong className="text-foreground">21 business days</strong> and may require identity verification before processing the request.
            </p>
            <p>
              See our <Link href="/privacy-policy" className="text-v6-accent hover:text-foreground transition-colors">Privacy Policy</Link> for full details on your data rights.
            </p>
          </Section>
        </>
      }
    />
  );
}
