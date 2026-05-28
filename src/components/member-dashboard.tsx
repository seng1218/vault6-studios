"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ShoppingBag, LogOut, ChevronDown, Settings2, Star,
  Package, Heart, User, Shield, Loader2, CheckCircle2, MapPin
} from "lucide-react";
import { logoutMember, toggleWishlist, updateMemberProfile } from "@/app/actions/member-actions";
import { useCart } from "@/components/cart-provider";
import { playClickSound } from "@/lib/sound-effects";

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserData {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  createdAt: string;
}

interface OrderItemData {
  id: string;
  artifactId: string;
  artifactName: string;
  price: number;
  quantity: number;
}

interface OrderData {
  id: string;
  orderNumber: string;
  total: number;
  subtotal: number;
  shipping: number;
  status: string;
  createdAt: string;
  items: OrderItemData[];
}

interface ArtifactData {
  id: string;
  deploymentId: string;
  name: string;
  category: string;
  price: string;
  status: string;
  imageUrls: string;
  series: string;
}

interface WishlistItemData {
  id: string;
  artifactId: string;
  createdAt: string;
  artifact: ArtifactData;
}

interface Props {
  user: UserData;
  orders: OrderData[];
  wishlist: WishlistItemData[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function computeTier(orders: OrderData[]) {
  const completed = orders.filter(o => ["PAID", "SHIPPED", "COMPLETED"].includes(o.status));
  const spend = completed.reduce((s, o) => s + o.total, 0);
  const count = completed.length;
  if (count >= 10 || spend >= 800) return "DIRECTOR";
  if (count >= 3 || spend >= 150) return "OPERATIVE";
  if (count >= 1) return "AGENT";
  return "RECRUIT";
}

const TIER_STYLES: Record<string, string> = {
  RECRUIT:   "text-foreground/60 bg-foreground/5 border-foreground/20",
  AGENT:     "text-v6-accent bg-v6-accent/10 border-v6-accent/30",
  OPERATIVE: "text-purple-400 bg-purple-500/10 border-purple-500/30",
  DIRECTOR:  "text-yellow-400 bg-yellow-500/10 border-yellow-500/30",
};

const STATUS_STYLES: Record<string, string> = {
  PENDING:   "text-yellow-400 bg-yellow-500/10 border-yellow-500/30",
  PAID:      "text-blue-400 bg-blue-500/10 border-blue-500/30",
  SHIPPED:   "text-purple-400 bg-purple-500/10 border-purple-500/30",
  COMPLETED: "text-green-400 bg-green-500/10 border-green-500/30",
  FAILED:    "text-red-400 bg-red-500/10 border-red-500/30",
  CANCELLED: "text-red-400 bg-red-500/10 border-red-500/30",
};

function getFirstImage(imageUrls: string): string {
  const first = imageUrls.split("\n").map(u => u.trim()).find(Boolean);
  return first || "/frames/motions rem/01.jpg";
}

function fmt(amount: number): string {
  return `RM ${amount.toFixed(2)}`;
}

// ─── Component ────────────────────────────────────────────────────────────────

type Tab = "profile" | "orders" | "watchlist";

export function MemberDashboard({ user, orders, wishlist: initialWishlist }: Props) {
  const router = useRouter();
  const { addToCart } = useCart();
  const [tab, setTab] = useState<Tab>("profile");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [wishlist, setWishlist] = useState(initialWishlist);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileForm, setProfileForm] = useState({
    phone: user.phone ?? "",
    address: user.address ?? "",
    city: user.city ?? "",
    state: user.state ?? "",
    zip: user.zip ?? "",
    country: user.country ?? "MALAYSIA",
  });

  const tier = computeTier(orders);
  const memberId = `V6-M-${user.id.replace(/-/g, "").substring(0, 8).toUpperCase()}`;

  const handleLogout = async () => {
    setLoggingOut(true);
    await logoutMember();
    router.push("/");
    router.refresh();
  };

  const handleRemoveWishlist = async (artifactId: string, itemId: string) => {
    setRemovingId(itemId);
    await toggleWishlist(artifactId);
    setWishlist(w => w.filter(i => i.id !== itemId));
    setRemovingId(null);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    await updateMemberProfile(profileForm);
    setSavingProfile(false);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2500);
  };

  const TABS: { id: Tab; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: "profile",   label: "PROFILE",   icon: <User size={13} /> },
    { id: "orders",    label: "ORDER VAULT", icon: <Package size={13} />, count: orders.length },
    { id: "watchlist", label: "WATCHLIST", icon: <Heart size={13} />, count: wishlist.length },
  ];

  return (
    <div className="space-y-6 md:space-y-8">

      {/* ── Hero clearance banner ── */}
      <div className="relative bg-foreground/[0.02] border border-foreground/10 rounded-2xl md:rounded-3xl p-5 md:p-8 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-v6-accent/5 rounded-full blur-[80px] pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
          <div className="space-y-1">
            <div className="text-[9px] font-black opacity-30 uppercase tracking-[0.5em]">VAULT ACCESS GRANTED</div>
            <h1 className="text-2xl md:text-4xl font-black italic uppercase tracking-tighter">{user.name}</h1>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className={`text-[9px] font-black px-3 py-1 rounded-full border uppercase tracking-widest ${TIER_STYLES[tier]}`}>
                <Shield size={8} className="inline mr-1" />CLEARANCE: {tier}
              </span>
              <span className="text-[9px] font-mono text-foreground/40 px-2 py-1 border border-foreground/10 rounded-md">
                {memberId}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-foreground/10 text-foreground/40 hover:text-red-400 hover:border-red-400/30 transition-all text-[9px] font-black uppercase tracking-widest self-start sm:self-auto"
          >
            {loggingOut ? <Loader2 size={12} className="animate-spin" /> : <LogOut size={12} />}
            Logout
          </button>
        </div>
      </div>

      {/* ── Tab bar ── */}
      <div className="flex gap-2 border-b border-foreground/10 pb-0">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => { playClickSound(); setTab(t.id); }}
            className={`flex items-center gap-1.5 px-3 md:px-5 py-2.5 text-[9px] font-black uppercase tracking-widest border-b-2 transition-all -mb-px ${
              tab === t.id
                ? "border-v6-accent text-v6-accent"
                : "border-transparent text-foreground/40 hover:text-foreground/70"
            }`}
          >
            {t.icon}
            <span className="hidden sm:inline">{t.label}</span>
            {t.count !== undefined && t.count > 0 && (
              <span className={`text-[7px] px-1.5 py-0.5 rounded-full font-black ${tab === t.id ? "bg-v6-accent/20" : "bg-foreground/10"}`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Tab content ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {/* ─── PROFILE ─────────────────────────────────────────────────── */}
          {tab === "profile" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* Identity card */}
              <div className="bg-foreground/[0.02] border border-foreground/10 rounded-2xl p-5 space-y-4">
                <div className="text-[8px] font-black opacity-30 uppercase tracking-[0.4em] flex items-center gap-1.5">
                  <Star size={9} className="v6-accent-text" /><span>OPERATIVE FILE</span>
                </div>
                <div className="space-y-3">
                  {[
                    { label: "Designation", value: user.name },
                    { label: "Encrypted Channel", value: user.email, mono: true },
                    { label: "Clearance Date", value: new Date(user.createdAt).toLocaleDateString("en-MY", { year: "numeric", month: "long", day: "numeric" }) },
                  ].map(row => (
                    <div key={row.label}>
                      <span className="text-[7px] text-foreground/40 uppercase tracking-widest block">{row.label}</span>
                      <span className={`text-sm font-bold ${row.mono ? "font-mono opacity-80" : ""}`}>{row.value}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-3 border-t border-foreground/5 space-y-1">
                  <div className="text-[7px] opacity-30 uppercase tracking-widest">Completed Orders</div>
                  <div className="text-2xl font-black italic">
                    {orders.filter(o => ["PAID", "SHIPPED", "COMPLETED"].includes(o.status)).length}
                    <span className="text-xs font-mono opacity-30 ml-2 not-italic">
                      / {fmt(orders.filter(o => ["PAID", "SHIPPED", "COMPLETED"].includes(o.status)).reduce((s, o) => s + o.total, 0))} spent
                    </span>
                  </div>
                </div>
              </div>

              {/* Address + contact form */}
              <div className="bg-foreground/[0.02] border border-foreground/10 rounded-2xl p-5 space-y-4">
                <div className="text-[8px] font-black opacity-30 uppercase tracking-[0.4em] flex items-center gap-1.5">
                  <MapPin size={9} className="v6-accent-text" /><span>SAVED ADDRESS</span>
                </div>
                <form onSubmit={handleSaveProfile} className="space-y-3">
                  <div>
                    <label className="text-[7px] opacity-40 uppercase tracking-widest block mb-1">Phone</label>
                    <input
                      type="tel"
                      value={profileForm.phone}
                      onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))}
                      placeholder="+60 12-345 6789"
                      className="w-full bg-background/50 border border-foreground/10 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-v6-accent transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-[7px] opacity-40 uppercase tracking-widest block mb-1">Street Address</label>
                    <input
                      type="text"
                      value={profileForm.address}
                      onChange={e => setProfileForm(f => ({ ...f, address: e.target.value }))}
                      placeholder="No. 1, Jalan Example"
                      className="w-full bg-background/50 border border-foreground/10 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-v6-accent transition-all"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[7px] opacity-40 uppercase tracking-widest block mb-1">City</label>
                      <input
                        type="text"
                        value={profileForm.city}
                        onChange={e => setProfileForm(f => ({ ...f, city: e.target.value }))}
                        placeholder="Kuala Lumpur"
                        className="w-full bg-background/50 border border-foreground/10 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-v6-accent transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-[7px] opacity-40 uppercase tracking-widest block mb-1">Postcode</label>
                      <input
                        type="text"
                        value={profileForm.zip}
                        onChange={e => setProfileForm(f => ({ ...f, zip: e.target.value }))}
                        placeholder="50000"
                        className="w-full bg-background/50 border border-foreground/10 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-v6-accent transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[7px] opacity-40 uppercase tracking-widest block mb-1">State</label>
                    <input
                      type="text"
                      value={profileForm.state}
                      onChange={e => setProfileForm(f => ({ ...f, state: e.target.value }))}
                      placeholder="Selangor"
                      className="w-full bg-background/50 border border-foreground/10 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-v6-accent transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="w-full h-10 bg-v6-accent/10 border border-v6-accent/30 text-v6-accent rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-v6-accent hover:text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {savingProfile ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : profileSaved ? (
                      <><CheckCircle2 size={12} /><span>SAVED</span></>
                    ) : (
                      <><Settings2 size={12} /><span>SAVE ADDRESS</span></>
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ─── ORDERS ──────────────────────────────────────────────────── */}
          {tab === "orders" && (
            <div className="space-y-3">
              {orders.length === 0 ? (
                <div className="text-center py-20 space-y-3">
                  <Package size={32} className="mx-auto opacity-10" />
                  <p className="font-mono text-xs uppercase tracking-[0.4em] opacity-30">NO ACQUISITIONS ON RECORD</p>
                  <Link href="/collection" className="inline-block text-[10px] font-black uppercase tracking-widest text-v6-accent hover:text-foreground transition-colors mt-2">
                    Browse Vault →
                  </Link>
                </div>
              ) : (
                orders.map(order => (
                  <div key={order.id} className="border border-foreground/10 rounded-2xl overflow-hidden">
                    <button
                      onClick={() => { playClickSound(); setExpandedOrder(expandedOrder === order.id ? null : order.id); }}
                      className="w-full p-4 flex items-center justify-between hover:bg-foreground/[0.02] transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="font-mono text-xs font-black truncate">{order.orderNumber}</span>
                        <span className={`text-[8px] font-black px-2 py-0.5 rounded-full border uppercase tracking-wider flex-shrink-0 ${STATUS_STYLES[order.status] ?? STATUS_STYLES.PENDING}`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="font-black text-sm">{fmt(order.total)}</span>
                        <ChevronDown
                          size={14}
                          className={`opacity-40 transition-transform ${expandedOrder === order.id ? "rotate-180" : ""}`}
                        />
                      </div>
                    </button>

                    <AnimatePresence>
                      {expandedOrder === order.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="border-t border-foreground/5 bg-foreground/[0.01] p-4 space-y-2">
                            {order.items.map(item => (
                              <div key={item.id} className="flex justify-between items-center text-sm">
                                <span className="opacity-80 truncate mr-4">{item.artifactName} <span className="opacity-40">× {item.quantity}</span></span>
                                <span className="font-mono font-bold flex-shrink-0">{fmt(item.price * item.quantity)}</span>
                              </div>
                            ))}
                            <div className="border-t border-foreground/5 pt-2 flex flex-col sm:flex-row sm:justify-between gap-1 text-[9px] font-mono opacity-40 uppercase tracking-widest">
                              <span>{new Date(order.createdAt).toLocaleDateString("en-MY", { year: "numeric", month: "short", day: "numeric" })}</span>
                              <Link href={`/tracking?id=${order.orderNumber}`} className="hover:text-v6-accent transition-colors">
                                Track order →
                              </Link>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ─── WATCHLIST ───────────────────────────────────────────────── */}
          {tab === "watchlist" && (
            <div>
              {wishlist.length === 0 ? (
                <div className="text-center py-20 space-y-3">
                  <Heart size={32} className="mx-auto opacity-10" />
                  <p className="font-mono text-xs uppercase tracking-[0.4em] opacity-30">WATCHLIST EMPTY</p>
                  <Link href="/collection" className="inline-block text-[10px] font-black uppercase tracking-widest text-v6-accent hover:text-foreground transition-colors mt-2">
                    Browse Vault →
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {wishlist.map(item => (
                    <div key={item.id} className="bg-foreground/[0.02] border border-foreground/10 rounded-2xl overflow-hidden group">
                      <div className="aspect-square bg-foreground/5 relative overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={getFirstImage(item.artifact.imageUrls)}
                          alt={item.artifact.name}
                          className="w-full h-full object-contain mix-blend-lighten p-3"
                        />
                        <div className={`absolute top-2 right-2 text-[7px] font-black px-1.5 py-0.5 rounded-full border uppercase tracking-wider ${STATUS_STYLES[item.artifact.status] ?? STATUS_STYLES.PENDING}`}>
                          {item.artifact.status}
                        </div>
                      </div>
                      <div className="p-3 space-y-2">
                        <div>
                          <p className="text-[9px] font-black uppercase tracking-wide leading-tight truncate">{item.artifact.name}</p>
                          <p className="text-[7px] opacity-40 uppercase tracking-widest">{item.artifact.series}</p>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-black">{item.artifact.price}</span>
                        </div>
                        <div className="flex gap-1.5">
                          <button
                            disabled={item.artifact.status === "SOLD OUT"}
                            onClick={() => {
                              playClickSound();
                              addToCart({
                                id: item.artifact.id,
                                deploymentId: item.artifact.deploymentId,
                                name: item.artifact.name,
                                price: item.artifact.price,
                              });
                            }}
                            className="flex-1 h-8 bg-v6-accent/10 border border-v6-accent/20 text-v6-accent rounded-lg text-[8px] font-black uppercase tracking-wider flex items-center justify-center gap-1 hover:bg-v6-accent hover:text-white transition-all disabled:opacity-20 disabled:cursor-not-allowed"
                          >
                            <ShoppingBag size={9} />
                            <span>Cart</span>
                          </button>
                          <button
                            disabled={removingId === item.id}
                            onClick={() => handleRemoveWishlist(item.artifactId, item.id)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg border border-foreground/10 text-foreground/30 hover:text-red-400 hover:border-red-400/30 transition-all"
                          >
                            {removingId === item.id ? <Loader2 size={10} className="animate-spin" /> : <span className="text-xs">✕</span>}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
