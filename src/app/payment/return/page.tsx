"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";
import { useCart } from "@/components/cart-provider";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { CheckCircle2, XCircle, Clock, Package } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

function ReturnContent() {
  const searchParams = useSearchParams();
  const { clearCart } = useCart();

  const status = searchParams.get("status");
  const orderId = searchParams.get("orderid");
  const tranID = searchParams.get("tranID");

  const isSuccess = status === "00";
  const isPending = status === "22";

  useEffect(() => {
    if (isSuccess) clearCart();
  }, [isSuccess, clearCart]);

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col selection:bg-v6-accent selection:text-white">
      <Header />
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-32">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          className="w-full max-w-lg text-center space-y-10"
        >
          {isSuccess ? (
            <div className="space-y-12">
              <div className="space-y-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="w-24 h-24 mx-auto bg-green-500/10 text-green-500 rounded-full flex items-center justify-center border border-green-500/20"
                >
                  <CheckCircle2 size={48} />
                </motion.div>
                <div className="space-y-2">
                  <h1 className="text-5xl md:text-6xl font-black italic uppercase tracking-tighter">
                    Authorized<span className="v6-accent-text">.</span>
                  </h1>
                  <p className="opacity-40 text-[10px] font-black uppercase tracking-[0.4em]">Logistics link confirmed</p>
                </div>
              </div>

              <div className="bg-foreground text-background rounded-[3rem] p-10 space-y-8 text-left relative overflow-hidden group shadow-2xl">
                {/* Laser Scan Animation */}
                <motion.div
                  animate={{ top: ["-10%", "110%"] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="absolute left-0 right-0 h-px bg-background opacity-10 z-0"
                />

                <div className="space-y-1 relative z-10">
                  <p className="text-[10px] font-black uppercase tracking-[0.5em] text-background/40">Physical Manifest Summary</p>
                  <h2 className="text-2xl font-black italic uppercase tracking-tighter text-background leading-none">Acquisition Secured</h2>
                </div>

                <div className="space-y-6 relative z-10">
                   <div className="grid grid-cols-1 gap-6">
                      <div className="space-y-1">
                        <p className="text-[8px] font-black opacity-30 text-background uppercase tracking-widest">Manifest_ID</p>
                        <p className="text-xl font-mono font-black tracking-widest text-background">{orderId ?? "UNASSIGNED"}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                         <div className="space-y-1">
                            <p className="text-[8px] font-black opacity-30 text-background uppercase tracking-widest">Network_Reference</p>
                            <p className="text-sm font-mono text-background/60 truncate">{tranID ?? "EXTERNAL_LINK"}</p>
                         </div>
                         <div className="space-y-1">
                            <p className="text-[8px] font-black opacity-30 text-background uppercase tracking-widest">Deployment_Status</p>
                            <p className="text-sm font-black text-v6-accent uppercase tracking-widest">SCHEDULED</p>
                         </div>
                      </div>
                   </div>

                   <div className="pt-8 border-t border-background/10 space-y-4">
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 rounded-2xl bg-background/5 border border-background/10 flex items-center justify-center">
                            <Package size={18} className="text-background opacity-30" />
                         </div>
                         <p className="text-[9px] font-bold text-background/50 uppercase tracking-widest leading-relaxed">
                            Artifacts are being physically retrieved from the vault and secured for deployment.
                         </p>
                      </div>
                   </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10 pt-4">
                <Link
                  href={`/tracking?id=${orderId}`}
                  className="bg-v6-accent text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:scale-105 transition-all shadow-xl shadow-v6-accent/20"
                >
                  Track Shipment
                </Link>
                <Link
                  href="/"
                  className="border border-foreground/10 px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-foreground/5 transition-all"
                >
                  Return to Hub
                </Link>
              </div>
            </div>
          ) : isPending ? (
            <>
              <div className="w-28 h-28 mx-auto bg-yellow-500/10 text-yellow-500 rounded-full flex items-center justify-center">
                <Clock size={56} />
              </div>
              <div className="space-y-3">
                <h1 className="text-5xl font-black italic uppercase tracking-tighter">
                  Pending<span className="v6-accent-text">.</span>
                </h1>
                <p className="opacity-50 text-sm font-medium leading-relaxed">
                  Payment is being processed. You will receive a confirmation email once verified.
                </p>
              </div>
              {orderId && (
                <div className="v6-surface border border-foreground/10 rounded-3xl p-8">
                  <p className="text-[8px] font-black opacity-30 uppercase tracking-widest mb-1">Order Reference</p>
                  <p className="text-xl font-mono font-black tracking-tighter">{orderId}</p>
                </div>
              )}
              <Link href="/" className="inline-block opacity-60 hover:opacity-100 transition-opacity text-xs font-black uppercase tracking-widest">
                Return to Hub
              </Link>
            </>
          ) : (
            <>
              <div className="w-28 h-28 mx-auto bg-red-500/10 text-red-500 rounded-full flex items-center justify-center">
                <XCircle size={56} />
              </div>
              <div className="space-y-3">
                <h1 className="text-5xl font-black italic uppercase tracking-tighter">
                  Failed<span className="v6-accent-text">.</span>
                </h1>
                <p className="opacity-50 text-sm font-medium leading-relaxed">
                  Payment was not completed. No charges have been made. Please try again.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/checkout"
                  className="bg-v6-accent text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:scale-105 transition-all shadow-xl shadow-v6-accent/20"
                >
                  Try Again
                </Link>
                <Link
                  href="/"
                  className="border border-foreground/10 px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-foreground/5 transition-all"
                >
                  Return to Hub
                </Link>
              </div>
            </>
          )}
        </motion.div>
      </div>
      <Footer />
    </main>
  );
}

export default function PaymentReturnPage() {
  return (
    <Suspense>
      <ReturnContent />
    </Suspense>
  );
}
