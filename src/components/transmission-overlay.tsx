"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { playSuccessSound } from "@/lib/sound-effects";
import { CheckCircle2, Cpu, Wifi } from "lucide-react";

interface TransmissionOverlayProps {
  isVisible: boolean;
  onComplete: () => void;
  itemName: string;
}

export function TransmissionOverlay({ isVisible, onComplete, itemName }: TransmissionOverlayProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onComplete();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[300] flex items-center justify-center p-6 pointer-events-none"
        >
          {/* Backdrop Blur */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-background/60 backdrop-blur-md"
          />

          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 1.1, opacity: 0, y: -20 }}
            className="relative bg-foreground text-background p-8 md:p-12 rounded-[2.5rem] shadow-[0_0_50px_rgba(0,0,0,0.5)] max-w-sm w-full overflow-hidden border border-white/10"
          >
            {/* Scanline Effect */}
            <motion.div 
              animate={{ top: ["-10%", "110%"] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              className="absolute inset-x-0 h-px bg-background/20 z-10"
            />

            <div className="relative z-20 space-y-6">
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 bg-background/10 rounded-xl flex items-center justify-center border border-background/20">
                  <Wifi className="animate-pulse" size={20} />
                </div>
                <div className="text-right font-mono text-[8px] opacity-40 uppercase tracking-widest leading-relaxed">
                  Manifest_ID: {Math.random().toString(36).substring(7).toUpperCase()}<br/>
                  Clearance: LEVEL_6_AUTHORIZED<br/>
                  Protocol: SECURE_DEPLOYMENT
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-v6-accent rounded-full animate-ping" />
                  <span className="text-[10px] font-black tracking-[0.5em] uppercase opacity-40">Shipment Authorized</span>
                </div>
                <h2 className="text-3xl font-black italic tracking-tighter uppercase leading-none">
                  {itemName}<span className="text-v6-accent">.</span>
                </h2>
              </div>

              <div className="pt-6 border-t border-background/10 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-v6-accent/10 rounded-lg">
                    <CheckCircle2 className="text-v6-accent" size={20} />
                  </div>
                  <p className="font-mono text-[10px] uppercase tracking-widest leading-relaxed">
                    Logistics link established. <br/>
                    Artifact secured for shipment.
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-background/5 p-3 rounded-xl font-mono text-[8px] uppercase tracking-widest space-y-1">
                    <div className="flex justify-between">
                      <span className="opacity-40">Validation</span>
                      <span className="text-v6-accent font-bold">SUCCESS</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="opacity-40">Status</span>
                      <span className="text-green-500">DEPARTING</span>
                    </div>
                  </div>
                  <div className="bg-background/5 p-3 rounded-xl font-mono text-[8px] uppercase tracking-widest space-y-1">
                    <div className="flex justify-between">
                      <span className="opacity-40">Weight</span>
                      <span>1.24 KG</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="opacity-40">Dim</span>
                      <span>24x18x32 CM</span>
                    </div>
                  </div>
                </div>

                <div className="font-mono text-[7px] opacity-20 uppercase tracking-[0.4em] text-center pt-2">
                  // ENCRYPTION_ACTIVE // AUTH_STAMP: V6_SECURE_VAULT
                </div>
              </div>
            </div>

            {/* Decorative Corner Brackets */}
            <div className="absolute top-4 left-4 w-4 h-4 border-t border-l border-background/20" />
            <div className="absolute top-4 right-4 w-4 h-4 border-t border-r border-background/20" />
            <div className="absolute bottom-4 left-4 w-4 h-4 border-b border-l border-background/20" />
            <div className="absolute bottom-4 right-4 w-4 h-4 border-b border-r border-background/20" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
