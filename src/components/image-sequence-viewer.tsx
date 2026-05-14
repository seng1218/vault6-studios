"use client";

import React, { useMemo } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

interface FloatingAssetProps {
  url: string;
  index: number;
}

function FloatingAsset({ url, index }: FloatingAssetProps) {
  const [isMounted, setIsMounted] = React.useState(false);
  
  const randoms = React.useMemo(() => {
    if (typeof window === "undefined") return null;
    return {
      delay: Math.random() * 5,
      duration: 15 + Math.random() * 20,
      initialX: (Math.random() - 0.5) * 60,
      initialY: (Math.random() - 0.5) * 40,
    };
  }, [isMounted]);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || !randoms) return null;

  return (
    <motion.img
      src={url}
      initial={{ opacity: 0, scale: 0.5, x: `${randoms.initialX}%`, y: `${randoms.initialY}%` }}
      animate={{ 
        opacity: [0.03, 0.08, 0.03],
        x: [`${randoms.initialX}%`, `${randoms.initialX + 8}%`, `${randoms.initialX - 5}%`, `${randoms.initialX}%`],
        y: [`${randoms.initialY}%`, `${randoms.initialY - 15}%`, `${randoms.initialY + 10}%`, `${randoms.initialY}%`],
        rotate: [0, 10, -10, 0]
      }}
      transition={{ 
        duration: randoms.duration,
        repeat: Infinity,
        delay: randoms.delay,
        ease: "easeInOut"
      }}
      className="absolute w-[15vw] h-auto object-contain blur-[4px] pointer-events-none select-none grayscale contrast-125 mix-blend-screen opacity-10"
    />
  );
}

export interface FrameAdjustment {
  scale?: number;
  x?: number;
  y?: number;
}

interface ImageSequenceProps {
  imageUrls: string[];
  currentIndex: number;
  fusionUrls?: string[];
  x?: any;
  y?: any;
  scale?: any;
  frameAdjustments?: FrameAdjustment[];
}

export function ImageSequenceViewer({ 
  imageUrls, 
  currentIndex,
  fusionUrls = [],
  x = 0,
  y = 0,
  scale = 1,
  frameAdjustments = []
}: ImageSequenceProps) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 150 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-12, 12]), springConfig);

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX / window.innerWidth - 0.5);
      mouseY.set(e.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  const visibleIndices = React.useMemo(() => {
    const prev = (currentIndex - 1 + imageUrls.length) % imageUrls.length;
    const next = (currentIndex + 1) % imageUrls.length;
    return [prev, currentIndex, next];
  }, [currentIndex, imageUrls.length]);

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden pointer-events-none bg-background transition-colors duration-500">
      
      {/* 1. Background Grid & Artifact Text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-0 opacity-[0.06] dark:opacity-[0.03] select-none">
          <h1 className="text-[25vw] font-black leading-[0.7] uppercase text-foreground tracking-tighter">VAULT</h1>
          <h1 className="text-[30vw] font-black leading-[0.7] uppercase text-outline">ARCHIVE</h1>
      </div>

      {/* 2. Industrial Environment */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,var(--v6-glow),transparent_70%)]" />
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-[linear-gradient(to_top,var(--background),transparent)]" />
      </div>

      {/* 3. Fusion Layer */}
      <div className="absolute inset-0 z-5 flex items-center justify-center">
        {fusionUrls.map((url, i) => (
          <FloatingAsset key={`${url}-${i}`} url={url} index={i} />
        ))}
      </div>

      {/* 4. Main Artifact Stage */}
      <motion.div 
        style={{ x, y, scale, rotateX, rotateY, perspective: 1500 }}
        animate={{ 
          y: [0, -15, 8, 0],
        }}
        transition={{ 
          duration: 10, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
        className="relative w-full h-full flex items-center justify-center z-10 transform-gpu"
      >
        {/* Underlight / Shadow */}
        <div className="absolute bottom-[20%] w-[40%] h-[5%] bg-[var(--v6-accent)] opacity-10 dark:opacity-20 blur-[50px] rounded-full z-0" />
        
        {imageUrls.map((url, index) => {
          if (!visibleIndices.includes(index)) return null;
          const isActive = index === currentIndex;
          const adj = frameAdjustments[index] || { scale: 1, x: 0, y: 0 };
          
          return (
            <React.Fragment key={url}>
              <motion.img
                src={url}
                initial={false}
                animate={{ 
                  opacity: isActive ? 1 : 0,
                  scale: isActive ? (adj.scale || 1) : 0.98,
                  x: isActive ? (adj.x || 0) : 0,
                  y: isActive ? (adj.y || 0) : 0,
                  filter: isActive 
                    ? "brightness(1.1) contrast(1.1) drop-shadow(0 0 40px var(--v6-glow))" 
                    : "brightness(0.5) blur(20px)"
                }}
                transition={{ duration: 0.75, ease: "circOut" }}
                className="absolute max-w-[85%] max-h-[85%] object-contain z-10 will-change-transform"
              />
              
              {/* Artifact Ghosting / Glitch Effect */}
              {isActive && (
                <motion.img
                  key={`glitch-${url}`}
                  src={url}
                  initial={{ opacity: 0 }}
                  animate={{ 
                    opacity: [0, 0.25, 0],
                    x: [(adj.x || 0), (adj.x || 0) - 10, (adj.x || 0) + 10, (adj.x || 0)],
                    scale: (adj.scale || 1) * 1.03,
                  }}
                  transition={{ 
                    duration: 0.2, 
                  }}
                  className="absolute max-w-[85%] max-h-[85%] object-contain z-5 pointer-events-none mix-blend-screen blue-glitch"
                />
              )}
            </React.Fragment>
          );
        })}

        {/* Scanner Sweep */}
        <motion.div 
          animate={{ 
            top: ["-20%", "120%"],
            opacity: [0, 1, 1, 0]
          }}
          transition={{ 
            duration: 5, 
            repeat: Infinity, 
            ease: "linear",
            repeatDelay: 3
          }}
          className="absolute left-[-20%] right-[-20%] h-[1px] bg-gradient-to-r from-transparent via-[var(--v6-accent)] to-transparent z-20 shadow-[0_0_20px_var(--v6-glow)] opacity-50"
        />
      </motion.div>

      {/* Preload all assets */}
      <div className="hidden">
        {imageUrls.map((url) => (
          <img key={`preload-${url}`} src={url} alt="" />
        ))}
      </div>
    </div>
  );
}
