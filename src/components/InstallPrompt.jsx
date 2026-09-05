import React, { useState, useEffect } from 'react';
import { Download, X, Info } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    // Check if already installed
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
      console.error("Install prompt error:", e);
      setShowManualModal(true);
    }
  };

  // If the app is already installed and running in standalone mode, hide the button.
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

      {showManualModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#0a0f1a] border border-cyber-cyan/50 p-6 rounded-2xl shadow-[0_0_30px_rgba(0,240,255,0.2)] max-w-sm w-full relative animate-fade-in">
            <button 
              onClick={() => setShowManualModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <X size={20} />
            </button>
            
            <div className="flex items-center space-x-3 mb-4">
              <Info className="text-cyber-cyan" size={24} />
              <h2 className="text-white font-black text-lg tracking-widest uppercase">Install Bio-Mirror</h2>
            </div>
            
            <p className="text-gray-300 text-xs md:text-sm mb-4 leading-relaxed font-mono">
              Your browser requires manual installation for this Web App. You do NOT need an APK file.
            </p>

            <div className="space-y-4 font-mono text-xs text-gray-400">
              <div className="bg-black/50 p-3 rounded-lg border border-gray-800">
                <span className="text-white font-bold block mb-1">📱 Android (Chrome)</span>
                Tap the 3-dots menu (⋮) in the top right corner and select <span className="text-cyber-cyan font-bold">"Add to Home screen"</span>.
              </div>
              
              <div className="bg-black/50 p-3 rounded-lg border border-gray-800">
                <span className="text-white font-bold block mb-1">🍎 iOS (Safari)</span>
                Tap the Share button at the bottom and select <span className="text-cyber-cyan font-bold">"Add to Home Screen"</span>.
              </div>

              <div className="bg-black/50 p-3 rounded-lg border border-gray-800">
                <span className="text-white font-bold block mb-1">💻 Desktop (Chrome/Edge)</span>
                Click the installation icon in the URL bar (near the bookmark star).
              </div>
            </div>

            <button 
              onClick={() => setShowManualModal(false)}
              className="mt-6 w-full py-3 bg-cyber-cyan/10 border border-cyber-cyan/30 text-cyber-cyan hover:bg-cyber-cyan/30 transition-colors font-bold tracking-widest rounded-lg text-sm"
            >
              GOT IT
            </button>
          </div>
        </div>
      )}
    </>
  );
}
