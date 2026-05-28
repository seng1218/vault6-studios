"use client";

import React, { useState, useMemo } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { useCart } from "@/components/cart-provider";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  ArrowRight,
  Trash2,
  ChevronLeft,
  Package,
  Loader2,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

const REGIONS = [
  { label: "PENINSULAR MALAYSIA", fee: 5 },
  { label: "EAST MALAYSIA (SABAH/SARAWAK)", fee: 10 },
  { label: "INTERNATIONAL", fee: 30 },
];

const inputClass =
  "w-full bg-foreground/[0.06] border border-foreground/20 rounded-2xl p-6 text-xs font-black tracking-widest text-foreground placeholder:text-foreground/40 focus:border-v6-accent focus:bg-foreground/10 outline-none transition-all uppercase";
const labelClass =
  "text-[9px] font-black opacity-50 uppercase tracking-widest ml-4";

export default function CheckoutPage() {
  const { cart, removeFromCart, totalPrice, clearCart } = useCart();
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
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
      fiuuForm.submit();
      // Note: cart is cleared on successful return via /payment/return
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong.";
      alert(message);
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
            className="bg-v6-accent text-white px-12 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:scale-105 transition-all shadow-xl shadow-v6-accent/20"
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
                    <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter">
                      Shipping Info<span className="v6-accent-text">.</span>
                    </h2>
                    <p className="opacity-40 text-[10px] font-black uppercase tracking-widest leading-relaxed">
                      Where should we deliver your artifacts?
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className={labelClass}>Full Name</label>
                      <input type="text" placeholder="OPERATIVE NAME" value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className={inputClass} />
                    </div>
                    <div className="space-y-2">
                      <label className={labelClass}>Email Address</label>
                      <input type="email" placeholder="COMMUNICATION HUB" value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className={inputClass} />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className={labelClass}>Phone Number</label>
                      <input type="tel" placeholder="E.G. 0123456789" value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className={inputClass} />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className={labelClass}>Street Address</label>
                      <input type="text" placeholder="DESTINATION COORDINATES" value={form.address}
                        onChange={(e) => setForm({ ...form, address: e.target.value })}
                        className={inputClass} />
                    </div>
                    <div className="space-y-2">
                      <label className={labelClass}>City</label>
                      <input type="text" placeholder="CITY" value={form.city}
                        onChange={(e) => setForm({ ...form, city: e.target.value })}
                        className={inputClass} />
                    </div>
                    <div className="space-y-2">
                      <label className={labelClass}>Postal Code</label>
                      <input type="text" placeholder="ZIP / POSTCODE" value={form.zip}
                        onChange={(e) => setForm({ ...form, zip: e.target.value })}
                        className={inputClass} />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className={labelClass}>Region / Shipping Mode</label>
                      <select value={form.region}
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
                    className="w-full bg-v6-accent text-white py-8 rounded-[2rem] font-black text-xs uppercase tracking-[0.4em] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl shadow-v6-accent/30 disabled:opacity-30 disabled:scale-100 flex items-center justify-center gap-4"
                  >
                    Review Order <ArrowRight size={18} />
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
                    className="flex items-center gap-2 opacity-40 hover:opacity-100 transition-opacity text-[10px] font-black uppercase tracking-widest"
                  >
                    <ChevronLeft size={16} /> Back to Shipping
                  </button>

                  <div className="space-y-4">
                    <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter">
                      Review & Pay<span className="v6-accent-text">.</span>
                    </h2>
                    <p className="opacity-40 text-[10px] font-black uppercase tracking-widest leading-relaxed">
                      Confirm your order then proceed to Fiuu secure payment.
                    </p>
                  </div>

                  {/* Delivery summary */}
                  <div className="bg-foreground/[0.06] border border-foreground/20 rounded-[2.5rem] p-10 space-y-4">
                    <p className="text-[8px] font-black opacity-50 uppercase tracking-widest mb-6">Delivery Details</p>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-xs">
                      <div>
                        <p className="opacity-40 text-[8px] font-black uppercase tracking-widest">Name</p>
                        <p className="font-black uppercase mt-1">{form.name}</p>
                      </div>
                      <div>
                        <p className="opacity-40 text-[8px] font-black uppercase tracking-widest">Phone</p>
                        <p className="font-black mt-1">{form.phone}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="opacity-40 text-[8px] font-black uppercase tracking-widest">Address</p>
                        <p className="font-black uppercase mt-1">{form.address}, {form.city}, {form.zip}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="opacity-40 text-[8px] font-black uppercase tracking-widest">Region</p>
                        <p className="font-black uppercase mt-1">{form.region}</p>
                      </div>
                    </div>
                  </div>

                  {/* Payment gateway info */}
                  <div className="bg-foreground/[0.06] border border-v6-accent/30 rounded-[2.5rem] p-10 space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-v6-accent/10 rounded-xl flex items-center justify-center">
                          <ShieldCheck size={20} className="v6-accent-text" />
                        </div>
                        <div>
                          <p className="text-xs font-black uppercase tracking-widest">Fiuu Secure Payment</p>
                          <p className="text-[8px] font-black opacity-40 uppercase tracking-widest mt-0.5">
                            FPX · Credit/Debit Card · e-Wallet
                          </p>
                        </div>
                      </div>
                      <a href="https://fiuu.com" target="_blank" rel="noopener noreferrer" className="opacity-30 hover:opacity-70 transition-opacity">
                        <ExternalLink size={14} />
                      </a>
                    </div>
                    <p className="text-[9px] font-black opacity-50 uppercase tracking-widest leading-relaxed">
                      You will be redirected to Fiuu&apos;s hosted payment page. All payment data is handled
                      exclusively by Fiuu (BNM-licensed). We never see your card details.
                    </p>
                  </div>

                  <div className="flex items-center gap-4 px-8 opacity-50">
                    <ShieldCheck size={16} />
                    <p className="text-[8px] font-black uppercase tracking-widest">
                      256-bit TLS · PCI DSS Compliant · BNM Licensed Gateway
                    </p>
                  </div>

                  <button
                    onClick={handleProceedToFiuu}
                    disabled={isProcessing}
                    className="w-full bg-foreground text-background py-8 rounded-[2rem] font-black text-xs uppercase tracking-[0.4em] hover:bg-v6-accent hover:text-white transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-4"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 size={18} className="animate-spin" /> Connecting to Fiuu...
                      </>
                    ) : (
                      <>
                        Proceed to Payment <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Cart Sidebar ── */}
          <div className="lg:col-span-5 space-y-12">
            <div className="bg-foreground/[0.06] border border-foreground/20 rounded-[3rem] p-10 sticky top-48">
              <div className="flex justify-between items-center mb-10 pb-6 border-b border-foreground/5">
                <h3 className="text-xl font-black italic uppercase tracking-tighter">Order Summary</h3>
                <span className="text-[10px] font-black bg-foreground/10 px-3 py-1 rounded-full">{cart.length} ITEMS</span>
              </div>

              <div className="space-y-8 mb-10 max-h-[40vh] overflow-y-auto pr-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between items-start gap-4">
                    <div className="flex gap-4">
                      <div className="w-16 h-16 bg-foreground/5 rounded-2xl flex items-center justify-center">
                        <Package size={24} className="opacity-20" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-black uppercase italic leading-tight">{item.name}</p>
                        <p className="text-[8px] font-black opacity-30 uppercase tracking-widest">
                          {item.deploymentId} × {item.quantity}
                        </p>
                        {step === 1 && (
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-[8px] font-black text-red-500 uppercase tracking-widest mt-2 hover:opacity-100 opacity-60"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-sm font-black italic">{item.price}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-4 pt-10 border-t border-foreground/5">
                <div className="flex justify-between items-center opacity-40">
                  <span className="text-[10px] font-black uppercase tracking-widest">Subtotal</span>
                  <span className="text-sm font-black italic">MYR {totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center opacity-40">
                  <span className="text-[10px] font-black uppercase tracking-widest">Logistics</span>
                  <span className="text-sm font-black italic">MYR {shippingFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center pt-4">
                  <span className="text-[10px] font-black uppercase tracking-widest v6-accent-text">Total</span>
                  <span className="text-3xl font-black italic tracking-tighter">MYR {grandTotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-12">
                <div className="flex items-center gap-3 p-4 bg-green-500/5 border border-green-500/10 rounded-2xl">
                  <ShieldCheck size={16} className="text-green-500" />
                  <p className="text-[8px] font-black text-green-500 uppercase tracking-widest">
                    Secure Fiuu Transaction
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
