"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { fetchArtifactById, fetchArtifacts } from "@/app/actions/artifact-actions";
import { useCart } from "@/components/cart-provider";
import { playHoverSound, playClickSound, playSuccessSound } from "@/lib/sound-effects";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ShoppingBag, ArrowLeft, CheckCircle2, ChevronLeft, ChevronRight,
  Shield, Package, Tag, Layers, Wrench, Box, Sparkles, ArrowUpRight
} from "lucide-react";

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCart();

  const [artifact, setArtifact] = useState<any>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setActiveImage(0);
      const id = params.id as string;
      const res = await fetchArtifactById(id);
      if (res.success && res.data) {
        setArtifact(res.data);
        // Fetch related items
        const allRes = await fetchArtifacts();
        if (allRes.success && allRes.data) {
          const others = allRes.data.filter((a: any) => a.id !== id).slice(0, 3);
          setRelated(others);
        }
      } else {
        router.push("/collection");
      }
      setLoading(false);
    };
    load();
  }, [params.id]);

  const images: string[] = artifact?.imageUrls
    ? artifact.imageUrls.split("\n").map((u: string) => u.trim()).filter(Boolean)
    : [];

  const highlights: string[] = artifact?.highlights
    ? artifact.highlights.split("\n").map((h: string) => h.trim()).filter(Boolean)
    : [];

  const handleAddToCart = () => {
    if (!artifact || artifact.status === "SOLD OUT") return;
    playSuccessSound();
    addToCart({
      id: artifact.id,
      deploymentId: artifact.deploymentId,
      name: artifact.name,
      price: artifact.price,
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2500);
  };

  const statusColors: Record<string, string> = {
    AVAILABLE: "text-green-400 border-green-400/30 bg-green-400/10",
    LIMITED: "text-yellow-400 border-yellow-400/30 bg-yellow-400/10",
    "PRE-ORDER": "text-blue-400 border-blue-400/30 bg-blue-400/10",
    "SOLD OUT": "text-foreground/30 border-foreground/10 bg-foreground/5",
  };

  const specItems = artifact ? [
    { label: "Scale", value: artifact.scale, icon: Layers },
    { label: "Material", value: artifact.material, icon: Wrench },
    { label: "Condition", value: artifact.condition, icon: Shield },
    { label: "Manufacturer", value: artifact.manufacturer, icon: Tag },
    { label: "Category", value: artifact.category, icon: Package },
    { label: "Inventory", value: `${artifact.inventory} Units`, icon: Box },
  ] : [];

  if (loading) {
    return (
      <main className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-2 border-v6-accent border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30">Loading Artifact...</p>
        </div>
      </main>
    );
  }

  if (!artifact) return null;

  return (
    <main className="min-h-screen bg-background text-foreground selection:bg-v6-accent selection:text-white overflow-x-hidden">
      <Header />

      {/* Cinematic Background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-v6-accent/5 rounded-full blur-[150px]" />
        <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] bg-pink-500/5 rounded-full blur-[120px]" />
        <div className="absolute inset-0 opacity-[0.025] bg-[radial-gradient(circle_at_50%_50%,var(--v6-glow),transparent_70%)]" />
      </div>

      <div className="relative z-10 pt-36 pb-32 px-6 md:px-12 max-w-7xl mx-auto">

        {/* Breadcrumb */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-3 mb-16 text-[9px] font-black uppercase tracking-[0.3em] opacity-40"
        >
          <Link href="/" onMouseEnter={playHoverSound} onClick={playClickSound} className="hover:opacity-100 hover:text-v6-accent transition-colors">Home</Link>
          <span>/</span>
          <Link href="/collection" onMouseEnter={playHoverSound} onClick={playClickSound} className="hover:opacity-100 hover:text-v6-accent transition-colors">Collection</Link>
          <span>/</span>
          <span className="opacity-100 text-v6-accent">{artifact.name}</span>
        </motion.div>

        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-10"
        >
          <Link
            href="/collection"
            onMouseEnter={playHoverSound}
            onClick={playClickSound}
            className="inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 hover:text-v6-accent transition-all"
          >
            <ArrowLeft size={14} /> Back to Vault
          </Link>
        </motion.div>

        {/* Main Product Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 xl:gap-24 mb-32">

          {/* LEFT: Image Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-4"
          >
            {/* Main Image */}
            <div className="relative aspect-square bg-foreground/[0.02] border border-foreground/5 rounded-[3rem] overflow-hidden group">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,var(--v6-glow),transparent_70%)] opacity-5" />

              <AnimatePresence mode="wait">
                {images.length > 0 ? (
                  <motion.img
                    key={activeImage}
                    src={images[activeImage]}
                    alt={`${artifact.name} - View ${activeImage + 1}`}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    className="w-full h-full object-contain p-12 mix-blend-lighten"
                  />
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="w-full h-full flex items-center justify-center"
                  >
                    <div className="text-center space-y-3 opacity-20">
                      <Package size={48} className="mx-auto" />
                      <p className="text-[9px] font-black uppercase tracking-widest">No Images</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Status badge */}
              <div className="absolute top-6 left-6">
                <span className={`text-[8px] font-black px-3 py-1.5 rounded-full border uppercase tracking-widest ${statusColors[artifact.status] || statusColors["SOLD OUT"]}`}>
                  {artifact.status}
                </span>
              </div>

              {/* Navigation arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImage((activeImage - 1 + images.length) % images.length)}
                    onMouseEnter={playHoverSound}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/70 backdrop-blur border border-foreground/10 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-v6-accent hover:border-v6-accent hover:text-white transition-all"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => setActiveImage((activeImage + 1) % images.length)}
                    onMouseEnter={playHoverSound}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/70 backdrop-blur border border-foreground/10 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-v6-accent hover:border-v6-accent hover:text-white transition-all"
                  >
                    <ChevronRight size={16} />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {images.map((url, idx) => (
                  <button
                    key={idx}
                    onClick={() => { playClickSound(); setActiveImage(idx); }}
                    onMouseEnter={playHoverSound}
                    className={`relative flex-shrink-0 w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all ${
                      activeImage === idx
                        ? "border-v6-accent shadow-[0_0_15px_var(--v6-glow)]"
                        : "border-foreground/10 hover:border-foreground/30"
                    }`}
                  >
                    <img src={url} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* RIGHT: Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            className="flex flex-col justify-between gap-10"
          >
            {/* Identity */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-[9px] font-black v6-accent-text tracking-[0.4em] uppercase">{artifact.series} SERIES</span>
                <span className="text-[8px] font-mono opacity-30 px-2 py-0.5 border border-foreground/10 rounded">{artifact.deploymentId}</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-black italic uppercase tracking-tighter leading-none">{artifact.name}</h1>
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-50 leading-relaxed">
                {artifact.category} · {artifact.manufacturer}
              </p>
            </div>

            {/* Price & CTA */}
            <div className="space-y-5 py-8 border-y border-foreground/5">
              <div>
                <span className="text-[8px] font-black opacity-30 tracking-[0.3em] uppercase block mb-1">Acquisition Cost</span>
                <span className="text-5xl font-black italic tracking-tighter">{artifact.price}</span>
              </div>
              <button
                onClick={handleAddToCart}
                onMouseEnter={playHoverSound}
                disabled={artifact.status === "SOLD OUT"}
                className={`w-full h-16 rounded-2xl font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all duration-300 ${
                  artifact.status === "SOLD OUT"
                    ? "bg-foreground/5 text-foreground/20 cursor-not-allowed"
                    : addedToCart
                    ? "bg-green-500 text-white scale-[1.02] shadow-lg shadow-green-500/20"
                    : "bg-v6-accent text-white hover:scale-[1.02] hover:shadow-xl hover:shadow-v6-accent/30 active:scale-[0.98]"
                }`}
              >
                {addedToCart ? (
                  <><CheckCircle2 size={18} /> Added to Cart</>
                ) : artifact.status === "SOLD OUT" ? (
                  <><Package size={18} /> Out of Stock</>
                ) : (
                  <><ShoppingBag size={18} /> Add to Cart</>
                )}
              </button>
              {artifact.status === "PRE-ORDER" && (
                <p className="text-center text-[9px] font-black opacity-30 uppercase tracking-widest">
                  Pre-order now · Ships when ready
                </p>
              )}
            </div>

            {/* Spec Grid */}
            <div className="space-y-4">
              <span className="text-[9px] font-black opacity-30 uppercase tracking-[0.3em]">Collector Specifications</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {specItems.map(({ label, value, icon: Icon }) => (
                  <div key={label} className="bg-foreground/[0.02] border border-foreground/5 rounded-2xl p-4 space-y-2">
                    <div className="flex items-center gap-1.5 text-foreground/30">
                      <Icon size={10} />
                      <span className="text-[7px] font-black uppercase tracking-widest">{label}</span>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider block truncate">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Highlights */}
            {highlights.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-[9px] font-black opacity-30 uppercase tracking-[0.3em]">
                  <Sparkles size={11} className="text-v6-accent" />
                  Product Highlights
                </div>
                <ul className="space-y-2">
                  {highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-2 text-[10px] font-medium text-foreground/70 leading-relaxed">
                      <CheckCircle2 size={12} className="text-v6-accent flex-shrink-0 mt-0.5" />
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="flex items-end justify-between mb-10">
              <div>
                <span className="text-[9px] font-black v6-accent-text uppercase tracking-[0.4em] block mb-2">You May Also Like</span>
                <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter leading-none">RELATED<span className="v6-accent-text">.</span></h2>
              </div>
              <Link
                href="/collection"
                onMouseEnter={playHoverSound}
                onClick={playClickSound}
                className="text-[9px] font-black uppercase tracking-widest opacity-30 hover:opacity-100 hover:text-v6-accent transition-all flex items-center gap-2"
              >
                View All <ArrowUpRight size={14} />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {related.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.4 + i * 0.1 }}
                  whileHover={{ y: -6, transition: { duration: 0.2 } }}
                >
                  <Link
                    href={`/collection/${item.id}`}
                    onMouseEnter={playHoverSound}
                    onClick={playClickSound}
                    className="block group bg-foreground/[0.02] border border-foreground/5 rounded-[2rem] p-8 hover:bg-foreground/[0.05] hover:border-foreground/10 transition-all duration-300 overflow-hidden relative"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-v6-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative z-10 space-y-4">
                      {/* Mini image */}
                      <div className="w-full h-32 rounded-2xl bg-foreground/5 overflow-hidden">
                        {item.imageUrls ? (
                          <img
                            src={item.imageUrls.split("\n")[0]?.trim()}
                            alt={item.name}
                            className="w-full h-full object-contain mix-blend-lighten"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center opacity-10">
                            <Package size={24} />
                          </div>
                        )}
                      </div>
                      <div>
                        <span className="text-[7px] font-black opacity-30 tracking-widest uppercase block mb-1">{item.category}</span>
                        <h3 className="text-lg font-black italic uppercase tracking-tighter group-hover:text-v6-accent transition-colors">{item.name}</h3>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-black italic">{item.price}</span>
                        <ArrowUpRight size={14} className="opacity-30 group-hover:opacity-100 group-hover:text-v6-accent transition-all" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}
      </div>

      <Footer />
    </main>
  );
}
