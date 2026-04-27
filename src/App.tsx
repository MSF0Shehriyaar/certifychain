import React, { useState, useEffect } from 'react';
import { Shield, FileCheck, History, Menu, X, Award, Database, LogIn, LogOut, User as UserIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { auth } from './lib/firebase';
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import AdminPanel from './components/AdminPanel';
import VerifyPanel from './components/VerifyPanel';
import BlockchainExplorer from './components/BlockchainExplorer';

type View = 'verify' | 'issue' | 'explorer';

export default function App() {
  const [activeView, setActiveView] = useState<View>('verify');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [prefilledId, setPrefilledId] = useState<string | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  const handleVerifyRequest = (id: string) => {
    setPrefilledId(id);
    setActiveView('verify');
  };

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error(err);
    }
  };

  const navItems = [
    { id: 'verify', label: 'Verify Certificate', icon: FileCheck },
    { id: 'issue', label: 'Issue Certificate', icon: Award },
    { id: 'explorer', label: 'Ledger Explorer', icon: History },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -right-[10%] w-[40%] h-[40%] rounded-full bg-blue-100/50 blur-3xl opacity-50" />
        <div className="absolute top-[60%] -left-[5%] w-[30%] h-[30%] rounded-full bg-indigo-100/50 blur-3xl opacity-50" />
      </div>

      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">CertifyChain</span>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveView(item.id as View)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer",
                      activeView === item.id
                        ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                        : "text-slate-600 hover:bg-slate-100"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </button>
                );
              })}
              
              <div className="h-6 w-px bg-slate-200 mx-2" />

              {user ? (
                <div className="flex items-center gap-3 pl-2">
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Issue Access</span>
                    <span className="text-xs font-semibold text-slate-600 truncate max-w-[120px]">{user.displayName || user.email}</span>
                  </div>
                  <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-red-500 transition-colors cursor-pointer">
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleLogin}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-full text-sm font-medium hover:bg-slate-800 transition-all cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  Admin Login
                </button>
              )}
            </div>

            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-md text-slate-600 cursor-pointer"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-slate-200 bg-white overflow-hidden"
            >
              <div className="px-2 pt-2 pb-3 space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveView(item.id as View);
                        setIsMobileMenuOpen(false);
                      }}
                      className={cn(
                        "flex items-center gap-3 w-full px-4 py-3 rounded-lg text-base font-medium cursor-pointer",
                        activeView === item.id
                          ? "bg-blue-50 text-blue-700"
                          : "text-slate-600 hover:bg-slate-50"
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      {item.label}
                    </button>
                  );
                })}
                
                <div className="pt-4 pb-2 border-t border-slate-100 mt-4 mx-2">
                  {user ? (
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-base font-medium text-red-600 bg-red-50"
                    >
                      <LogOut className="w-5 h-5" />
                      Sign Out ({user.displayName || 'Admin'})
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        handleLogin();
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-base font-medium text-white bg-slate-900 shadow-md shadow-slate-200"
                    >
                      <LogIn className="w-5 h-5" />
                      Admin Login
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeView === 'verify' && <VerifyPanel initialId={prefilledId} />}
            {activeView === 'issue' && <AdminPanel onIssued={() => setActiveView('explorer')} />}
            {activeView === 'explorer' && <BlockchainExplorer onVerifyRequest={handleVerifyRequest} />}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="py-12 border-t border-slate-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 text-slate-400 text-sm">
            <Database className="w-4 h-4" />
            <span>Immutable Ledger Verification System</span>
          </div>
          <p className="mt-2 text-slate-400 text-xs">
            Powered by Cryptographic Hashing & Decentralized Principles
          </p>
        </div>
      </footer>
    </div>
  );
}
