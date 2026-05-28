"use client";

import { useState, useEffect, useRef } from "react";
import { motion, type MotionValue, useTransform } from "framer-motion";

const BG_IMAGES = [
  "/frames/motions rem/07.jpg",
  "/frames/motions rem/19.jpg",
  "/frames/motions rem/34.jpg",
  "/frames/motions rem/48.jpg",
];

// [xFrac, yFrac, widthFrac, heightFrac]
// 6 large impact boxes, 5 phases each.
const BOX_PHASES: [number, number, number, number][][] = [
  // Box 1: Left Vertical Shutter
  [[0.05, 0.05, 0.20, 0.90], [0.02, 0.02, 0.45, 0.15], [0.05, 0.05, 0.30, 0.60], [0.02, 0.10, 0.10, 0.80], [0.10, 0.10, 0.30, 0.30]],
  // Box 2: Right Vertical Shutter
  [[0.75, 0.05, 0.20, 0.90], [0.52, 0.02, 0.45, 0.15], [0.65, 0.05, 0.30, 0.60], [0.88, 0.10, 0.10, 0.80], [0.60, 0.10, 0.30, 0.30]],
  // Box 3: Top Horizontal Banner
  [[0.25, 0.05, 0.50, 0.15], [0.02, 0.20, 0.45, 0.15], [0.05, 0.70, 0.90, 0.25], [0.15, 0.02, 0.70, 0.10], [0.10, 0.60, 0.30, 0.30]],
  // Box 4: Bottom Horizontal Banner
  [[0.25, 0.80, 0.50, 0.15], [0.52, 0.20, 0.45, 0.15], [0.35, 0.35, 0.30, 0.30], [0.15, 0.88, 0.70, 0.10], [0.60, 0.60, 0.30, 0.30]],
  // Box 5: Center Feature A
  [[0.30, 0.25, 0.40, 0.50], [0.02, 0.40, 0.96, 0.20], [0.10, 0.10, 0.80, 0.10], [0.25, 0.15, 0.15, 0.70], [0.35, 0.35, 0.30, 0.30]],
  // Box 6: Center Feature B
  [[0.10, 0.40, 0.80, 0.20], [0.02, 0.65, 0.96, 0.30], [0.10, 0.80, 0.80, 0.10], [0.60, 0.15, 0.15, 0.70], [0.05, 0.05, 0.90, 0.90]],
];

const BOX_COUNT = BOX_PHASES.length;

interface BoxAttrs {
  x: number;
  y: number;
  width: number;
  height: number;
  rx: number;
}

function progressToAttrs(p: number, vw: number, vh: number): BoxAttrs[] {
  const phaseCount = BOX_PHASES[0].length; 
  const segmentCount = phaseCount - 1;
  
  const scaledP = p * segmentCount;
  const segmentIdx = Math.max(0, Math.min(segmentCount - 1, Math.floor(scaledP)));
  const localP = scaledP - segmentIdx;
  
  return BOX_PHASES.map(boxPhases => {
    const p1 = boxPhases[segmentIdx];
    const p2 = boxPhases[segmentIdx + 1];
    
    const x = (p1[0] + (p2[0] - p1[0]) * localP) * vw;
    const y = (p1[1] + (p2[1] - p1[1]) * localP) * vh;
    const w = (p1[2] + (p2[2] - p1[2]) * localP) * vw;
    const h = (p1[3] + (p2[3] - p1[3]) * localP) * vh;
    
    return { x, y, width: w, height: h, rx: 0 };
  });
}

function applyAttrs(el: SVGRectElement, attrs: BoxAttrs) {
  el.setAttribute("x", attrs.x.toFixed(2));
  el.setAttribute("y", attrs.y.toFixed(2));
  el.setAttribute("width", attrs.width.toFixed(2));
  el.setAttribute("height", attrs.height.toFixed(2));
  el.setAttribute("rx", attrs.rx.toFixed(2));
  el.setAttribute("ry", attrs.rx.toFixed(2));
}

export function HeroRevealScene({ progress }: { progress: MotionValue<number> }) {
  const [activeBg, setActiveBg] = useState(0);
  const [sceneOpacity, setSceneOpacity] = useState(1);

  const rectRefs = useRef<(SVGRectElement | null)[]>([]);
  const curRef = useRef<BoxAttrs[]>([]);
  const tgtRef = useRef<BoxAttrs[]>([]);
  const rafRef = useRef<number>(0);
  const vpRef = useRef({ w: 1440, h: 900 });
  const initializedRef = useRef(false);
  const activeBgRef = useRef(0);

  useEffect(() => {
    return progress.on("change", (p) => {
      const { w, h } = vpRef.current;
      tgtRef.current = progressToAttrs(p, w, h);

      const phase = p < 0.2 ? 0 : p < 0.4 ? 1 : p < 0.6 ? 2 : p < 0.8 ? 3 : 4;
      const bgIdx = phase % BG_IMAGES.length;
      if (bgIdx !== activeBgRef.current) {
        activeBgRef.current = bgIdx;
        setActiveBg(bgIdx);
      }

      const opacity = p > 0.92 ? Math.max(0, 1 - (p - 0.92) / 0.08) : 1;
      setSceneOpacity(opacity);
    });
  }, [progress]);

  useEffect(() => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    vpRef.current = { w: vw, h: vh };

    const initial = progressToAttrs(progress.get(), vw, vh);
    curRef.current = initial.map(a => ({ ...a }));
    tgtRef.current = initial.map(a => ({ ...a }));

    rectRefs.current = Array(BOX_COUNT).fill(null);
    initializedRef.current = true;

    const onResize = () => {
      const nw = window.innerWidth;
      const nh = window.innerHeight;
      vpRef.current = { w: nw, h: nh };
      const currentP = progress.get();
      const snapped = progressToAttrs(currentP, nw, nh);
      tgtRef.current = snapped.map(a => ({ ...a }));
      curRef.current = snapped.map(a => ({ ...a }));
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [progress]);

  useEffect(() => {
    const HALF_LIFE = 100;
    let lastTime = performance.now();

    const tick = (now: number) => {
      if (!initializedRef.current) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      const dt = Math.min(now - lastTime, 64);
      lastTime = now;
      const decay = Math.pow(0.5, dt / HALF_LIFE);

      curRef.current = curRef.current.map((cur, i) => {
        const tgt = tgtRef.current[i];
        if (!tgt) return cur;
        return {
          x:      tgt.x      + (cur.x      - tgt.x)      * decay,
          y:      tgt.y      + (cur.y      - tgt.y)      * decay,
          width:  tgt.width  + (cur.width  - tgt.width)  * decay,
          height: tgt.height + (cur.height - tgt.height) * decay,
          rx:     tgt.rx     + (cur.rx     - tgt.rx)     * decay,
        };
      });

      curRef.current.forEach((attrs, i) => {
        const el = rectRefs.current[i];
        if (el) applyAttrs(el, attrs);
      });

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const ssrAttrs = progressToAttrs(0, 1440, 900);

  return (
    <div
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ opacity: sceneOpacity, transition: "opacity 0.6s ease" }}
    >
      <div className="absolute inset-0 bg-background" />

      <svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <clipPath id="v6-reveal-clip">
            {ssrAttrs.map((attrs, i) => (
              <rect
                key={i}
                ref={el => { rectRefs.current[i] = el; }}
                x={attrs.x}
                y={attrs.y}
                width={attrs.width}
                height={attrs.height}
                rx={attrs.rx}
                ry={attrs.rx}
              />
            ))}
          </clipPath>
        </defs>

        {/* 
          Smooth Cross-fade Layers 
          We use 4 transition points (0.25, 0.5, 0.75) to cross-fade 4 images
        */}
        {BG_IMAGES.map((src, i) => {
          const start = i * 0.25;
          const end = (i + 1) * 0.25;
          
          // Map progress to a continuous opacity value for this image
          // Image 0: 1 at progress 0, fades to 0 at 0.25
          // Image 1: 0 at 0, 1 at 0.25, 0 at 0.5
          // ... and so on
          const opacity = useTransform(
            progress,
            [start - 0.1, start, end - 0.1, end],
            [0, 1, 1, 0]
          );

          return (
            <motion.image
              key={src}
              href={src}
              x="0"
              y="0"
              width="100%"
              height="100%"
              preserveAspectRatio="xMidYMid meet"
              clipPath="url(#v6-reveal-clip)"
              style={{ opacity }}
            />
          );
        })}

        {/* Architectural Edge Highlights */}
        {/* We re-render the boxes as outlines to give them "intuitive" presence */}
        {ssrAttrs.map((_, i) => (
          <rect
            key={`highlight-${i}`}
            // Using the same ref strategy wouldn't work easily here, 
            // but the clipPath rects are already updating. 
            // For true high-end feel, we could use framer-motion here too, 
            // but let's keep it performant.
            // Actually, let's just use one stroke on the whole clip group.
            fill="none"
          />
        ))}

        <rect
          x="0" y="0" width="100%" height="100%"
          fill="none"
          clipPath="url(#v6-reveal-clip)"
          className="stroke-foreground/15"
          strokeWidth="1"
        />
      </svg>
    </div>
  );
}
