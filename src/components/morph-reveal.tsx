"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import Image from "next/image";

interface MorphRevealProps {
  images: string[];
  isFullPage?: boolean;
}

export const MorphReveal: React.FC<MorphRevealProps> = ({ images, isFullPage = false }) => {
  const [isMounted, setIsMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const image1 = images[0] || "/frames/01.png";
  const image2 = images[1] || image1;
  const image3 = images[2] || image2;
  const image4 = images[3] || image3;

  // Track scroll progress.
  const { scrollYProgress } = useScroll({
    target: isFullPage ? undefined : containerRef,
    offset: ["start start", "end end"],
  });

  // Lenis already smooths the scroll position. Spring here only needs to add
  // a subtle ease-out feel — high stiffness keeps it responsive and stops
  // cleanly within ~0.4s so the animation doesn't drift after scroll ends.
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 400,
    damping: 70,
    restDelta: 0.0001,
  });

  // Image Opacities - Sequential transitions
  const opacity1 = useTransform(smoothProgress, [0, 0.25, 0.3], [1, 1, 0]);
  const opacity2 = useTransform(smoothProgress, [0.25, 0.3, 0.55, 0.6], [0, 1, 1, 0]);
  const opacity3 = useTransform(smoothProgress, [0.55, 0.6, 0.85, 0.9], [0, 1, 1, 0]);
  const opacity4 = useTransform(smoothProgress, [0.85, 0.9, 1], [0, 1, 1]);

  // Box 1 Morph: Rectangular transitions
  const box1 = useTransform(smoothProgress,
    [0, 0.3, 0.6, 0.75, 0.9, 1],
    [
      "polygon(5% 5%, 48% 5%, 48% 48%, 5% 48%)",    // Top Left
      "polygon(5% 5%, 95% 5%, 95% 20%, 5% 20%)",    // Top Strip
      "polygon(10% 10%, 40% 10%, 40% 90%, 10% 90%)", // Left Strip
      "polygon(0% 15%, 100% 15%, 100% 25%, 0% 25%)", // Tech Shatter 1
      "polygon(20% 20%, 80% 20%, 80% 80%, 20% 80%)", // Central Box
      "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)", // Full
    ]
  );

  // Box 2 Morph
  const box2 = useTransform(smoothProgress,
    [0, 0.3, 0.6, 0.75, 0.9, 1],
    [
      "polygon(52% 5%, 95% 5%, 95% 48%, 52% 48%)",   // Top Right
      "polygon(5% 30%, 95% 30%, 95% 45%, 5% 45%)",   // Upper Mid Strip
      "polygon(45% 10%, 55% 10%, 55% 90%, 45% 90%)", // Center Strip
      "polygon(15% 0%, 25% 0%, 25% 100%, 15% 100%)", // Tech Shatter 2
      "polygon(25% 25%, 75% 25%, 75% 75%, 25% 75%)", // Inner Box
      "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)", // Full
    ]
  );

  // Box 3 Morph
  const box3 = useTransform(smoothProgress,
    [0, 0.3, 0.6, 0.75, 0.9, 1],
    [
      "polygon(5% 52%, 48% 52%, 48% 95%, 5% 95%)",   // Bottom Left
      "polygon(5% 55%, 95% 55%, 95% 70%, 5% 70%)",   // Lower Mid Strip
      "polygon(60% 10%, 90% 10%, 90% 90%, 60% 90%)", // Right Strip
      "polygon(0% 75%, 100% 75%, 100% 85%, 0% 85%)", // Tech Shatter 3
      "polygon(30% 30%, 70% 30%, 70% 70%, 30% 70%)", // Smaller Inner Box
      "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)", // Full
    ]
  );

  // Box 4 Morph
  const box4 = useTransform(smoothProgress,
    [0, 0.3, 0.6, 0.75, 0.9, 1],
    [
      "polygon(52% 52%, 95% 52%, 95% 95%, 52% 95%)", // Bottom Right
      "polygon(5% 80%, 95% 80%, 95% 95%, 5% 95%)",   // Bottom Strip
      "polygon(15% 15%, 85% 15%, 85% 85%, 15% 85%)", // Outer Frame
      "polygon(75% 0%, 85% 0%, 85% 100%, 75% 100%)", // Tech Shatter 4
      "polygon(35% 35%, 65% 35%, 65% 65%, 35% 65%)", // Core Box
      "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)", // Full
    ]
  );

  // Additional dynamic effects for the boxes
  const boxScale = useTransform(smoothProgress, [0.6, 0.75, 0.9], [1, 1.05, 1]);
  const boxRotate = useTransform(smoothProgress, [0.6, 0.75, 0.9], [0, 1, 0]);

  const boxes = [box1, box2, box3, box4];

  const content = (
    <div className={`${isFullPage ? "fixed" : "sticky"} top-0 h-screen w-full overflow-hidden flex items-center justify-center`}>
      {isMounted ? (
        <div className={`relative w-full h-full ${isFullPage ? "max-w-none max-h-none p-0" : "max-w-7xl max-h-[85vh] aspect-video px-4"} mx-auto`}>

          {/* Backdrop that fills the space behind the boxes */}
          <div className={`absolute inset-0 bg-background/40 backdrop-blur-sm ${isFullPage ? "" : "rounded-3xl"} -z-10 border border-foreground/5`} />

          {/* Base layer - very faint to guide the eye */}
          <div className="absolute inset-0 opacity-10 grayscale pointer-events-none">
            <motion.div className="absolute inset-0" style={{ opacity: opacity1 }}>
              <Image src={image1} alt="Base 1" fill className="object-cover" priority />
            </motion.div>
            <motion.div className="absolute inset-0" style={{ opacity: opacity2 }}>
              <Image src={image2} alt="Base 2" fill className="object-cover" />
            </motion.div>
            <motion.div className="absolute inset-0" style={{ opacity: opacity3 }}>
              <Image src={image3} alt="Base 3" fill className="object-cover" />
            </motion.div>
            <motion.div className="absolute inset-0" style={{ opacity: opacity4 }}>
              <Image src={image4} alt="Base 4" fill className="object-cover" />
            </motion.div>
          </div>

          {/* The Morphing Windows (Revealers) */}
          {boxes.map((clipPath, index) => (
            <motion.div
              key={index}
              className="absolute inset-0 z-10 will-change-[clip-path,transform]"
              style={{
                clipPath,
                scale: index % 2 === 0 ? boxScale : 1,
                rotate: index % 2 !== 0 ? boxRotate : 0,
              }}
            >
              <div className="relative w-full h-full overflow-hidden rounded-3xl will-change-transform">
                {/* The actual image being revealed */}
                <motion.div className="absolute inset-0 will-change-opacity" style={{ opacity: opacity1 }}>
                  <Image src={image1} alt={`Reveal ${index} Img 1`} fill className="object-contain" priority={index === 0} />
                </motion.div>
                <motion.div className="absolute inset-0 will-change-opacity" style={{ opacity: opacity2 }}>
                  <Image src={image2} alt={`Reveal ${index} Img 2`} fill className="object-contain" />
                </motion.div>
                <motion.div className="absolute inset-0 will-change-opacity" style={{ opacity: opacity3 }}>
                  <Image src={image3} alt={`Reveal ${index} Img 3`} fill className="object-contain" />
                </motion.div>
                <motion.div className="absolute inset-0 will-change-opacity" style={{ opacity: opacity4 }}>
                  <Image src={image4} alt={`Reveal ${index} Img 4`} fill className="object-contain" />
                </motion.div>

                {/* Glass effect and border to define the "box" */}
                <div className="absolute inset-0 border-2 border-foreground/10 shadow-[inset_0_0_40px_rgba(255,255,255,0.05)] pointer-events-none rounded-3xl" />

                {/* Subtle inner glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-foreground/[0.03] to-transparent pointer-events-none" />
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="h-full w-full bg-background" />
      )}
    </div>
  );

  if (isFullPage) return content;

  return (
    <div ref={containerRef} className="relative h-[500vh] w-full bg-background">
      {content}
    </div>
  );
};
