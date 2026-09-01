import React, { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const { t } = useLanguage();

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
      className="ml-4 md:ml-8 flex items-center space-x-2 bg-cyber-cyan text-black border border-cyber-cyan px-3 md:px-5 py-2 rounded-lg font-black tracking-widest shadow-[0_0_15px_rgba(0,240,255,0.5)] hover:bg-white hover:border-white hover:shadow-[0_0_25px_rgba(255,255,255,0.8)] animate-pulse hover:animate-none transition-all transform hover:-translate-y-0.5"
    >
      <Download size={16} />
      <span className="text-[9px] md:text-xs uppercase">{t('install')}</span>
    </button>
  );
}
