"use client";

import React, { useState, useMemo } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { useCart } from "@/components/cart-provider";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Truck, CreditCard, ArrowRight, Trash2, ChevronLeft, Package, CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";
import { createOrder } from "@/app/actions/order-actions";

const REGIONS = [
  { label: "PENINSULAR MALAYSIA", fee: 5 },
  { label: "EAST MALAYSIA (SABAH/SARAWAK)", fee: 10 },
  { label: "INTERNATIONAL", fee: 30 },
];

export default function CheckoutPage() {
  const { cart, removeFromCart, totalPrice, clearCart } = useCart();
  const [step, setStep] = useState(1); // 1: Shipping, 2: Payment, 3: Success
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    address: "",
    city: "",
    zip: "",
    region: "PENINSULAR MALAYSIA"
  });

  const shippingFee = useMemo(() => {
    const region = REGIONS.find(r => r.label === form.region);
    return region ? region.fee : 0;
  }, [form.region]);

  const grandTotal = totalPrice + shippingFee;

  const handleNext = () => setStep(prev => prev + 1);
  const handlePrev = () => setStep(prev => prev - 1);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    const orderData = {
      customerName: form.name,
      customerEmail: form.email,
      address: form.address,
      city: form.city,
      state: form.region,
      zip: form.zip,
      country: form.region === "INTERNATIONAL" ? "INTERNATIONAL" : "MALAYSIA",
      subtotal: totalPrice,
      shipping: shippingFee,
      total: grandTotal,
      items: cart.map(item => ({
        artifactId: item.deploymentId,
        artifactName: item.name,
        price: parseFloat(item.price.replace(/[^0-9.]/g, "")),
        quantity: item.quantity,
      }))
    };

    const result = await createOrder(orderData);

    if (result.success && result.data) {
      setOrderId(result.data.orderNumber);
      setStep(3);
      clearCart();
    } else {
      alert("Failed to process order. Please try again.");
    }
    
    setIsProcessing(false);
  };

  const isFormValid = form.name && form.email && form.address && form.city && form.zip;

  if (cart.length === 0 && step !== 3) {
    return (
      <main className="min-h-screen bg-background text-foreground flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-8">
           <div className="w-24 h-24 bg-foreground/5 rounded-full flex items-center justify-center opacity-20">
              <Package size={48} />
           </div>
           <div className="text-center space-y-2">
             <h2 className="text-3xl font-black italic uppercase tracking-tighter">Your cart is empty</h2>
             <p className="opacity-40 text-[10px] font-black uppercase tracking-widest">No artifacts scheduled for deployment</p>
           </div>
           <Link href="/collection" className="bg-v6-accent text-white px-12 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:scale-105 transition-all shadow-xl shadow-v6-accent/20">
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
        {step !== 3 && (
          <div className="flex items-center gap-4 mb-12 opacity-40">
             <div className={`flex items-center gap-2 ${step >= 1 ? 'text-v6-accent opacity-100' : ''}`}>
                <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-[10px] font-black">1</span>
                <span className="text-[10px] font-black uppercase tracking-widest">Shipping</span>
             </div>
             <div className="w-12 h-px bg-current opacity-20" />
             <div className={`flex items-center gap-2 ${step >= 2 ? 'text-v6-accent opacity-100' : ''}`}>
                <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-[10px] font-black">2</span>
                <span className="text-[10px] font-black uppercase tracking-widest">Payment</span>
             </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          
          {/* Main Flow */}
          <div className="lg:col-span-7 space-y-12">
             <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="space-y-12"
                  >
                    <div className="space-y-4">
                       <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter">Shipping Info<span className="v6-accent-text">.</span></h2>
                       <p className="opacity-40 text-[10px] font-black uppercase tracking-widest leading-relaxed">Where should we deliver your artifacts?</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <label className="text-[8px] font-black opacity-30 uppercase tracking-widest ml-4">Full Name</label>
                          <input 
                            type="text" 
                            placeholder="OPERATIVE NAME"
                            value={form.name}
                            onChange={e => setForm({...form, name: e.target.value})}
                            className="w-full bg-foreground/[0.03] border border-foreground/10 rounded-2xl p-6 text-xs font-black tracking-widest focus:border-v6-accent outline-none transition-all uppercase"
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[8px] font-black opacity-30 uppercase tracking-widest ml-4">Email Address</label>
                          <input 
                            type="email" 
                            placeholder="COMMUNICATION HUB"
                            value={form.email}
                            onChange={e => setForm({...form, email: e.target.value})}
                            className="w-full bg-foreground/[0.03] border border-foreground/10 rounded-2xl p-6 text-xs font-black tracking-widest focus:border-v6-accent outline-none transition-all uppercase"
                          />
                       </div>
                       <div className="md:col-span-2 space-y-2">
                          <label className="text-[8px] font-black opacity-30 uppercase tracking-widest ml-4">Street Address</label>
                          <input 
                            type="text" 
                            placeholder="DESTINATION COORDINATES"
                            value={form.address}
                            onChange={e => setForm({...form, address: e.target.value})}
                            className="w-full bg-foreground/[0.03] border border-foreground/10 rounded-2xl p-6 text-xs font-black tracking-widest focus:border-v6-accent outline-none transition-all uppercase"
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[8px] font-black opacity-30 uppercase tracking-widest ml-4">City</label>
                          <input 
                            type="text" 
                            placeholder="CITY"
                            value={form.city}
                            onChange={e => setForm({...form, city: e.target.value})}
                            className="w-full bg-foreground/[0.03] border border-foreground/10 rounded-2xl p-6 text-xs font-black tracking-widest focus:border-v6-accent outline-none transition-all uppercase"
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[8px] font-black opacity-30 uppercase tracking-widest ml-4">Postal Code</label>
                          <input 
                            type="text" 
                            placeholder="ZIP / POSTCODE"
                            value={form.zip}
                            onChange={e => setForm({...form, zip: e.target.value})}
                            className="w-full bg-foreground/[0.03] border border-foreground/10 rounded-2xl p-6 text-xs font-black tracking-widest focus:border-v6-accent outline-none transition-all uppercase"
                          />
                       </div>
                       <div className="md:col-span-2 space-y-2">
                          <label className="text-[8px] font-black opacity-30 uppercase tracking-widest ml-4">Region / Shipping Mode</label>
                          <select 
                            value={form.region}
                            onChange={e => setForm({...form, region: e.target.value})}
                            className="w-full bg-foreground/[0.03] border border-foreground/10 rounded-2xl p-6 text-xs font-black tracking-widest focus:border-v6-accent outline-none transition-all uppercase appearance-none cursor-pointer"
                          >
                            {REGIONS.map(region => (
                              <option key={region.label} value={region.label}>{region.label} (+${region.fee})</option>
                            ))}
                          </select>
                       </div>
                    </div>

                    <button 
                      onClick={handleNext}
                      disabled={!isFormValid}
                      className="w-full bg-v6-accent text-white py-8 rounded-[2rem] font-black text-xs uppercase tracking-[0.4em] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl shadow-v6-accent/30 disabled:opacity-30 disabled:scale-100 flex items-center justify-center gap-4"
                    >
                      PROCEED TO PAYMENT <ArrowRight size={18} />
                    </button>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-12"
                  >
                    <button onClick={handlePrev} className="flex items-center gap-2 opacity-40 hover:opacity-100 transition-opacity text-[10px] font-black uppercase tracking-widest">
                       <ChevronLeft size={16} /> Back to Shipping
                    </button>

                    <div className="space-y-4">
                       <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter">Payment Mode<span className="v6-accent-text">.</span></h2>
                       <p className="opacity-40 text-[10px] font-black uppercase tracking-widest leading-relaxed">Secured via Razorpay Curlec Gateway (SIMULATED)</p>
                    </div>

                    <form onSubmit={handlePayment} className="space-y-8">
                       <div className="bg-foreground/[0.03] border border-v6-accent/20 rounded-[2.5rem] p-10 space-y-8">
                          <div className="flex items-center justify-between opacity-60">
                             <div className="flex items-center gap-4">
                                <CreditCard size={24} className="v6-accent-text" />
                                <span className="text-xs font-black uppercase tracking-widest">Debit / Credit Card</span>
                             </div>
                             <div className="flex gap-2">
                                <div className="w-8 h-5 bg-foreground/10 rounded" />
                                <div className="w-8 h-5 bg-foreground/10 rounded" />
                             </div>
                          </div>

                          <div className="space-y-6">
                             <div className="space-y-2">
                                <label className="text-[8px] font-black opacity-30 uppercase tracking-widest ml-4">Card Number</label>
                                <input type="text" placeholder="XXXX XXXX XXXX XXXX" className="w-full bg-background border border-foreground/10 rounded-2xl p-6 text-xs font-black tracking-[0.3em] outline-none" required />
                             </div>
                             <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                   <label className="text-[8px] font-black opacity-30 uppercase tracking-widest ml-4">Expiry Date</label>
                                   <input type="text" placeholder="MM / YY" className="w-full bg-background border border-foreground/10 rounded-2xl p-6 text-xs font-black tracking-widest outline-none" required />
                                </div>
                                <div className="space-y-2">
                                   <label className="text-[8px] font-black opacity-30 uppercase tracking-widest ml-4">CVV</label>
                                   <input type="text" placeholder="***" className="w-full bg-background border border-foreground/10 rounded-2xl p-6 text-xs font-black tracking-widest outline-none" required />
                                </div>
                             </div>
                          </div>
                       </div>

                       <div className="flex items-center gap-4 px-8 opacity-30">
                          <ShieldCheck size={20} />
                          <p className="text-[8px] font-black uppercase tracking-widest">End-to-End Encryption Enabled // Payment Server 01-MALAYSIA</p>
                       </div>

                       <button 
                        type="submit"
                        disabled={isProcessing}
                        className="w-full bg-foreground text-background py-8 rounded-[2rem] font-black text-xs uppercase tracking-[0.4em] hover:bg-v6-accent hover:text-white transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-4"
                       >
                        {isProcessing ? (
                          <>
                            <Loader2 size={18} className="animate-spin" /> AUTHORIZING...
                          </>
                        ) : (
                          "AUTHORIZE DEPLOYMENT"
                        )}
                       </button>
                    </form>
                  </motion.div>
                )}

                {step === 3 && (
                   <motion.div
                    key="step3"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center text-center space-y-8 py-12"
                   >
                      <div className="w-32 h-32 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center animate-bounce">
                         <CheckCircle2 size={64} />
                      </div>
                      <div className="space-y-4">
                         <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter">Success<span className="v6-accent-text">.</span></h2>
                         <p className="opacity-60 max-w-sm mx-auto text-sm font-medium">Your artifacts have been secured and scheduled for deployment. Check your hub for a confirmation transmission.</p>
                      </div>
                      <div className="bg-foreground/[0.03] border border-foreground/10 rounded-3xl p-8 w-full max-w-sm">
                         <p className="text-[8px] font-black opacity-30 uppercase tracking-widest mb-4">DEPLOYMENT_ID</p>
                         <p className="text-2xl font-mono font-black tracking-tighter uppercase">{orderId || "V6-TX-XXXXXX"}</p>
                      </div>
                      <Link href="/" className="bg-v6-accent text-white px-12 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:scale-105 transition-all shadow-xl shadow-v6-accent/20">
                         Return to Hub
                      </Link>
                   </motion.div>
                )}
             </AnimatePresence>
          </div>

          {/* Cart Sidebar */}
          {step !== 3 && (
            <div className="lg:col-span-5 space-y-12">
               <div className="bg-foreground/[0.03] border border-foreground/10 rounded-[3rem] p-10 sticky top-48">
                  <div className="flex justify-between items-center mb-10 pb-6 border-b border-foreground/5">
                     <h3 className="text-xl font-black italic uppercase tracking-tighter">Order Summary</h3>
                     <span className="text-[10px] font-black bg-foreground/10 px-3 py-1 rounded-full">{cart.length} ITEMS</span>
                  </div>

                  <div className="space-y-8 mb-10 max-h-[40vh] overflow-y-auto pr-4 scrollbar-hide">
                     {cart.map((item) => (
                        <div key={item.id} className="flex justify-between items-start gap-4">
                           <div className="flex gap-4">
                              <div className="w-16 h-16 bg-foreground/5 rounded-2xl flex items-center justify-center">
                                 <Package size={24} className="opacity-20" />
                              </div>
                              <div className="space-y-1">
                                 <p className="text-xs font-black uppercase italic leading-tight">{item.name}</p>
                                 <p className="text-[8px] font-black opacity-30 uppercase tracking-widest">{item.deploymentId} x {item.quantity}</p>
                                 <button 
                                  onClick={() => removeFromCart(item.id)}
                                  className="text-[8px] font-black text-red-500 uppercase tracking-widest mt-2 hover:opacity-100 opacity-60"
                                 >
                                    Remove
                                 </button>
                              </div>
                           </div>
                           <p className="text-sm font-black italic">{item.price}</p>
                        </div>
                     ))}
                  </div>

                  <div className="space-y-4 pt-10 border-t border-foreground/5">
                     <div className="flex justify-between items-center opacity-40">
                        <span className="text-[10px] font-black uppercase tracking-widest">Subtotal</span>
                        <span className="text-sm font-black italic">${totalPrice.toFixed(2)}</span>
                     </div>
                     <div className="flex justify-between items-center opacity-40">
                        <span className="text-[10px] font-black uppercase tracking-widest">Logistics</span>
                        <span className="text-sm font-black italic">${shippingFee.toFixed(2)}</span>
                     </div>
                     <div className="flex justify-between items-center pt-4">
                        <span className="text-[10px] font-black uppercase tracking-widest v6-accent-text">Total Cost</span>
                        <span className="text-3xl font-black italic tracking-tighter">${grandTotal.toFixed(2)}</span>
                     </div>
                  </div>

                  <div className="mt-12 space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-green-500/5 border border-green-500/10 rounded-2xl">
                       <ShieldCheck size={16} className="text-green-500" />
                       <p className="text-[8px] font-black text-green-500 uppercase tracking-widest">Secure Syndicate Transaction</p>
                    </div>
                  </div>
               </div>
            </div>
          )}

        </div>
      </div>

      <Footer />
    </main>
  );
}
