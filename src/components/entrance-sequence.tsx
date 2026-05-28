"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface EntranceSequenceProps {
  onComplete: () => void;
}

export function EntranceSequence({ onComplete }: EntranceSequenceProps) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    // Phase 1: Boot (Laser scan)
    const t1 = setTimeout(() => setPhase(1), 500);
    // Phase 2: Logo Reveal
    const t2 = setTimeout(() => setPhase(2), 1200);
    // Phase 3: Text Auth
    const t3 = setTimeout(() => setPhase(3), 2200);
    // Complete
    const t4 = setTimeout(() => onComplete(), 3500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.1, filter: "blur(20px)" }}
      transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-[200] bg-background flex flex-col items-center justify-center overflow-hidden pointer-events-none"
    >
      {/* 1. Backdrop Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
      
      {/* 2. Laser Scan Line */}
      <motion.div 
        initial={{ top: "-10%" }}
        animate={{ top: "110%" }}
        transition={{ duration: 2, ease: "easeInOut" }}
        className="absolute left-0 w-full h-[2px] bg-v6-accent/40 shadow-[0_0_20px_var(--v6-glow)] z-10"
      />

      <div className="relative flex flex-col items-center">
        {/* 3. The Logo with Glitch Effects */}
        <AnimatePresence>
          {phase >= 1 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative"
            >
              {/* Primary Logo */}
              <Image 
                src="/logo.png" 
                alt="Vault Logo" 
                width={180} 
                height={180} 
                className="relative z-10 drop-shadow-[0_0_30px_var(--v6-glow)] h-auto"
                priority
              />

              {/* Glitch Ghost (Red Shift) */}
              <motion.div
                animate={{ 
                  x: [0, -4, 2, 0],
                  opacity: [0, 0.4, 0, 0.2, 0]
                }}
                transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 0.1 }}
                className="absolute inset-0 z-0 grayscale invert sepia saturate-[5] hue-rotate-[320deg] blur-[1px]"
              >
                <Image src="/logo.png" alt="" width={180} height={180} className="h-auto" />
              </motion.div>

              {/* Glitch Ghost (Cyan Shift) */}
              <motion.div
                animate={{ 
                  x: [0, 4, -2, 0],
                  opacity: [0, 0.4, 0, 0.2, 0]
                }}
                transition={{ duration: 0.25, repeat: Infinity, repeatDelay: 0.15 }}
                className="absolute inset-0 z-0 grayscale invert sepia saturate-[5] hue-rotate-[180deg] blur-[1px]"
              >
                <Image src="/logo.png" alt="" width={180} height={180} className="h-auto" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 4. Auth Text */}
        <div className="h-10 mt-8 font-mono text-[10px] tracking-[0.6em] uppercase flex flex-col items-center overflow-hidden">
          <AnimatePresence mode="wait">
            {phase === 1 && (
              <motion.span 
                key="p1"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 0.4 }}
                exit={{ y: -20, opacity: 0 }}
              >
                Initializing_Neural_Link...
              </motion.span>
            )}
            {phase === 2 && (
              <motion.span 
                key="p2"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                className="v6-accent-text font-black"
              >
                VAULT_ACCESS_GRANTED
              </motion.span>
            )}
            {phase === 3 && (
              <motion.span 
                key="p3"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0.5, 1] }}
                transition={{ repeat: Infinity, duration: 0.1 }}
                className="text-foreground"
              >
                &gt; ESTABLISHING_SECURE_CON...
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Side Decorative Tech Brackets */}
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: phase >= 1 ? 0.2 : 0, x: 0 }}
        className="absolute left-10 top-1/2 -translate-y-1/2 flex flex-col gap-4"
      >
        <div className="w-1 h-32 bg-foreground/40" />
        <div className="w-4 h-[1px] bg-foreground/40" />
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: phase >= 1 ? 0.2 : 0, x: 0 }}
        className="absolute right-10 top-1/2 -translate-y-1/2 flex flex-col items-end gap-4"
      >
        <div className="w-1 h-32 bg-foreground/40" />
        <div className="w-4 h-[1px] bg-foreground/40" />
      </motion.div>
    </motion.div>
  );
}
