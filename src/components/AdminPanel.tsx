import React, { useState, useEffect } from 'react';
import { Award, Loader2, CheckCircle, AlertCircle, Send, Lock, LogIn } from 'lucide-react';
import { motion } from 'motion/react';
import { issueCertificate } from '../services/certificateService';
import { cn } from '../lib/utils';
import { auth } from '../lib/firebase';
import { onAuthStateChanged, User, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

interface AdminPanelProps {
  onIssued: () => void;
}

export default function AdminPanel({ onIssued }: AdminPanelProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    recipientName: '',
    courseName: '',
    issuerName: 'Global Certification Authority',
    issueDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await issueCertificate(
        formData.recipientName,
        formData.courseName,
        formData.issuerName,
        formData.issueDate
      );
      setSuccess(true);
      setTimeout(() => {
        onIssued();
      }, 2000);
    } catch (err) {
      setError('Failed to issue certificate. Only authorized administrators can record on the ledger.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
        <Loader2 className="w-8 h-8 animate-spin" />
        <p>Verifying credentials...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto text-center py-16 bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Restricted Access</h2>
        <p className="text-slate-500 mb-8 leading-relaxed">
          Issuing blockchain certificates requires administrative privileges. Please sign in to verify your authority.
        </p>
        <button
          onClick={handleLogin}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all cursor-pointer shadow-lg shadow-slate-200"
        >
          <LogIn className="w-5 h-5" />
          Sign in as Administrator
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 overflow-hidden border border-slate-100">
        <div className="p-8 border-b border-slate-50 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Award className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Issue New Certificate</h2>
              <p className="text-sm text-slate-500">Record a new credential on the immutable ledger</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Recipient Name</label>
              <input
                required
                type="text"
                value={formData.recipientName}
                onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                placeholder="John Doe"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Course / Award Name</label>
              <input
                required
                type="text"
                value={formData.courseName}
                onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
                placeholder="Blockchain Development"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Issuer Authority</label>
              <input
                required
                type="text"
                value={formData.issuerName}
                onChange={(e) => setFormData({ ...formData, issuerName: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Issue Date</label>
              <input
                required
                type="date"
                value={formData.issueDate}
                onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }} 
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 p-4 bg-red-50 text-red-700 rounded-xl text-sm border border-red-100"
            >
              <AlertCircle className="w-4 h-4" />
              {error}
            </motion.div>
          )}

          {success && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 p-4 bg-green-50 text-green-700 rounded-xl text-sm border border-green-100"
            >
              <CheckCircle className="w-4 h-4" />
              Certificate successfully hashed and recorded on the blockchain!
            </motion.div>
          )}

          <button
            type="submit"
            disabled={loading || success}
            className={cn(
              "w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all duration-200 cursor-pointer",
              loading || success
                ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200"
            )}
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : success ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <Send className="w-5 h-5" />
            )}
            {loading ? 'Hashing Data...' : success ? 'Recorded' : 'Issue Certificate'}
          </button>

          <p className="text-center text-xs text-slate-400 px-4">
            By issuing this certificate, a unique cryptographic SHA-256 hash will be generated from the data above and permanently recorded in the distributed ledger.
          </p>
        </form>
      </div>
    </div>
  );
}
