"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/components/cart-provider";
import { fetchArtifacts } from "@/app/actions/artifact-actions";
import { playHoverSound, playClickSound, playSuccessSound } from "@/lib/sound-effects";
import {
  ShoppingBag,
  ArrowLeft,
  ArrowRight,
  Settings2,
  Sparkles,
  Cpu,
  CheckCircle2
} from "lucide-react";

interface Figurine {
  id: string;
  deploymentId: string;
  name: string;
  category: string;
  price: string;
  status: string;
  scale: string;
  material: string;
  series: string;
  highlights?: string;
  imageUrls?: string;
  condition?: string;
  manufacturer?: string;
  inventory?: number;
}

export function FigurineShowcase() {
  const { addToCart } = useCart();
  const [items, setItems] = useState<Figurine[]>([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [activeAngle, setActiveAngle] = useState(0);
  const [isHudActive, setIsHudActive] = useState(true);
  const [loading, setLoading] = useState(true);
  const [zoomStyle, setZoomStyle] = useState<React.CSSProperties>({});
  const [isHovered, setIsHovered] = useState(false);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadItems = async () => {
      setLoading(true);
      const res = await fetchArtifacts();
      if (res.success && res.data && res.data.length > 0) {
        const dbItems = res.data.map((item: any) => ({
          id: item.id,
          deploymentId: item.deploymentId || `V6-${item.name.toUpperCase().substring(0,3)}`,
          name: item.name,
          category: item.category || "COLLECTIBLE",
          price: item.price,
          status: item.status || "AVAILABLE",
          scale: item.scale || "1/6",
          material: item.material || "RESIN",
          series: item.series || "ORIGINS",
          highlights: item.highlights || "",
          imageUrls: item.imageUrls || "",
          condition: item.condition || "MISB",
          manufacturer: item.manufacturer || "Unknown",
          inventory: item.inventory || 1
        }));
        setItems(dbItems.slice(0, 4));
      } else {
        setItems([
          { id: "V6-001", deploymentId: "V6-001", name: "Krypton Legacy", category: "HEAD SCULPT", price: "$35", status: "AVAILABLE", scale: "1/6", material: "RESIN", series: "ORIGINS" },
          { id: "V6-002", deploymentId: "V6-002", name: "Detective Samurai", category: "HEAD SCULPT", price: "$38", status: "LIMITED", scale: "1/6", material: "PRO-POLY", series: "NEO-NOIR" },
          { id: "V6-003", deploymentId: "V6-003", name: "Jeet Kune Do Master", category: "FULL CUSTOM", price: "$180", status: "SOLD OUT", scale: "1/12", material: "MIXED", series: "LEGENDS" },
          { id: "V6-004", deploymentId: "V6-004", name: "Cyber Ronin", category: "FULL CUSTOM", price: "$210", status: "PRE-ORDER", scale: "1/6", material: "VINYL", series: "NEO-NOIR" }
        ]);
      }
      setLoading(false);
    };
    loadItems();
  }, []);

  const activeItem = items[selectedIdx];

  const images = useMemo(() => {
    if (!activeItem) return [];

    if (activeItem.imageUrls && activeItem.imageUrls.trim() !== "") {
      const customUrls = activeItem.imageUrls.split("\n").map(u => u.trim()).filter(Boolean);
      const paddedUrls = [];
      for (let i = 0; i < 4; i++) paddedUrls.push(customUrls[i % customUrls.length]);
      return paddedUrls;
    }

    const name = activeItem.name.toLowerCase();
    const category = activeItem.category.toLowerCase();
    let startIndex = 1;
    if (name.includes("krypton")) startIndex = 1;
    else if (name.includes("samurai") || name.includes("detective")) startIndex = 9;
    else if (name.includes("jeet") || name.includes("master")) startIndex = 17;
    else if (name.includes("ronin") || name.includes("cyber")) startIndex = 25;
    else if (name.includes("pilot") || name.includes("tokyo")) startIndex = 33;
    else if (category.includes("vehicle") || category.includes("car") || name.includes("car")) startIndex = 41;
    else startIndex = 5;

    const frames = [];
    for (let i = 0; i < 4; i++) {
      const frameNum = startIndex + (i * 3);
      const normalizedNum = ((frameNum - 1) % 53) + 1;
      frames.push(`/frames/motions rem/${normalizedNum.toString().padStart(2, '0')}.jpg`);
    }
    return frames;
  }, [activeItem]);

  const productDetails = useMemo(() => {
    if (!activeItem) return { edition: "Standard Edition", features: [] };
    const isHeadSculpt = activeItem.category.toUpperCase().includes("HEAD") || activeItem.category.toUpperCase().includes("SCULPT");
    let featuresList: string[] = [];
    if (activeItem.highlights && activeItem.highlights.trim() !== "") {
      featuresList = activeItem.highlights.split("\n").map((f: string) => f.trim()).filter(Boolean);
    }
    if (isHeadSculpt) {
      return {
        edition: "Limited Release (150 Units)",
        features: featuresList.length > 0 ? featuresList : [
          "Hyper-detailed hand painted facial and hair textures",
          "Universally compatible with standard 1/6 action body frames",
          "Pre-fitted modular neck connector socket",
          "Shipped in custom secure foam lined layout case"
        ]
      };
    }
    return {
      edition: "Limited Studio Run (50 Units)",
      features: featuresList.length > 0 ? featuresList : [
        "Ultra-flexibility chassis with 30+ joint movement parameters",
        "Real fabric clothing tailored precisely to size",
        "Individually weathered scuff-detailed shoulder pads & armor",
        "Integrated base plate support stand"
      ]
    };
  }, [activeItem]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return;
    const rect = imageContainerRef.current.getBoundingClientRect();
    setZoomStyle({ transformOrigin: `${((e.clientX - rect.left) / rect.width) * 100}% ${((e.clientY - rect.top) / rect.height) * 100}%` });
  };

  const handleMouseLeave = () => { setIsHovered(false); setZoomStyle({ transformOrigin: "center center" }); };
  const rotateLeft = () => { playClickSound(); setActiveAngle((p) => (p === 0 ? 3 : p - 1)); };
  const rotateRight = () => { playClickSound(); setActiveAngle((p) => (p === 3 ? 0 : p + 1)); };
  const selectFigurine = (idx: number) => { if (idx === selectedIdx) return; playClickSound(); setSelectedIdx(idx); setActiveAngle(0); };
  const handleAcquire = () => {
    if (activeItem && activeItem.status !== "SOLD OUT") {
      playSuccessSound();
      addToCart({ id: activeItem.id, deploymentId: activeItem.deploymentId, name: activeItem.name, price: activeItem.price });
    }
  };

  if (loading || !activeItem) {
    return (
      <div className="w-full h-[280px] md:h-[650px] bg-foreground/[0.01] border border-foreground/5 rounded-[2rem] flex flex-col items-center justify-center font-mono gap-4">
        <Cpu className="animate-spin text-v6-accent" size={32} />
        <span className="text-xs uppercase tracking-[0.4em] opacity-40">Loading Figurine Inventory...</span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-auto bg-foreground/[0.01] dark:bg-black/40 border border-foreground/5 dark:border-white/5 rounded-[2rem] md:rounded-[3rem] p-3 md:p-10 flex flex-col lg:flex-row gap-3 md:gap-6 lg:gap-10 group overflow-hidden">
      {/* Decorative neon backdrops */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-v6-accent/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-pink-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* ─── LEFT: Image Stage ─── */}
      <div className="flex-1 flex flex-col justify-between items-center relative min-h-[240px] md:min-h-[380px] lg:min-h-[500px] bg-foreground/5 dark:bg-black/20 rounded-[1.25rem] md:rounded-[2.5rem] p-3 md:p-6 border border-foreground/5 overflow-hidden">

        {isHudActive && (
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(59,130,246,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(59,130,246,0.04)_1px,transparent_1px)] bg-[size:20px_20px] z-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 md:w-64 md:h-64 border border-dashed border-v6-accent/10 rounded-full animate-spin-slow pointer-events-none" style={{ animationDuration: "25s" }} />
            <div className="absolute top-0 inset-x-0 h-px bg-v6-accent/15 shadow-[0_0_15px_var(--v6-glow)] animate-scan pointer-events-none" />
          </div>
        )}

        {/* Telemetry — abbreviated on mobile */}
        <div className="w-full flex justify-between items-start z-10 font-mono text-[7px] md:text-[9px] tracking-widest text-foreground/40 pointer-events-none select-none">
          <div>
            <div>CORE: {activeItem.deploymentId}</div>
            <div className="hidden md:block">RENDER: ORTHOGRAPHIC_CAM</div>
            <div className="hidden md:block">SERIES: {activeItem.series}</div>
          </div>
          <div className="text-right hidden md:block">
            <div>STAGE: OPTIMIZED_STAGE_01</div>
            <div>STATUS: SECURED_STATION</div>
          </div>
        </div>

        {/* Figurine Image */}
        <div
          ref={imageContainerRef}
          onMouseEnter={() => setIsHovered(true)}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="relative w-full flex-1 flex items-center justify-center cursor-zoom-in my-1 overflow-hidden max-h-[200px] md:max-h-[300px] lg:max-h-[360px]"
        >
          <AnimatePresence mode="wait">
            <motion.img
              key={`${activeItem.id}-${activeAngle}`}
              src={images[activeAngle]}
              alt={activeItem.name}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.2 }}
              style={{
                transform: isHovered ? "scale(1.2)" : "scale(1)",
                transition: "transform 0.2s cubic-bezier(0.25, 1, 0.5, 1)",
                ...zoomStyle,
              }}
              className="max-w-[85%] max-h-[100%] object-contain mix-blend-lighten pointer-events-none select-none"
            />
          </AnimatePresence>

          {isHudActive && (
            <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
              <div className="w-32 h-32 md:w-48 md:h-48 border border-v6-accent rounded-full animate-pulse" />
              <div className="absolute w-40 md:w-56 h-px bg-v6-accent" />
              <div className="absolute h-40 md:h-56 w-px bg-v6-accent" />
            </div>
          )}

          {/* Swipe drag zone — mobile only */}
          <motion.div
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.1}
            onDragEnd={(_, info) => {
              if (info.offset.x < -60) rotateRight();
              else if (info.offset.x > 60) rotateLeft();
            }}
            className="absolute inset-0 z-20 md:hidden"
            style={{ touchAction: "pan-y" }}
          />
          <div className="absolute bottom-0 left-0 right-0 flex justify-center md:hidden pointer-events-none">
            <span className="text-[7px] font-black opacity-20 uppercase tracking-widest">← swipe →</span>
          </div>
        </div>

        {/* Controls */}
        <div className="w-full flex justify-between items-center z-10">
          <div className="flex gap-1.5">
            <button onClick={rotateLeft} onMouseEnter={playHoverSound} className="p-2.5 md:p-3 rounded-xl bg-foreground/5 hover:bg-v6-accent/10 border border-foreground/10 hover:border-v6-accent/30 text-foreground transition-all active:scale-95">
              <ArrowLeft size={12} />
            </button>
            <button onClick={rotateRight} onMouseEnter={playHoverSound} className="p-2.5 md:p-3 rounded-xl bg-foreground/5 hover:bg-v6-accent/10 border border-foreground/10 hover:border-v6-accent/30 text-foreground transition-all active:scale-95">
              <ArrowRight size={12} />
            </button>
          </div>

          <div className="text-center font-mono text-[8px] text-foreground/50 tracking-widest hidden md:block">
            ANGLE: {activeAngle * 90}° // ROT_AXIS_Y
          </div>

          <button
            onClick={() => { playClickSound(); setIsHudActive(!isHudActive); }}
            onMouseEnter={playHoverSound}
            className={`px-2.5 py-1 md:px-3 md:py-1.5 rounded-lg border text-[7px] md:text-[8px] font-black uppercase tracking-widest transition-all ${
              isHudActive
                ? "bg-v6-accent text-white border-v6-accent shadow-[0_0_10px_var(--v6-glow)]"
                : "bg-foreground/5 border-foreground/10 text-foreground/40"
            }`}
          >
            HUD {isHudActive ? "ON" : "OFF"}
          </button>
        </div>

        <div className="flex gap-2 mt-2 md:mt-4 z-10 pointer-events-none">
          {[0, 1, 2, 3].map((angle) => (
            <div key={angle} className={`h-1 md:h-1.5 rounded-full transition-all duration-300 ${activeAngle === angle ? "w-5 md:w-6 bg-v6-accent" : "w-1 md:w-1.5 bg-foreground/20"}`} />
          ))}
        </div>
      </div>

      {/* ─── RIGHT: Info Panel ─── */}
      <div className="w-full lg:w-[420px] flex flex-col space-y-3 lg:space-y-6 z-10">

        {/* 1. Identity */}
        <div className="space-y-1.5 md:space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[9px] md:text-[10px] font-black v6-accent-text tracking-[0.4em] uppercase">
              {activeItem.series} SERIES
            </span>
            <span className="text-[8px] font-mono text-foreground/40 px-2 py-0.5 border border-foreground/10 rounded-md">
              {activeItem.deploymentId}
            </span>
          </div>
          <h3 className="text-xl md:text-4xl font-black italic uppercase tracking-tighter leading-none text-foreground">
            {activeItem.name}
          </h3>
          {/* hide description on portrait mobile — redundant with specs */}
          <p className="hidden md:block opacity-50 text-[10px] uppercase font-bold tracking-widest leading-relaxed">
            Exclusive hand-crafted {activeItem.category.toLowerCase()} collectible. Engineered from premium {activeItem.material.toLowerCase()} and optimized for studio showcases.
          </p>
        </div>

        {/* 2. Purchase — row on mobile, push to bottom on desktop */}
        <div className="flex flex-row items-center gap-3 pt-3 border-t border-foreground/5 md:order-last">
          <div className="shrink-0">
            <span className="text-[7px] md:text-[8px] font-black opacity-30 tracking-[0.2em] uppercase block">COST</span>
            <span className="text-xl md:text-3xl font-black italic text-foreground tracking-tighter leading-none">
              {activeItem.price}
            </span>
          </div>
          <button
            onClick={handleAcquire}
            onMouseEnter={playHoverSound}
            disabled={activeItem.status === "SOLD OUT"}
            className={`flex-1 h-12 md:h-14 rounded-xl md:rounded-2xl font-black text-[10px] uppercase tracking-[0.25em] flex items-center justify-center gap-2 transition-all ${
              activeItem.status === "SOLD OUT"
                ? "bg-foreground/5 text-foreground/20 cursor-not-allowed border border-foreground/5"
                : "bg-v6-accent text-white active:scale-95 shadow-lg shadow-v6-accent/25"
            }`}
          >
            <ShoppingBag size={13} />
            <span>{activeItem.status === "SOLD OUT" ? "SOLD OUT" : "ACQUIRE"}</span>
          </button>
        </div>

        {/* 3. Inventory selector — horizontal pills */}
        <div className="space-y-1.5 md:space-y-3">
          <label className="text-[8px] md:text-[9px] font-black opacity-30 uppercase tracking-[0.3em]">
            CORES ({items.length})
          </label>
          <div className="flex md:flex-col gap-1.5 md:gap-2 overflow-x-auto pb-1 snap-x snap-mandatory scrollbar-hide">
            {items.map((item, idx) => (
              <button
                key={item.id}
                onClick={() => selectFigurine(idx)}
                onMouseEnter={playHoverSound}
                className={`flex-shrink-0 w-36 md:w-full flex items-center justify-between p-2 md:p-3 rounded-xl md:rounded-2xl border transition-all text-left snap-start ${
                  selectedIdx === idx
                    ? "bg-foreground/5 border-foreground/20 text-foreground"
                    : "border-transparent text-foreground/40 hover:text-foreground/80 hover:bg-foreground/[0.01]"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className={`w-1.5 h-1.5 rounded-full transition-all flex-shrink-0 ${selectedIdx === idx ? "bg-v6-accent shadow-[0_0_6px_var(--v6-glow)]" : "bg-foreground/10"}`} />
                  <div className="min-w-0">
                    <p className="text-[9px] font-black uppercase tracking-wide leading-none mb-0.5 truncate">{item.name}</p>
                    <p className="text-[7px] font-mono opacity-50 uppercase tracking-widest">{item.category}</p>
                  </div>
                </div>
                <span className="text-[9px] font-black flex-shrink-0 ml-1">{item.price}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 4. Specs */}
        <div className="space-y-2.5 md:space-y-5 bg-foreground/[0.02] border border-foreground/5 rounded-xl md:rounded-[2rem] p-3 md:p-5">
          <div className="flex justify-between items-center text-[8px] md:text-[9px] font-black opacity-30 uppercase tracking-[0.3em]">
            <span>COLLECTOR DETAILS</span>
            <Settings2 size={11} />
          </div>

          {/* 2-col on all sizes — cleaner on portrait */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 md:gap-4 text-xs font-mono border-b border-foreground/5 pb-2.5 md:pb-4">
            <div className="space-y-0.5">
              <span className="text-[7px] md:text-[8px] text-foreground/40 uppercase block">Scale</span>
              <span className="font-bold text-[9px] md:text-[10px] text-foreground uppercase">{activeItem.scale}</span>
            </div>
            <div className="space-y-0.5">
              <span className="text-[7px] md:text-[8px] text-foreground/40 uppercase block">Material</span>
              <span className="font-bold text-[9px] md:text-[10px] text-foreground uppercase">{activeItem.material}</span>
            </div>
            <div className="space-y-0.5">
              <span className="text-[7px] md:text-[8px] text-foreground/40 uppercase block">Condition</span>
              <span className="font-bold text-[9px] md:text-[10px] text-foreground uppercase truncate block">{activeItem.condition}</span>
            </div>
            <div className="space-y-0.5">
              <span className="text-[7px] md:text-[8px] text-foreground/40 uppercase block">Inventory</span>
              <span className="font-bold text-[9px] md:text-[10px] text-foreground uppercase">{activeItem.inventory} Units</span>
            </div>
            <div className="hidden md:block space-y-0.5">
              <span className="text-[8px] text-foreground/40 uppercase block">Manufacturer</span>
              <span className="font-bold text-[10px] text-foreground uppercase truncate block">{activeItem.manufacturer}</span>
            </div>
            <div className="hidden md:block space-y-0.5">
              <span className="text-[8px] text-foreground/40 uppercase block">Edition Type</span>
              <span className="font-bold text-[10px] text-foreground uppercase">{productDetails.edition}</span>
            </div>
          </div>

          <div className="space-y-1.5 md:space-y-2">
            <div className="text-[7px] md:text-[8px] font-black opacity-30 uppercase tracking-[0.2em] flex items-center gap-1.5">
              <Sparkles size={10} className="v6-accent-text" />
              <span>HIGHLIGHTS</span>
            </div>
            <ul className="space-y-1 md:space-y-1.5">
              {productDetails.features.map((feature, i) => (
                <li key={i} className={`text-[9px] md:text-[9.5px] leading-relaxed text-foreground/80 font-medium flex items-start gap-1.5 ${i >= 2 ? "hidden md:flex" : "flex"}`}>
                  <CheckCircle2 size={10} className="text-v6-accent flex-shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}
