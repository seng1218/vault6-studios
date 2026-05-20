"use client";

import React, { useMemo, useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform, useVelocity, type MotionValue } from "framer-motion";

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
  currentIndex: MotionValue<number>;
  fusionUrls?: string[];
  x?: any;
  y?: any;
  scale?: any;
  frameAdjustments?: FrameAdjustment[];
  scrollYProgress?: MotionValue<number>;
  isHovered?: boolean;
}

interface FrameImageProps {
  url: string;
  index: number;
  currentIndex: MotionValue<number>;
  isScrollActive: MotionValue<number>;
  adj: FrameAdjustment;
  smoothBlur: MotionValue<number>;
  isHovered: boolean;
  time: MotionValue<number>;
  mode?: "primary" | "ghost" | "cyan" | "magenta";
  velocity?: MotionValue<number>;
}

const FrameImage = React.memo(({ 
  url, 
  index, 
  currentIndex, 
  isScrollActive, 
  adj, 
  smoothBlur, 
  isHovered,
  time,
  mode = "primary",
  velocity
}: FrameImageProps) => {
  // Sub-frame interpolation logic
  const opacity = useTransform(currentIndex, (v) => {
    const distance = Math.abs(v - index);
    if (mode === "primary") {
       return distance < 1 ? 1 - distance : 0;
    }
    // Ghost frames have a wider influence
    return distance < 1.5 ? (1.5 - distance) * 0.3 : 0;
  });

  const pointerEvents = useTransform(currentIndex, (v) => Math.abs(v - index) < 0.5 ? "auto" : "none") as any;
  const imageScale = useTransform(currentIndex, (v) => {
     const base = mode === "primary" ? 1 : 1.02;
     const distance = Math.abs(v - index);
     return (adj.scale || 1) * (base - (distance * 0.05));
  });

  const filter = useTransform(smoothBlur, (v) => {
    let baseFilter = `brightness(${isHovered ? 1.2 : 1.1}) contrast(1.1) blur(${v}px)`;
    if (mode === "cyan") return baseFilter + " hue-rotate(180deg) saturate(5)";
    if (mode === "magenta") return baseFilter + " hue-rotate(300deg) saturate(5)";
    return baseFilter + ` drop-shadow(0 0 ${isHovered ? 60 : 40}px var(--v6-glow))`;
  });

  const trailOffset = useTransform(velocity || useMotionValue(0), (v) => {
    if (mode === "primary") return 0;
    const factor = mode === "cyan" ? 0.2 : -0.2;
    return v * factor;
  });

  const glitchOpacity = useTransform([currentIndex, isScrollActive], ([v, active]) => 
    mode === "primary" && Math.abs((v as number) - index) < 0.5 && (active as number) === 0 ? 0.12 : 0
  );
  
  return (
    <React.Fragment>
      <motion.img
        src={url}
        style={{
          opacity,
          scale: imageScale,
          pointerEvents,
          x: useTransform(trailOffset, (to) => (adj.x || 0) + to),
          y: adj.y || 0,
          filter,
          zIndex: mode === "primary" ? 10 : 5,
          mixBlendMode: mode === "primary" ? "normal" : "screen"
        }}
        className="absolute max-w-[85%] max-h-[85%] object-contain will-change-[opacity,transform,filter]"
      />

      {mode === "primary" && (
        <motion.img
          src={url}
          style={{
            opacity: glitchOpacity,
            scale: (adj.scale || 1) * 1.03,
            x: useTransform(time, (t) => (adj.x || 0) + (Math.sin(t / 100) * 5)),
            pointerEvents: "none",
            zIndex: 5,
          }}
          className="absolute max-w-[85%] max-h-[85%] object-contain mix-blend-screen blue-glitch"
        />
      )}
    </React.Fragment>
  );
});
FrameImage.displayName = "FrameImage";

export function ImageSequenceViewer({
  imageUrls,
  currentIndex,
  fusionUrls = [],
  x = 0,
  y = 0,
  scale = 1,
  frameAdjustments = [],
  scrollYProgress,
  isHovered = false
}: ImageSequenceProps) {
  const [activeFrame, setActiveFrame] = useState(0);
  const [hudVelocity, setHudVelocity] = useState(0);

  const time = useMotionValue(0);
  useEffect(() => {
    let raf: number;
    const update = (t: number) => {
      time.set(t);
      raf = requestAnimationFrame(update);
    };
    raf = requestAnimationFrame(update);
    return () => cancelAnimationFrame(raf);
  }, [time]);

  const velocity = useVelocity(currentIndex);
  const blurValue = useTransform(velocity, [-80, 0, 80], [10, 0, 10]);
  const smoothBlur = useSpring(blurValue, { damping: 25, stiffness: 150 });

  useEffect(() => {
    const unsub = currentIndex.on("change", (v) => {
      setActiveFrame(Math.floor(v));
    });
    const unsubVel = velocity.on("change", (v) => setHudVelocity(v));
    return () => {
      unsub();
      unsubVel();
    };
  }, [currentIndex, velocity]);

  const isScrollActive = useTransform(velocity, (v) => Math.abs(v) > 0.1 ? 1 : 0);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { damping: 30, stiffness: 180 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [10, -10]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-15, 15]), springConfig);
  const perspectiveScale = useSpring(useTransform(mouseY, [-0.5, 0.5], [1.02, 0.98]), springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX / window.innerWidth - 0.5);
      mouseY.set(e.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  const bgParallax = useTransform(scrollYProgress || useMotionValue(0), [0, 1], ["0%", "15%"]);
  const bgParallaxReverse = useTransform(scrollYProgress || useMotionValue(0), [0, 1], ["0%", "-15%"]);

  // Sliding Window: Draw enough frames for smooth cross-fading
  const visibleIndices = useMemo(() => {
    const indices = new Set<number>();
    const base = Math.floor(activeFrame);
    for (let i = base - 1; i <= base + 1; i++) {
       if (i >= 0 && i < imageUrls.length) indices.add(i);
    }
    return Array.from(indices);
  }, [activeFrame, imageUrls.length]);

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden pointer-events-none bg-background transition-colors duration-500">
      
      {/* Background Parallax Grid */}
      <motion.div 
        style={{ y: bgParallax }}
        className="absolute inset-0 flex flex-col items-center justify-center z-0 opacity-[0.06] dark:opacity-[0.03] select-none"
      >
          <h1 className="text-[25vw] font-black leading-[0.7] uppercase text-foreground tracking-tighter">VAULT</h1>
          <motion.h1 
            style={{ x: bgParallaxReverse }}
            className="text-[30vw] font-black leading-[0.7] uppercase text-outline"
          >
            ARCHIVE
          </motion.h1>
      </motion.div>

      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,var(--v6-glow),transparent_70%)]" />
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-[linear-gradient(to_top,var(--background),transparent)]" />
      </div>

      <div className="absolute inset-0 z-5 flex items-center justify-center">
        {fusionUrls.map((url, i) => (
          <FloatingAsset key={`${url}-${i}`} url={url} index={i} />
        ))}
      </div>

      {/* HUD Overlays */}
      <div className="absolute inset-0 z-20 flex flex-col justify-between p-12 opacity-30 font-mono text-[10px] tracking-[0.2em] uppercase">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <div className="flex items-center gap-4">
              <span className="w-2 h-2 bg-v6-accent animate-pulse" />
              <span>System: Operational</span>
            </div>
            <div>Vault_ID: #6-STUDIOS</div>
            <div>Artifact_Status: Multi-Stage Verified</div>
          </div>
          <div className="text-right">
            <div>F_INDEX: {currentIndex.get().toFixed(2)}</div>
            <div>ROT_V: {(hudVelocity / 10).toFixed(2)} deg/s</div>
          </div>
        </div>
        <div className="flex justify-between items-end">
          <div>
            <div>Latitude: 35.6895° N</div>
            <div>Longitude: 139.6917° E</div>
          </div>
          <div className="flex gap-8">
            <div className="flex flex-col items-end">
              <span>Integrity</span>
              <div className="w-24 h-1 bg-foreground/10 mt-1 overflow-hidden">
                <motion.div 
                  animate={{ width: ["98%", "95%", "99%", "97%"] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="h-full bg-v6-accent" 
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Artifact Stage */}
      <motion.div 
        style={{ 
          x, 
          y, 
          scale: useTransform([scale, perspectiveScale], ([s, ps]) => (s as number) * (ps as number)), 
          rotateX, 
          rotateY, 
          perspective: 1500 
        }}
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
        <motion.div 
          animate={{ 
            opacity: isHovered ? [0.4, 0.6, 0.4] : [0.1, 0.25, 0.1],
            scale: isHovered ? [1, 1.2, 1] : [1, 1.1, 1]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[20%] w-[40%] h-[5%] bg-[var(--v6-accent)] blur-[50px] rounded-full z-0" 
        />
        
        {visibleIndices.map((index) => (
          <React.Fragment key={imageUrls[index]}>
            {/* Chromatic Trails (Cyan/Magenta) */}
            <FrameImage 
              url={imageUrls[index]}
              index={index}
              currentIndex={currentIndex}
              isScrollActive={isScrollActive}
              adj={frameAdjustments[index] || { scale: 1, x: 0, y: 0 }}
              smoothBlur={smoothBlur}
              isHovered={isHovered}
              time={time}
              mode="cyan"
              velocity={velocity}
            />
            <FrameImage 
              url={imageUrls[index]}
              index={index}
              currentIndex={currentIndex}
              isScrollActive={isScrollActive}
              adj={frameAdjustments[index] || { scale: 1, x: 0, y: 0 }}
              smoothBlur={smoothBlur}
              isHovered={isHovered}
              time={time}
              mode="magenta"
              velocity={velocity}
            />
            {/* Fluid Ghost Blending */}
            <FrameImage 
              url={imageUrls[index]}
              index={index}
              currentIndex={currentIndex}
              isScrollActive={isScrollActive}
              adj={frameAdjustments[index] || { scale: 1, x: 0, y: 0 }}
              smoothBlur={smoothBlur}
              isHovered={isHovered}
              time={time}
              mode="ghost"
            />
            {/* Primary Frame */}
            <FrameImage 
              url={imageUrls[index]}
              index={index}
              currentIndex={currentIndex}
              isScrollActive={isScrollActive}
              adj={frameAdjustments[index] || { scale: 1, x: 0, y: 0 }}
              smoothBlur={smoothBlur}
              isHovered={isHovered}
              time={time}
              mode="primary"
            />
          </React.Fragment>
        ))}

        {/* Scanner Sweep */}
        <motion.div 
          animate={{ 
            top: ["-20%", "120%"],
            opacity: [0, 1, 1, 0],
            height: ["1px", "2px", "1px"]
          }}
          transition={{ 
            duration: 5, 
            repeat: Infinity, 
            ease: "linear",
            repeatDelay: 3
          }}
          className="absolute left-[-20%] right-[-20%] bg-gradient-to-r from-transparent via-[var(--v6-accent)] to-transparent z-20 shadow-[0_0_20px_var(--v6-glow)] opacity-50"
        />
      </motion.div>

      {/* Preload hidden */}
      <div className="hidden">
        {imageUrls.map((url) => (
          <img key={`preload-${url}`} src={url} alt="" />
        ))}
      </div>
    </div>
  );
}
