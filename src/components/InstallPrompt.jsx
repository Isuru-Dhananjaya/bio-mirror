import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Monitor, Apple } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    if (window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstall = async () => {
    try {
      if (deferredPrompt) {
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          setDeferredPrompt(null);
        }
      } else {
        setShowManualModal(true);
      }
    } catch (e) {
      console.error('Install prompt error:', e);
      setShowManualModal(true);
    }
  };

  if (isInstalled) return null;

  return (
    <>
      <button
        onClick={handleInstall}
        className="ml-2 md:ml-8 flex items-center justify-center space-x-0 md:space-x-2 bg-cyber-cyan text-black border border-cyber-cyan p-2 md:px-5 md:py-2 rounded-lg font-black tracking-widest shadow-[0_0_15px_rgba(0,240,255,0.5)] hover:bg-white hover:border-white transition-all transform hover:-translate-y-0.5"
      >
        <Download size={16} />
        <span className="hidden md:inline text-xs uppercase">{t('install')}</span>
      </button>

      {/* Full-screen blocking overlay */}
      {showManualModal && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          style={{ zIndex: 99999 }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowManualModal(false); }}
        >
          <div
            className="relative w-full max-w-sm bg-[#07090f] border border-cyber-cyan/50 rounded-2xl shadow-[0_0_40px_rgba(0,240,255,0.2)] overflow-hidden"
            style={{ zIndex: 100000 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-cyber-cyan/20">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-cyber-cyan/10 rounded-lg border border-cyber-cyan/30">
                  <Download size={18} className="text-cyber-cyan" />
                </div>
                <div>
                  <h2 className="text-white font-black text-base tracking-widest uppercase">Install App</h2>
                  <p className="text-cyber-cyan text-[9px] font-mono tracking-widest">BIO-MIRROR EDGE AI</p>
                </div>
              </div>
              <button
                onClick={() => setShowManualModal(false)}
                className="p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Steps */}
            <div className="p-5 space-y-3">
              <p className="text-gray-400 text-xs font-mono text-center mb-4">
                No APK needed. Install directly as a native app:
              </p>

              {/* Android */}
              <div className="bg-[#0d1117] border border-gray-800 rounded-xl p-4 flex items-start space-x-3">
                <div className="shrink-0 mt-0.5">
                  <Smartphone size={16} className="text-green-400" />
                </div>
                <div>
                  <p className="text-white text-xs font-bold mb-1">Android (Chrome)</p>
                  <p className="text-gray-400 text-[11px] leading-relaxed">
                    Tap <span className="text-white font-bold">⋮</span> menu (top right) → select{' '}
                    <span className="text-cyber-cyan font-bold">"Add to Home screen"</span>
                  </p>
                </div>
              </div>

              {/* iOS */}
              <div className="bg-[#0d1117] border border-gray-800 rounded-xl p-4 flex items-start space-x-3">
                <div className="shrink-0 mt-0.5">
                  <Apple size={16} className="text-gray-300" />
                </div>
                <div>
                  <p className="text-white text-xs font-bold mb-1">iOS (Safari)</p>
                  <p className="text-gray-400 text-[11px] leading-relaxed">
                    Tap <span className="text-white font-bold">Share ⬆</span> button at the bottom → select{' '}
                    <span className="text-cyber-cyan font-bold">"Add to Home Screen"</span>
                  </p>
                </div>
              </div>

              {/* Desktop */}
              <div className="bg-[#0d1117] border border-gray-800 rounded-xl p-4 flex items-start space-x-3">
                <div className="shrink-0 mt-0.5">
                  <Monitor size={16} className="text-blue-400" />
                </div>
                <div>
                  <p className="text-white text-xs font-bold mb-1">Desktop (Chrome / Edge)</p>
                  <p className="text-gray-400 text-[11px] leading-relaxed">
                    Click the{' '}
                    <span className="text-cyber-cyan font-bold">install icon ⬇</span>
                    {' '}in the URL bar (next to the bookmark star)
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 pb-5">
              <button
                onClick={() => setShowManualModal(false)}
                className="w-full py-3 bg-cyber-cyan text-black font-black tracking-widest rounded-xl hover:bg-white transition-colors text-sm"
              >
                GOT IT ✓
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
