import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

export const PwaInstallBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  if (!showBanner) return null;

  return (
    <div className="bg-forest-900 text-white px-4 py-2.5 flex items-center justify-between text-xs font-medium shadow-md">
      <div className="flex items-center gap-2.5">
        <img src="/logo.svg" alt="AgriCare" className="w-5 h-5" />
        <span>Install AgriCare PWA app for instant offline access in your field!</span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={handleInstall}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500 hover:bg-emerald-600 text-forest-950 font-bold text-[11px] transition-colors"
        >
          <Download size={13} />
          Install
        </button>
        <button
          onClick={() => setShowBanner(false)}
          className="p-1 rounded-full text-white/70 hover:text-white"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
};
