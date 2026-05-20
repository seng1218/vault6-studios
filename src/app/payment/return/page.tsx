"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";
import { useCart } from "@/components/cart-provider";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { CheckCircle2, XCircle, Clock } from "lucide-react";
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
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 20 }}
                className="w-28 h-28 mx-auto bg-green-500/10 text-green-500 rounded-full flex items-center justify-center"
              >
                <CheckCircle2 size={56} />
              </motion.div>
              <div className="space-y-3">
                <h1 className="text-5xl font-black italic uppercase tracking-tighter">
                  Authorized<span className="v6-accent-text">.</span>
                </h1>
                <p className="opacity-50 text-sm font-medium leading-relaxed">
                  Payment confirmed. Your artifacts are secured and scheduled for deployment.
                </p>
              </div>
              <div className="bg-foreground/[0.03] border border-foreground/10 rounded-3xl p-8 space-y-4 text-left">
                <div>
                  <p className="text-[8px] font-black opacity-30 uppercase tracking-widest mb-1">Deployment ID</p>
                  <p className="text-xl font-mono font-black tracking-tighter">{orderId ?? "—"}</p>
                </div>
                {tranID && (
                  <div>
                    <p className="text-[8px] font-black opacity-30 uppercase tracking-widest mb-1">Transaction Reference</p>
                    <p className="text-sm font-mono opacity-60">{tranID}</p>
                  </div>
                )}
              </div>
              <Link
                href="/"
                className="inline-block bg-v6-accent text-white px-12 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:scale-105 transition-all shadow-xl shadow-v6-accent/20"
              >
                Return to Hub
              </Link>
            </>
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
                <div className="bg-foreground/[0.03] border border-foreground/10 rounded-3xl p-8">
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
