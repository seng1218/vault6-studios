"use client";

import React, { useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { playHoverSound, playClickSound } from "@/lib/sound-effects";
import { Maximize2, ShieldAlert } from "lucide-react";

interface ECommercePreviewProps {
  item: {
    id: string;
    name: string;
    category: string;
    price: string;
    status: string;
    scale: string;
    material: string;
    imageUrls?: string;
  };
}

export function ECommercePreview({ item }: ECommercePreviewProps) {
  const [frameIndex, setFrameIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isHudActive, setIsHudActive] = useState(false);
  const [zoomStyle, setZoomStyle] = useState<React.CSSProperties>({});
  const containerRef = useRef<HTMLDivElement>(null);

  const FRAME_COUNT = 24;

  // Use uploaded images when available; fall back to generated frame sequences
  const images = useMemo(() => {
    const uploaded = item.imageUrls
      ? item.imageUrls.split("\n").map(u => u.trim()).filter(Boolean)
      : [];

    if (uploaded.length > 0) {
      // Cycle uploaded images to fill FRAME_COUNT slots
      return Array.from({ length: FRAME_COUNT }).map((_, i) => uploaded[i % uploaded.length]);
    }

    // Fallback: generate 24 distinct camera angles from optimized product JPG images
    const name = (item.name || "").toLowerCase();
    const category = (item.category || "").toLowerCase();

    let startIndex = 1;
    if (name.includes("krypton")) {
      startIndex = 1;
    } else if (name.includes("samurai") || name.includes("detective")) {
      startIndex = 9;
    } else if (name.includes("jeet") || name.includes("master")) {
      startIndex = 17;
    } else if (name.includes("ronin") || name.includes("cyber")) {
      startIndex = 25;
    } else if (name.includes("pilot") || name.includes("tokyo")) {
      startIndex = 33;
    } else if (category.includes("vehicle") || category.includes("car") || name.includes("car")) {
      startIndex = 41;
    } else {
      let hash = 0;
      const str = item.id || "";
      for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
      }
      startIndex = Math.abs(hash % 35) + 1;
    }

    const frames = [];
    for (let i = 0; i < FRAME_COUNT; i++) {
      const frameNum = startIndex + Math.floor(i * (53 / FRAME_COUNT));
      const normalizedNum = ((frameNum - 1) % 53) + 1;
      const padNum = normalizedNum.toString().padStart(2, '0');
      frames.push(`/frames/motions rem/${padNum}.jpg`);
    }
    return frames;
  }, [item]);

  // Handle drag to rotate
  const handleDrag = (event: any, info: any) => {
    const threshold = 10;
    if (Math.abs(info.offset.x) > threshold) {
      const direction = info.offset.x > 0 ? -1 : 1;
      setFrameIndex((prev) => {
        let next = prev + direction;
        if (next >= FRAME_COUNT) next = 0;
        if (next < 0) next = FRAME_COUNT - 1;
        return next;
      });
    }
  };

  // Handle detailed magnifying zoom coordinates
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomStyle({
      transformOrigin: `${x}% ${y}%`,
    });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setZoomStyle({
      transformOrigin: "center center",
    });
  };

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full h-full bg-black/20 dark:bg-black/40 rounded-[2rem] overflow-hidden flex items-center justify-center border border-foreground/5 group-hover:border-v6-accent/30 transition-all duration-500 cursor-grab active:cursor-grabbing"
    >
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0}
        onDrag={handleDrag}
        className="absolute inset-0 z-20"
      />
      {/* 1. Cyberpunk Grid & Radar Blueprint Backdrops */}
      {isHudActive && (
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(59,130,246,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(59,130,246,0.05)_1px,transparent_1px)] bg-[size:16px_16px] z-0 pointer-events-none transition-opacity duration-300">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-dashed border-v6-accent/15 rounded-full animate-spin-slow pointer-events-none" style={{ animationDuration: "20s" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-v6-accent/10 rounded-full pointer-events-none" />
          {/* Scrolling Scanning line */}
          <div className="absolute inset-x-0 h-px bg-v6-accent/20 shadow-[0_0_15px_var(--v6-glow)] top-0 animate-scan pointer-events-none" />
        </div>
      )}

      {/* 2. Interactive Product Image with Cursor-following Zoom */}
      <div className="relative w-full h-full flex items-center justify-center p-4 overflow-hidden pointer-events-none select-none z-10">
        <AnimatePresence mode="wait">
          <motion.img
            key={`${item.id}-${frameIndex}`}
            src={images[frameIndex]}
            alt={item.name}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            style={{
              transform: isHovered ? "scale(1.15)" : "scale(1)",
              transition: "transform 0.25s cubic-bezier(0.25, 1, 0.5, 1)",
              ...zoomStyle,
            }}
            loading="lazy"
            className="max-w-[90%] max-h-[90%] object-contain v6-img-blend will-change-transform"
          />
        </AnimatePresence>
      </div>

      {/* 3. Tech Blueprint HUD Toggle Overlay */}
      <button
        type="button"
        onMouseEnter={playHoverSound}
        onClick={(e) => {
          e.stopPropagation();
          playClickSound();
          setIsHudActive(!isHudActive);
        }}
        className={`absolute top-4 left-4 z-40 px-3 py-1.5 rounded-lg border text-[8px] font-black uppercase tracking-widest transition-all ${
          isHudActive
            ? "bg-v6-accent text-white border-v6-accent shadow-[0_0_12px_var(--v6-glow)]"
            : "bg-foreground/5 border-foreground/10 text-foreground/40 hover:text-foreground/90 hover:border-foreground/25"
        }`}
      >
        {isHudActive ? "HUD ON" : "HUD OFF"}
      </button>

      {/* 4. Active Technical Status Info Overlay */}
      {isHudActive && (
        <div className="absolute inset-0 p-4 flex flex-col justify-between font-mono text-[7px] text-v6-accent/80 pointer-events-none z-20 select-none">
          {/* Top Info */}
          <div className="flex justify-between items-start pt-12">
            <div className="space-y-0.5">
              <div>DEPLOY_ID: {item.id}</div>
              <div>SCALE_SET: {item.scale || "1/6"}</div>
            </div>
            <div className="text-right space-y-0.5">
              <div>MATERIAL: {item.material || "PRO-POLY"}</div>
              <div>SEC_LVL: OMNI_APPROVED</div>
            </div>
          </div>

          {/* Target Reticle Crosshair */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center opacity-30">
            <div className="w-16 h-16 border border-v6-accent rounded-full animate-pulse" />
            <div className="absolute w-20 h-px bg-v6-accent" />
            <div className="absolute h-20 w-px bg-v6-accent" />
          </div>

          {/* Bottom Info details */}
          <div className="flex justify-between items-end">
            <div className="space-y-0.5">
              <div>MASS: 480G</div>
              <div>GRID: LOC_A_603</div>
            </div>
            <div className="text-right space-y-0.5">
              <div>ROT_P: {(frameIndex * (360 / FRAME_COUNT)).toFixed(1)}°</div>
              <div>STABILIZATION: 100%</div>
            </div>
          </div>
        </div>
      )}

      {/* 6. High-End Indicators at the bottom */}
      <div className="absolute bottom-4 left-0 w-full flex flex-col items-center gap-1 z-20 pointer-events-none">
        <span className="text-[7px] font-mono tracking-widest opacity-25 uppercase">
          {(frameIndex * (360 / FRAME_COUNT)).toFixed(0)}° // ROT_Y
        </span>
        <div className="flex gap-1.5">
          {Array.from({ length: 12 }).map((_, idx) => (
            <div
              key={idx}
              className={`h-[2px] rounded-full transition-all duration-300 ${
                Math.floor(frameIndex / (FRAME_COUNT/12)) === idx ? "w-6 bg-v6-accent" : "w-1.5 bg-foreground/20"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
