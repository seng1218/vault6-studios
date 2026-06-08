"use client";

import React, { useState, useMemo } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { useCart } from "@/components/cart-provider";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Shield,
  ArrowRight,
  Trash2,
  ChevronLeft,
  Package,
  Loader2,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { TransmissionOverlay } from "@/components/transmission-overlay";

const REGIONS = [
  { label: "PENINSULAR MALAYSIA", fee: 5 },
  { label: "EAST MALAYSIA (SABAH/SARAWAK)", fee: 10 },
  { label: "INTERNATIONAL", fee: 30 },
];

const inputClass =
  "w-full bg-foreground/[0.06] border border-foreground/20 rounded-2xl p-6 text-xs font-black tracking-widest text-foreground placeholder:text-foreground/40 focus:border-v6-accent focus:bg-foreground/10 focus:outline-none focus:ring-2 focus:ring-v6-accent/40 transition-all uppercase cursor-text";
const labelClass =
  "text-[11px] font-black opacity-60 uppercase tracking-widest ml-4";

export default function CheckoutPage() {
  const { cart, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isTransmissionVisible, setIsTransmissionVisible] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    zip: "",
    region: "PENINSULAR MALAYSIA",
  });

  const shippingFee = useMemo(() => {
    const region = REGIONS.find((r) => r.label === form.region);
    return region ? region.fee : 0;
  }, [form.region]);

  const grandTotal = totalPrice + shippingFee;

  const isFormValid =
    form.name && form.email && form.phone && form.address && form.city && form.zip;

  const handleProceedToFiuu = async () => {
    setIsProcessing(true);

    try {
      const res = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: form.name,
          customerEmail: form.email,
          customerPhone: form.phone,
          address: form.address,
          city: form.city,
          state: form.region,
          zip: form.zip,
          country: form.region === "INTERNATIONAL" ? "INTERNATIONAL" : "MALAYSIA",
          subtotal: totalPrice,
          shipping: shippingFee,
          total: grandTotal,
          items: cart.map((item) => ({
            artifactId: item.deploymentId,
            artifactName: item.name,
            price: parseFloat(item.price.replace(/[^0-9.]/g, "")),
            quantity: item.quantity,
          })),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Failed to initiate payment.");
      }

      setIsTransmissionVisible(true);

      const { paymentUrl, params } = await res.json();

      // Auto-submit form to Fiuu hosted payment page
      const fiuuForm = document.createElement("form");
      fiuuForm.method = "POST";
      fiuuForm.action = paymentUrl;

      Object.entries(params).forEach(([key, value]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = String(value);
        fiuuForm.appendChild(input);
      });

      document.body.appendChild(fiuuForm);
      
      // Delay form submission to let the transmission overlay play
      setTimeout(() => {
        fiuuForm.submit();
      }, 3000);
      
      // Note: cart is cleared on successful return via /payment/return
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong.";
      setPaymentError(message);
      setIsProcessing(false);
    }
  };

  if (cart.length === 0) {
    return (
      <main className="min-h-screen bg-background text-foreground flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-8">
          <div className="w-24 h-24 bg-foreground/5 rounded-full flex items-center justify-center opacity-20">
            <Package size={48} />
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-black italic uppercase tracking-tighter">
              Your cart is empty
            </h2>
            <p className="opacity-40 text-[10px] font-black uppercase tracking-widest">
              No artifacts scheduled for deployment
            </p>
          </div>
          <Link
            href="/collection"
            className="bg-v6-accent text-white px-12 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:opacity-90 transition-all shadow-xl shadow-v6-accent/20 cursor-pointer"
          >
            Browse Collection
          </Link>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col selection:bg-v6-accent selection:text-white overflow-x-hidden">
      <Header />
      
      <TransmissionOverlay 
        isVisible={isTransmissionVisible}
        onComplete={() => {}}
        itemName={`MANIFEST_V6_${Math.random().toString(36).substring(7).toUpperCase()}`}
      />

      <div className="flex-1 pt-48 pb-32 px-6 md:px-12 max-w-6xl mx-auto w-full">
        {/* Step indicator */}
        <div className="flex items-center gap-4 mb-12 opacity-40">
          <div className={`flex items-center gap-2 ${step >= 1 ? "text-v6-accent opacity-100" : ""}`}>
            <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-[10px] font-black">1</span>
            <span className="text-[10px] font-black uppercase tracking-widest">Shipping</span>
          </div>
          <div className="w-12 h-px bg-current opacity-20" />
          <div className={`flex items-center gap-2 ${step >= 2 ? "text-v6-accent opacity-100" : ""}`}>
            <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-[10px] font-black">2</span>
            <span className="text-[10px] font-black uppercase tracking-widest">Review & Pay</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Main Flow */}
          <div className="lg:col-span-7 space-y-12">
            <AnimatePresence mode="wait">
              {/* ── Step 1: Shipping ── */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-12"
                >
                  <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-v6-accent/10 border border-v6-accent/20">
                       <span className="text-[8px] font-black v6-accent-text uppercase tracking-widest">Protocol: V6_MANIFEST_ENTRY</span>
                    </div>
                    <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter">
                      Shipping Manifest<span className="v6-accent-text">.</span>
                    </h2>
                    <p className="opacity-40 text-[10px] font-black uppercase tracking-widest leading-relaxed">
                      Where should we deliver your artifacts?
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 v6-surface border border-foreground/10 p-8 md:p-12 rounded-[2.5rem] relative overflow-hidden group">
                    <motion.div
                      initial={{ top: "-10%" }}
                      whileHover={{ top: "110%" }}
                      transition={{ duration: 1.5, ease: "linear" }}
                      className="absolute left-0 right-0 h-px bg-v6-accent shadow-[0_0_15px_var(--v6-accent)] z-20 pointer-events-none opacity-0 group-hover:opacity-100"
                    />
                    <div className="space-y-2 relative z-10">
                      <label htmlFor="checkout-name" className={labelClass}>Full Name</label>
                      <input id="checkout-name" type="text" placeholder="YOUR FULL NAME" value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className={inputClass} required />
                    </div>
                    <div className="space-y-2 relative z-10">
                      <label htmlFor="checkout-email" className={labelClass}>Email</label>
                      <input id="checkout-email" type="email" placeholder="YOUR EMAIL" value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className={inputClass} required />
                    </div>
                    <div className="md:col-span-2 space-y-2 relative z-10">
                      <label htmlFor="checkout-phone" className={labelClass}>Phone</label>
                      <input id="checkout-phone" type="tel" placeholder="E.G. 0123456789" value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className={inputClass} required />
                    </div>
                    <div className="md:col-span-2 space-y-2 relative z-10">
                      <label htmlFor="checkout-address" className={labelClass}>Street Address</label>
                      <input id="checkout-address" type="text" placeholder="STREET ADDRESS" value={form.address}
                        onChange={(e) => setForm({ ...form, address: e.target.value })}
                        className={inputClass} required />
                    </div>
                    <div className="space-y-2 relative z-10">
                      <label htmlFor="checkout-city" className={labelClass}>City</label>
                      <input id="checkout-city" type="text" placeholder="CITY" value={form.city}
                        onChange={(e) => setForm({ ...form, city: e.target.value })}
                        className={inputClass} required />
                    </div>
                    <div className="space-y-2 relative z-10">
                      <label htmlFor="checkout-zip" className={labelClass}>Postcode</label>
                      <input id="checkout-zip" type="text" inputMode="numeric" placeholder="POSTCODE" value={form.zip}
                        onChange={(e) => setForm({ ...form, zip: e.target.value })}
                        className={inputClass} required />
                    </div>
                    <div className="md:col-span-2 space-y-2 relative z-10">
                      <label htmlFor="checkout-region" className={labelClass}>Shipping Region</label>
                      <select id="checkout-region" value={form.region}
                        onChange={(e) => setForm({ ...form, region: e.target.value })}
                        className={inputClass + " appearance-none cursor-pointer"}>
                        {REGIONS.map((region) => (
                          <option key={region.label} value={region.label}>
                            {region.label} (+MYR {region.fee})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={() => setStep(2)}
                    disabled={!isFormValid}
                    className="w-full bg-v6-accent text-white h-24 rounded-[2.5rem] font-black text-xs md:text-sm uppercase tracking-[0.5em] hover:opacity-90 active:scale-[0.98] transition-all shadow-[0_0_40px_var(--v6-glow)] disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-4 group cursor-pointer"
                  >
                    Review Order <ArrowRight size={22} className="group-hover:translate-x-2 transition-transform" />
                  </button>
                </motion.div>
              )}

              {/* ── Step 2: Review & Pay ── */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-12"
                >
                  <button
                    onClick={() => setStep(1)}
                    className="flex items-center gap-2 opacity-40 hover:opacity-100 transition-opacity text-[10px] font-black uppercase tracking-[0.3em] cursor-pointer"
                  >
                    <ChevronLeft size={16} /> Back to Order
                  </button>

                  <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-v6-accent/10 border border-v6-accent/20">
                       <span className="text-[8px] font-black v6-accent-text uppercase tracking-widest">Step 2: Review</span>
                    </div>
                    <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter">
                      Verification<span className="v6-accent-text">.</span>
                    </h2>
                    <p className="opacity-40 text-[10px] font-black uppercase tracking-widest leading-relaxed">
                      Check your details below, then proceed to payment.
                    </p>
                  </div>

                  {/* Delivery summary */}
                  <div className="v6-surface border border-foreground/10 rounded-[2.5rem] p-10 space-y-8 relative overflow-hidden group">
                     <motion.div
                      initial={{ top: "-10%" }}
                      whileHover={{ top: "110%" }}
                      transition={{ duration: 1.5, ease: "linear" }}
                      className="absolute left-0 right-0 h-px bg-v6-accent shadow-[0_0_15px_var(--v6-accent)] z-20 pointer-events-none opacity-0 group-hover:opacity-100"
                    />
                    <p className="text-[9px] font-black opacity-30 uppercase tracking-[0.4em]">Delivery Details</p>
                    <div className="grid grid-cols-2 gap-x-12 gap-y-6 text-xs relative z-10">
                      <div>
                        <p className="opacity-30 text-[8px] font-black uppercase tracking-widest">Name</p>
                        <p className="font-black uppercase mt-1 text-base">{form.name}</p>
                      </div>
                      <div>
                        <p className="opacity-30 text-[8px] font-black uppercase tracking-widest">Phone</p>
                        <p className="font-black mt-1 text-base">{form.phone}</p>
                      </div>
                      <div className="col-span-2 pt-6 border-t border-foreground/5">
                        <p className="opacity-30 text-[8px] font-black uppercase tracking-widest">Deliver to</p>
                        <p className="font-black uppercase mt-1 text-base tracking-tight leading-relaxed">{form.address}, {form.city}, {form.zip}</p>
                        <p className="font-mono text-[9px] text-v6-accent mt-3 uppercase tracking-widest bg-v6-accent/5 inline-block px-3 py-1 rounded-md">MODE: {form.region}</p>
                      </div>
                    </div>
                  </div>

                  {/* Payment gateway info */}
                  <div className="v6-surface-sm border-2 border-v6-accent/20 rounded-[2.5rem] p-10 space-y-8 relative overflow-hidden shadow-[0_0_40px_rgba(59,130,246,0.05)]">
                    <div className="flex items-center justify-between relative z-10">
                      <div className="flex items-center gap-5">
                        <div className="w-16 h-16 bg-v6-accent/10 rounded-2xl flex items-center justify-center border border-v6-accent/20">
                          <ShieldCheck size={32} className="v6-accent-text" />
                        </div>
                        <div>
                          <p className="text-sm font-black uppercase tracking-widest">Fiuu Secure Gateway</p>
                          <p className="text-[9px] font-black opacity-40 uppercase tracking-[0.2em] mt-1">
                            FPX · CREDIT_DEBIT · E-WALLETS
                          </p>
                        </div>
                      </div>
                      <a href="https://fiuu.com" target="_blank" rel="noopener noreferrer" className="p-3 rounded-full hover:bg-foreground/5 transition-all opacity-30 hover:opacity-100">
                        <ExternalLink size={20} />
                      </a>
                    </div>
                    <p className="text-[11px] font-black opacity-50 uppercase tracking-widest leading-relaxed relative z-10 max-w-xl">
                      You&apos;ll be taken to Fiuu to complete payment. We never see or store your card details.
                    </p>
                  </div>

                  {paymentError && (
                    <div role="alert" className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-[11px] font-black uppercase tracking-widest">
                      Error: {paymentError}
                    </div>
                  )}

                  <button
                    onClick={() => { setPaymentError(null); handleProceedToFiuu(); }}
                    disabled={isProcessing}
                    className="w-full bg-foreground text-background h-24 rounded-[2.5rem] font-black text-xs md:text-sm uppercase tracking-[0.5em] hover:bg-v6-accent hover:text-white transition-all shadow-2xl disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-4 group cursor-pointer"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 size={24} className="animate-spin" /> PROCESSING...
                      </>
                    ) : (
                      <>
                        PAY NOW <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
                      </>
                    )}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Cart Sidebar ── */}
          <div className="lg:col-span-5 space-y-12">
            <div className="bg-foreground text-background rounded-[3rem] p-10 sticky top-48 shadow-2xl relative overflow-hidden group">

              <div className="flex justify-between items-center mb-10 pb-6 border-b border-background/10 relative z-10 text-background">
                <div className="space-y-1">
                   <span className="text-[10px] font-black uppercase tracking-[0.5em] text-background/40">Inventory Manifest</span>
                   <h3 className="text-2xl font-black italic uppercase tracking-tighter leading-none text-background">DEPLOYMENT_LIST</h3>
                </div>
                <span className="text-[10px] font-black bg-background/10 text-background px-4 py-1.5 rounded-full border border-background/20">{cart.length} UNITS</span>
              </div>

              <div className="space-y-6 mb-10 max-h-[40vh] overflow-y-auto pr-4 scrollbar-hide relative z-10">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between items-start gap-4 py-4 border-b border-background/5 group/item text-background">
                    <div className="flex gap-5">
                      <div className="w-16 h-16 bg-background/5 rounded-2xl flex items-center justify-center border border-background/10">
                        <Package size={24} className="text-background opacity-20" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-black uppercase italic leading-tight text-background group-hover/item:text-v6-accent transition-colors">{item.name}</p>
                        <div className="flex items-center gap-4">
                           <p className="text-[8px] font-black opacity-30 text-background uppercase tracking-[0.2em] font-mono">
                             {item.deploymentId}
                           </p>
                           {step === 1 && (
                             <div className="flex items-center bg-background/10 rounded-lg p-0.5 border border-background/10">
                                <button
                                  onClick={() => updateQuantity(item.id, -1)}
                                  aria-label={`Decrease quantity of ${item.name}`}
                                  className="w-9 h-9 flex items-center justify-center hover:bg-v6-accent hover:text-white rounded-md transition-all text-background/60 font-black cursor-pointer"
                                >
                                  -
                                </button>
                                <span className="w-8 text-center text-[10px] font-black text-background">{item.quantity}</span>
                                <button
                                  onClick={() => updateQuantity(item.id, 1)}
                                  aria-label={`Increase quantity of ${item.name}`}
                                  className="w-9 h-9 flex items-center justify-center hover:bg-v6-accent hover:text-white rounded-md transition-all text-background/60 font-black cursor-pointer"
                                >
                                  +
                                </button>
                             </div>
                           )}
                        </div>
                        {step === 1 && (
                          <button
                            onClick={() => {
                              if (window.confirm(`Remove "${item.name}" from cart?`)) removeFromCart(item.id);
                            }}
                            aria-label={`Remove ${item.name} from cart`}
                            className="text-[11px] font-black text-red-400 uppercase tracking-widest mt-2 hover:text-red-500 transition-colors cursor-pointer py-1"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-sm font-black italic text-background font-mono">{item.price}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-4 pt-10 border-t border-background/10 relative z-10 text-background">
                <div className="flex justify-between items-center opacity-40">
                  <span className="text-[10px] font-black uppercase tracking-widest">Subtotal_Value</span>
                  <span className="text-sm font-mono">MYR {totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center opacity-40">
                  <span className="text-[10px] font-black uppercase tracking-widest">Logistics_Fee</span>
                  <span className="text-sm font-mono">RM {shippingFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-end pt-8 mt-4 border-t border-background/20">
                  <div className="space-y-1">
                     <span className="text-[9px] font-black uppercase tracking-[0.4em] text-v6-accent">Total_Acquisition</span>
                     <p className="text-5xl font-black italic tracking-tighter text-background leading-none">RM {(totalPrice + shippingFee).toFixed(2)}</p>
                  </div>
                  <div className="w-12 h-12 rounded-3xl bg-background/5 border border-background/10 flex items-center justify-center">
                     <Package size={20} className="text-background opacity-20" />
                  </div>
                </div>
              </div>

              {/* Packaging Protocol Badge */}
              <div className="relative z-10 pt-10 mt-10 border-t border-background/10 flex items-center gap-6">
                 <div className="w-14 h-14 rounded-2xl bg-background/5 border border-background/10 flex items-center justify-center shrink-0">
                    <ShieldCheck className="text-v6-accent" size={24} />
                 </div>
                 <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-background">Security_Packaging</p>
                    <p className="text-[8px] font-bold opacity-30 text-background uppercase tracking-tighter leading-tight">Reinforced industrial crate with custom high-density foam suspension.</p>
                 </div>
              </div>
            </div>
            
            <div className="p-8 border border-foreground/10 rounded-[2.5rem] v6-surface-xs flex items-start gap-5 opacity-40 grayscale hover:opacity-100 hover:grayscale-0 transition-all">
                <Shield size={20} className="text-v6-accent shrink-0 mt-1" />
                <div className="space-y-1 text-foreground">
                   <p className="text-[10px] font-black uppercase tracking-widest">Verified Physical Integrity</p>
                   <p className="text-[9px] font-bold uppercase tracking-tight leading-relaxed">All figures undergo multi-stage physical inspection prior to manifest authorization.</p>
                </div>
             </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
