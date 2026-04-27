import React, { useState, useEffect } from 'react';
import { Search, ShieldCheck, ShieldAlert, Loader2, FileSearch, Info, Database } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { verifyCertificate } from '../services/certificateService';
import { Certificate } from '../types';

interface VerifyPanelProps {
  initialId?: string;
}

export default function VerifyPanel({ initialId }: VerifyPanelProps) {
  const [certId, setCertId] = useState(initialId || '');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ valid: boolean; message: string; stored?: Certificate } | null>(null);

  useEffect(() => {
    if (initialId) {
      setCertId(initialId);
      performVerification(initialId);
    }
  }, [initialId]);

  const performVerification = async (id: string) => {
    if (!id.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await verifyCertificate(id);
      setResult(res);
    } catch (err) {
      setResult({ valid: false, message: 'An error occurred during verification.' });
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    performVerification(certId);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Certificate Verification
        </h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto">
          Enter the unique Certificate ID to verify its authenticity and integrity against the immutable blockchain ledger.
        </p>
      </div>

      <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-8 border border-slate-100">
        <form onSubmit={handleVerify} className="relative">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={certId}
              onChange={(e) => setCertId(e.target.value)}
              placeholder="Enter Certificate ID (e.g. jx7s9...)"
              className="w-full pl-12 pr-32 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all text-lg font-mono placeholder:text-slate-400"
            />
            <button
              type="submit"
              disabled={loading}
              className="absolute right-2 top-2 bottom-2 px-6 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify'}
            </button>
          </div>
        </form>

        <AnimatePresence mode="wait">
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mt-10"
            >
              {result.valid ? (
                <div className="space-y-6">
                  <div className="flex flex-col items-center gap-4 text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                      <ShieldCheck className="w-10 h-10" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-green-700">Verified Authentic</h3>
                      <p className="text-slate-500">This certificate is genuine and has not been tampered with.</p>
                    </div>
                  </div>

                  {result.stored && (
                    <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 space-y-4">
                      <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
                        <Info className="w-3.5 h-3.5" />
                        Ledger Record
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                        <InfoItem label="Recipient" value={result.stored.recipientName} />
                        <InfoItem label="Course" value={result.stored.courseName} />
                        <InfoItem label="Issuer" value={result.stored.issuerName} />
                        <InfoItem label="Issue Date" value={result.stored.issueDate} />
                      </div>
                      <div className="pt-4 border-t border-slate-200">
                        <label className="text-xs font-bold text-slate-400 uppercase block mb-1">Cryptographic Hash (SHA-256)</label>
                        <div className="bg-white p-3 rounded-lg border border-slate-200 break-all font-mono text-xs text-blue-600">
                          {result.stored.dataHash}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 pt-2">
                        <Database className="w-4 h-4 text-slate-300" />
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">Blockchain Verified Result</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4 text-center p-8 bg-red-50 rounded-3xl border border-red-100">
                  <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                    <ShieldAlert className="w-10 h-10" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-red-700">Verification Failed</h3>
                    <p className="text-red-600/80">{result.message}</p>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 opacity-60">
        <BenefitCard 
          icon={ShieldCheck} 
          title="Tamper-Proof" 
          desc="Hashing ensures any change to data voids the verification." 
        />
        <BenefitCard 
          icon={Database} 
          title="Decentralized" 
          desc="Stored on a distributed ledger for permanent availability." 
        />
        <BenefitCard 
          icon={FileSearch} 
          title="Instant Audit" 
          desc="Publicly verifiable credentials in seconds." 
        />
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="text-xs font-bold text-slate-400 uppercase block">{label}</label>
      <div className="text-slate-900 font-semibold">{value}</div>
    </div>
  );
}

function BenefitCard({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) {
  return (
    <div className="p-4 rounded-2xl bg-white border border-slate-100">
      <Icon className="w-6 h-6 text-blue-600 mb-2" />
      <h4 className="text-sm font-bold text-slate-900 mb-1">{title}</h4>
      <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
    </div>
  );
}
