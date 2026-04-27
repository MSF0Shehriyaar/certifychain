import React, { useState, useEffect } from 'react';
import { History, Box, ChevronRight, Hash, Clock, User, Award, Database, RefreshCw, Loader2, Copy, Check, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';
import { getAllCertificates } from '../services/certificateService';
import { Certificate } from '../types';
import { cn } from '../lib/utils';

interface BlockchainExplorerProps {
  onVerifyRequest?: (id: string) => void;
}

export default function BlockchainExplorer({ onVerifyRequest }: BlockchainExplorerProps) {
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchCerts = async () => {
    setLoading(true);
    try {
      const data = await getAllCertificates();
      setCerts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCerts();
  }, []);

  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Ledger Explorer</h2>
          <p className="text-slate-500">Real-time view of verified blocks on the chain</p>
        </div>
        <button 
          onClick={fetchCerts}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          Refresh Ledger
        </button>
      </div>

      <div className="space-y-4">
        {loading && certs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
            <Loader2 className="w-8 h-8 animate-spin" />
            <p>Syncing with ledger...</p>
          </div>
        ) : certs.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
            <Database className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">No records found on the blockchain yet.</p>
            <p className="text-slate-400 text-sm">Issue your first certificate to see it here.</p>
          </div>
        ) : (
          certs.map((cert, index) => (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              key={cert.id}
              className="group relative"
            >
              <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col md:flex-row gap-6 hover:shadow-lg hover:border-blue-200 transition-all">
                {/* Block Info */}
                <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl border border-slate-100 min-w-[120px]">
                  <Box className={cn("w-8 h-8 mb-2", index === 0 ? "text-blue-600" : "text-slate-400")} />
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Block</span>
                  <span className="font-mono text-lg font-bold text-slate-700">#{certs.length - index}</span>
                </div>

                {/* Certificate Data */}
                <div className="flex-1 space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-50 pb-2">
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-semibold text-slate-700">{cert.recipientName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-500">
                        <Award className="w-4 h-4 text-slate-400" />
                        <span className="text-sm">{cert.courseName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400">
                        <Clock className="w-4 h-4" />
                        <span className="text-xs">{new Date(cert.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-2 md:mt-0">
                      <div className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-lg border border-blue-100 max-w-[200px]">
                        <span className="text-[10px] font-bold text-blue-400 uppercase mr-1">ID:</span>
                        <span className="font-mono text-[10px] text-blue-700 truncate">{cert.id}</span>
                        <button 
                          onClick={() => handleCopy(cert.id)}
                          className="p-1 hover:bg-blue-100 rounded text-blue-600 transition-colors cursor-pointer"
                          title="Copy Certificate ID"
                        >
                          {copiedId === cert.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                      {onVerifyRequest && (
                        <button 
                          onClick={() => onVerifyRequest(cert.id)}
                          className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer shadow-sm"
                          title="Verify Now"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <Hash className="w-3 h-3" />
                        Current Hash
                      </div>
                      <div className="bg-slate-50 px-3 py-1.5 rounded-lg font-mono text-[10px] text-blue-600 truncate border border-slate-100 group-hover:bg-blue-50/30 transition-colors">
                        {cert.dataHash}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <Database className="w-3 h-3 text-slate-300" />
                        Previous Hash
                      </div>
                      <div className="bg-slate-50 px-3 py-1.5 rounded-lg font-mono text-[10px] text-slate-500 truncate border border-slate-100 italic">
                        {cert.prevHash}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Connector line */}
              {index < certs.length - 1 && (
                <div className="absolute left-[75px] bottom-[-24px] w-[2px] h-[24px] bg-slate-200 z-0" />
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
