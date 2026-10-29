import React, { useState } from 'react';
import { Bell, Globe, Radio, Shield, User as UserIcon, Check } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useIoT } from '../context/IoTContext';
import { useAuth } from '../context/AuthContext';
import { LanguageCode } from '../types';

interface HeaderProps {
  onOpenNotifications: () => void;
  onOpenProfile: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenNotifications,
  onOpenProfile
}) => {
  const { language, setLanguage, availableLanguages, t } = useLanguage();
  const { deviceStatus, notifications } = useIoT();
  const { user } = useAuth();
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur border-b border-forest-100 px-4 py-2.5 flex items-center justify-between shadow-xs">
      {/* Mobile Brand */}
      <div className="flex items-center gap-2.5 md:hidden">
        <img src="/logo.svg" alt="AgriCare" className="w-8 h-8" />
        <div className="flex flex-col">
          <span className="font-extrabold text-forest-900 text-lg leading-tight">
            Agri<span className="text-forest-600">Care</span>
          </span>
          <span className="text-[9px] text-gray-500 font-medium leading-none">
            Grow Smarter.
          </span>
        </div>
      </div>

      {/* Desktop Farm Quick Info */}
      <div className="hidden md:flex items-center gap-3 text-xs text-gray-600">
        <span className="font-semibold text-forest-950 flex items-center gap-1.5 bg-forest-50 px-2.5 py-1 rounded-full border border-forest-200/50">
          🌱 {user?.farm_name || 'AgriCare Farm'}
        </span>
        <span>•</span>
        <span>{user?.district || 'Coimbatore'}, {user?.state || 'Tamil Nadu'}</span>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2">
        {/* Device Status Badge */}
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
            deviceStatus.status === 'ONLINE'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
              : deviceStatus.status === 'DEMO'
              ? 'bg-amber-50 text-amber-900 border-amber-300'
              : 'bg-rose-50 text-rose-800 border-rose-300'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              deviceStatus.status === 'ONLINE'
                ? 'bg-emerald-500 animate-pulse'
                : deviceStatus.status === 'DEMO'
                ? 'bg-amber-500'
                : 'bg-rose-500'
            }`}
          />
          <span className="hidden sm:inline">
            {deviceStatus.status === 'ONLINE'
              ? 'ESP8266 Live'
              : deviceStatus.status === 'DEMO'
              ? 'Demo Simulation'
              : 'Disconnected'}
          </span>
          <span className="sm:hidden font-mono text-[10px]">
            {deviceStatus.status === 'ONLINE' ? 'LIVE' : 'DEMO'}
          </span>
        </div>

        {/* Multilingual Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setLangMenuOpen(!langMenuOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-gray-200 text-gray-700 hover:border-forest-400 bg-white text-xs font-medium transition-all"
            aria-label="Select Language"
          >
            <Globe size={14} className="text-forest-600" />
            <span className="font-semibold uppercase tracking-wider">{language}</span>
          </button>

          {langMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setLangMenuOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-forest-100 py-1.5 z-40 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider text-gray-400 border-b border-gray-100">
                  Select Language (7 Languages)
                </div>
                {availableLanguages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      setLanguage(l.code);
                      setLangMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2 text-xs text-left hover:bg-forest-50 transition-colors ${
                      language === l.code ? 'text-forest-800 font-bold bg-forest-50/60' : 'text-gray-700'
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{l.native}</span>
                      <span className="text-[10px] text-gray-400">{l.label}</span>
                    </div>
                    {language === l.code && <Check size={14} className="text-forest-600" />}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Notifications Bell */}
        <button
          onClick={onOpenNotifications}
          className="relative p-2 rounded-xl text-gray-600 hover:text-forest-800 hover:bg-forest-50 transition-colors border border-transparent hover:border-forest-200"
          aria-label="Notifications"
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center animate-bounce">
              {unreadCount}
            </span>
          )}
        </button>

        {/* User Profile Avatar */}
        <button
          onClick={onOpenProfile}
          className="w-8 h-8 rounded-full bg-forest-700 text-white font-bold text-xs flex items-center justify-center shadow-xs hover:ring-2 hover:ring-forest-300 transition-all shrink-0"
          title={user?.name || 'Farmer Profile'}
        >
          {user?.name ? user.name.charAt(0) : <UserIcon size={14} />}
        </button>
      </div>
    </header>
  );
};
