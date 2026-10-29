import React, { useState } from 'react';
import { 
  Home, Stethoscope, Activity, Droplet, MoreHorizontal, 
  Bot, TrendingUp, Sparkles, Calendar, MessageSquare, History, Settings, HelpCircle, X 
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface BottomNavProps {
  activePage: string;
  setActivePage: (page: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activePage, setActivePage }) => {
  const { t } = useLanguage();
  const [moreOpen, setMoreOpen] = useState(false);

  const mainTabs = [
    { id: 'dashboard', label: t('nav_dashboard'), icon: Home },
    { id: 'doctor', label: t('nav_crop_doctor'), icon: Stethoscope },
    { id: 'monitoring', label: t('nav_monitoring'), icon: Activity },
    { id: 'irrigation', label: t('nav_irrigation'), icon: Droplet },
  ];

  const moreItems = [
    { id: 'calendar', label: t('nav_calendar'), icon: Calendar },
    { id: 'market', label: t('nav_market'), icon: TrendingUp },
    { id: 'yield', label: t('nav_yield'), icon: Sparkles },
    { id: 'robot', label: t('nav_robot'), icon: Bot },
    { id: 'chatbot', label: t('nav_chatbot'), icon: MessageSquare },
    { id: 'history', label: t('nav_history'), icon: History },
    { id: 'settings', label: t('nav_settings'), icon: Settings },
    { id: 'help', label: t('nav_help'), icon: HelpCircle }
  ];

  const handleSelect = (id: string) => {
    setActivePage(id);
    setMoreOpen(false);
  };

  return (
    <>
      {/* More Apps Sheet for Mobile */}
      {moreOpen && (
        <div className="fixed inset-0 z-40 md:hidden flex flex-col justify-end">
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMoreOpen(false)}
          />
          <div className="relative bg-white rounded-t-3xl p-5 pb-24 shadow-2xl z-50 border-t border-forest-100 animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <span className="text-sm font-bold text-forest-950 uppercase tracking-wider">
                All AgriCare Modules
              </span>
              <button 
                onClick={() => setMoreOpen(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400"
              >
                <X size={18} />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-3 pt-4">
              {moreItems.map((item) => {
                const Icon = item.icon;
                const isActive = activePage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item.id)}
                    className={`flex flex-col items-center gap-1.5 p-2.5 rounded-2xl transition-all ${
                      isActive ? 'bg-forest-100 text-forest-800' : 'text-gray-600 hover:bg-forest-50'
                    }`}
                  >
                    <div className={`p-2 rounded-xl ${isActive ? 'bg-forest-700 text-white' : 'bg-gray-100 text-forest-700'}`}>
                      <Icon size={20} />
                    </div>
                    <span className="text-[11px] font-medium text-center leading-tight line-clamp-1">
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-forest-100 px-2 py-1.5 flex items-center justify-around shadow-lg">
        {mainTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activePage === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleSelect(tab.id)}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all ${
                isActive ? 'text-forest-700 font-bold' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <div className={`p-1 rounded-xl transition-all ${isActive ? 'bg-forest-100' : ''}`}>
                <Icon size={20} className={isActive ? 'text-forest-700' : 'text-gray-500'} />
              </div>
              <span className="text-[10px] leading-none truncate max-w-[56px]">{tab.label}</span>
            </button>
          );
        })}

        {/* More Apps Trigger */}
        <button
          onClick={() => setMoreOpen(!moreOpen)}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all ${
            moreOpen || moreItems.some((i) => i.id === activePage) ? 'text-forest-700 font-bold' : 'text-gray-500'
          }`}
        >
          <div className="p-1 rounded-xl">
            <MoreHorizontal size={20} />
          </div>
          <span className="text-[10px] leading-none">More</span>
        </button>
      </nav>
    </>
  );
};
