import React, { useState, useEffect } from 'react';
import { Download } from 'lucide-react';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
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
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  if (isInstalled || !deferredPrompt) return null;

  return (
    <button 
      onClick={handleInstall}
      className="flex items-center space-x-2 bg-cyber-cyan/20 text-cyber-cyan border border-cyber-cyan/50 px-4 py-1.5 rounded-full font-bold tracking-widest shadow-[0_0_10px_#00f0ff] hover:bg-cyber-cyan/40 hover:shadow-[0_0_15px_#00f0ff] animate-pulse transition-all"
    >
      <Download size={14} />
      <span className="text-[10px] hidden sm:inline">INSTALL</span>
    </button>
  );
}
