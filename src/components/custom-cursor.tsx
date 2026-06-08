"use client";

import React, { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";

export function CustomCursor() {
  const [mounted, setMounted] = useState(false);
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);

  const springConfig = { damping: 30, stiffness: 800, mass: 0.5 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    setMounted(true);

    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);

      const target = e.target as HTMLElement;
      const isInteractive = !!target.closest("button, a, .group, input, [role='button']");
      setIsHovering(isInteractive);
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    window.addEventListener("mousemove", moveCursor);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    
    return () => {
      window.removeEventListener("mousemove", moveCursor);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [cursorX, cursorY]);

  if (!mounted) return null;

  return (
    <motion.div
      className="fixed top-0 left-0 pointer-events-none z-[9999] flex items-center justify-center mix-blend-difference md:mix-blend-normal"
      style={{
        x: cursorXSpring,
        y: cursorYSpring,
        translateX: "-50%",
        translateY: "-50%",
      }}
    >
      {/* Outer Reticle - Rotating Brackets */}
      <motion.div
        animate={{ 
          rotate: isHovering ? 90 : 0,
          scale: isHovering ? 1.5 : 1,
          opacity: isHovering ? 1 : 0.4
        }}
        className="absolute w-10 h-10 border-v6-accent/40"
      >
        <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-v6-accent" />
        <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-v6-accent" />
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-v6-accent" />
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-v6-accent" />
      </motion.div>

      {/* Inner Dot / Core */}
      <motion.div
        animate={{
          scale: isClicking ? 0.8 : isHovering ? 1.2 : 1,
          backgroundColor: isHovering ? "var(--v6-accent)" : "#ffffff"
        }}
        className="w-1.5 h-1.5 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]"
      />

      {/* HUD Labels */}
      <AnimatePresence>
        {isHovering && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 30 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute left-0 pointer-events-none"
          >
            <div className="flex flex-col gap-0.5 font-mono text-[7px] font-black uppercase tracking-[0.2em] text-v6-accent whitespace-nowrap">
              <span className="animate-pulse">Scanning_Target...</span>
              <span className="opacity-40">Uplink: Secure</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Subtle Pulsing Ring */}
      {isHovering && (
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 2, opacity: 0 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
          className="absolute w-10 h-10 border border-v6-accent rounded-full"
        />
      )}
    </motion.div>
  );
}
