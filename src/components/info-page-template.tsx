"use client";

import React from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { motion } from "framer-motion";

interface InfoPageProps {
  title: string;
  subtitle: string;
  content: React.ReactNode;
}

export function InfoPageTemplate({ title, subtitle, content }: InfoPageProps) {
  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-v6-accent selection:text-white transition-colors duration-500 overflow-x-hidden">
      <Header />
      
      {/* Cinematic Background */}
      <div className="fixed inset-0 z-0 flex flex-col items-center justify-center pointer-events-none opacity-[0.03]">
          <h1 className="text-[20vw] font-black leading-[0.7] uppercase tracking-tighter">{title.split(' ')[0]}</h1>
          <h1 className="text-[25vw] font-black leading-[0.7] uppercase text-outline">{title.split(' ')[1] || 'PROTOCOL'}</h1>
      </div>

      <div className="relative z-10 pt-48 pb-32 px-6 md:px-12 max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-12"
        >
          <div className="space-y-4">
             <span className="text-[10px] font-black v6-accent-text uppercase tracking-[0.5em] block">{subtitle}</span>
             <h2 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter leading-none">{title}<span className="v6-accent-text">.</span></h2>
          </div>

          <div className="prose prose-invert prose-v6 max-w-none">
            <div className="bg-foreground/[0.02] border border-foreground/5 rounded-[2.5rem] p-10 md:p-16 backdrop-blur-sm space-y-8 text-sm md:text-base opacity-80 leading-relaxed font-medium">
              {content}
            </div>
          </div>
        </motion.div>
      </div>

      <Footer />
    </main>
  );
}
