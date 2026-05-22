"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useSettings } from "@/components/settings-provider";
import { Shield, Globe, CreditCard, Truck, RefreshCcw, Mail } from "lucide-react";

export function Footer() {
  const { settings } = useSettings();

  const footerLinks = [
    {
      title: "PROTOCOL",
      links: [
        { name: "Shipping", href: "/shipping" },
        { name: "Payment Policy", href: "/payment-policy" },
      ],
    },
    {
      title: "LEGAL",
      links: [
        { name: "Return Policy", href: "/return-policy" },
        { name: "Privacy Policy", href: "/privacy-policy" },
        { name: "Terms & Conditions", href: "/terms" },
      ],
    },
  ];

  return (
    <footer className="relative bg-background border-t border-foreground/5 pt-32 pb-12 px-6 md:px-12 z-20">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 md:gap-8 mb-24">
          
          {/* Brand Column */}
          <div className="md:col-span-2 space-y-8">
            <div className="flex flex-col">
              <span className="text-3xl font-black tracking-tighter uppercase italic leading-none">
                {settings.hero_title} <span className="v6-accent-text">{settings.hero_subtitle}</span>
              </span>
              <span className="text-[8px] font-black uppercase tracking-[0.5em] v6-accent-text mt-2">
                {settings.hero_subheading}
              </span>
            </div>
            <p className="opacity-40 text-xs font-medium max-w-sm leading-relaxed uppercase tracking-wider">
              {settings.hero_description}
            </p>
          </div>

          {/* Links Columns */}
          {footerLinks.map((group) => (
            <div key={group.title} className="space-y-6">
              <h4 className="text-[10px] font-black tracking-[0.4em] uppercase opacity-20">{group.title}</h4>
              <ul className="space-y-4">
                {group.links.map((link) => (
                  <li key={link.name}>
                    <Link 
                      href={link.href}
                      className="text-xs font-black uppercase tracking-widest opacity-60 hover:opacity-100 hover:v6-accent-text transition-all flex items-center gap-2 group"
                    >
                      <div className="w-1 h-1 bg-v6-accent rounded-full scale-0 group-hover:scale-100 transition-transform" />
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Payment & Compliance Bar */}
        <div className="pt-12 border-t border-foreground/5 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-wrap justify-center gap-8 opacity-20 grayscale hover:grayscale-0 transition-all">
             <div className="flex items-center gap-2">
                <CreditCard size={14} />
                <span className="text-[8px] font-black uppercase tracking-widest">VISA / MASTERCARD / FPX</span>
             </div>
             <div className="flex items-center gap-2">
                <Globe size={14} />
                <span className="text-[8px] font-black uppercase tracking-widest">MALAYSIA BASED</span>
             </div>
             <div className="flex items-center gap-2">
                <Shield size={14} />
                <span className="text-[8px] font-black uppercase tracking-widest">PDPA COMPLIANT</span>
             </div>
          </div>

          <div className="text-right">
             <p className="text-[8px] font-black opacity-20 tracking-widest uppercase">
               © {new Date().getFullYear()} {settings.hero_title} {settings.hero_subtitle} STUDIOS. ALL RIGHTS RESERVED.
             </p>
             <p className="text-[7px] font-black opacity-10 tracking-widest uppercase mt-1">
               Registered under Malaysian Consumer Protection Act 1999 & Electronic Commerce Act 2006.
             </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
