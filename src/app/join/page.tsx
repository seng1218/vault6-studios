"use client";

import React, { useState } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";

export default function JoinPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />
      
      <div className="flex-1 flex items-center justify-center pt-48 pb-32 px-6">
        <div className="max-w-xl w-full">
          <div className="bg-foreground/[0.02] border border-foreground/10 rounded-[3rem] p-8 md:p-16 backdrop-blur-xl shadow-2xl relative overflow-hidden">
            
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-v6-accent/10 rounded-full blur-[100px]" />

            <div className="relative z-10">
              <div className="text-center mb-12 space-y-4">
                <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter">JOIN US</h1>
                <p className="opacity-60">Create an account to get early access to new releases, special discounts, and manage your orders easily.</p>
              </div>

              {submitted ? (
                <div className="text-center py-12 space-y-4">
                  <div className="w-16 h-16 bg-v6-accent/20 text-v6-accent rounded-full flex items-center justify-center mx-auto mb-6">
                    <Star size={32} />
                  </div>
                  <h3 className="text-2xl font-black uppercase">Welcome Aboard</h3>
                  <p className="opacity-60 pb-8">Check your email to verify your account and complete setup.</p>
                  <Link href="/" className="text-xs font-black uppercase tracking-widest text-v6-accent hover:text-foreground transition-colors">
                    Return Home
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4">Full Name</label>
                      <input 
                        type="text" 
                        required
                        className="w-full mt-2 bg-background/50 border border-foreground/10 rounded-2xl px-6 py-4 font-medium focus:outline-none focus:border-v6-accent transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4">Email Address</label>
                      <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full mt-2 bg-background/50 border border-foreground/10 rounded-2xl px-6 py-4 font-medium focus:outline-none focus:border-v6-accent transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-widest opacity-40 ml-4">Password</label>
                      <input 
                        type="password" 
                        required
                        className="w-full mt-2 bg-background/50 border border-foreground/10 rounded-2xl px-6 py-4 font-medium focus:outline-none focus:border-v6-accent transition-all"
                      />
                    </div>
                  </div>

                  <button type="submit" className="w-full bg-v6-accent text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-foreground hover:text-background transition-all flex justify-center items-center gap-2 mt-8">
                    Create Account <ArrowRight size={16} />
                  </button>
                </form>
              )}

              <div className="mt-8 text-center">
                <p className="text-xs opacity-40 font-medium">
                  Already have an account? <Link href="/login" className="text-v6-accent hover:text-foreground font-black transition-colors">Login here</Link>
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
