import React from 'react';
import { 
  Home, Stethoscope, Calendar, Activity, TrendingUp, Sparkles, 
  Droplet, Bot, MessageSquare, History, Bell, Settings, 
  HelpCircle, LogOut, ChevronLeft, ChevronRight, ShieldCheck, Radio
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useIoT } from '../context/IoTContext';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  activePage: string;
  setActivePage: (page: string) => void;
  collapsed: boolean;
  setCollapsed: (c: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activePage,
  setActivePage,
  collapsed,
  setCollapsed
}) => {
  const { t } = useLanguage();
  const { deviceStatus, isDemoMode } = useIoT();
  const { user, logout } = useAuth();

  const navItems = [
    { id: 'dashboard', label: t('nav_dashboard'), icon: Home },
    { id: 'doctor', label: t('nav_crop_doctor'), icon: Stethoscope },
    { id: 'calendar', label: t('nav_calendar'), icon: Calendar },
    { id: 'monitoring', label: t('nav_monitoring'), icon: Activity },
    { id: 'market', label: t('nav_market'), icon: TrendingUp },
    { id: 'yield', label: t('nav_yield'), icon: Sparkles },
    { id: 'irrigation', label: t('nav_irrigation'), icon: Droplet },
    { id: 'robot', label: t('nav_robot'), icon: Bot },
    { id: 'chatbot', label: t('nav_chatbot'), icon: MessageSquare },
    { id: 'history', label: t('nav_history'), icon: History },
    { id: 'notifications', label: t('nav_notifications'), icon: Bell },
    { id: 'settings', label: t('nav_settings'), icon: Settings },
    { id: 'help', label: t('nav_help'), icon: HelpCircle }
  ];

  return (
    <aside
      className={`hidden md:flex flex-col bg-white border-r border-forest-100 transition-all duration-300 z-30 select-none shadow-sm ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between p-4 border-b border-forest-100">
        <div className="flex items-center gap-3 overflow-hidden cursor-pointer" onClick={() => setActivePage('dashboard')}>
          <img src="/logo.svg" alt="AgriCare" className="w-10 h-10 shrink-0" />
          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-extrabold text-forest-900 tracking-tight text-xl leading-none">
                Agri<span className="text-forest-600">Care</span>
              </span>
              <span className="text-[10px] text-earth-800 font-medium tracking-wide mt-1 line-clamp-1">
                Grow Smarter. Farm Better.
              </span>
            </div>
          )}
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg text-gray-400 hover:text-forest-700 hover:bg-forest-50 transition-colors"
          title={collapsed ? 'Expand menu' : 'Collapse menu'}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Device Connection Status Widget */}
      {!collapsed ? (
        <div className="px-4 py-2.5 mx-3 mt-3 rounded-xl bg-forest-50/70 border border-forest-200/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                deviceStatus.status === 'ONLINE'
                  ? 'bg-emerald-500 animate-pulse'
                  : deviceStatus.status === 'DEMO'
                  ? 'bg-amber-500'
                  : 'bg-rose-500'
              }`}
            />
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-forest-950">
                {deviceStatus.status === 'ONLINE'
                  ? 'ESP8266 Live'
                  : deviceStatus.status === 'DEMO'
                  ? 'Simulator'
                  : 'Disconnected'}
              </span>
              <span className="text-[10px] text-gray-500 truncate max-w-[120px]">
                {deviceStatus.device_id}
              </span>
            </div>
          </div>
          <Radio size={14} className="text-forest-600 shrink-0" />
        </div>
      ) : (
        <div className="flex justify-center mt-3">
          <span
            className={`w-3 h-3 rounded-full ${
              deviceStatus.status === 'ONLINE' ? 'bg-emerald-500' : 'bg-amber-500'
            }`}
            title={`IoT Status: ${deviceStatus.status}`}
          />
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                isActive
                  ? 'bg-forest-700 text-white shadow-sm shadow-forest-800/20'
                  : 'text-gray-600 hover:text-forest-900 hover:bg-forest-50/80'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={19} className={`shrink-0 ${isActive ? 'text-white' : 'text-forest-700'}`} />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* User & Logout Footer */}
      <div className="p-3 border-t border-forest-100 flex flex-col gap-2">
        {!collapsed && user && (
          <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg bg-gray-50">
            <div className="w-8 h-8 rounded-full bg-forest-200 text-forest-900 font-bold flex items-center justify-center text-xs shrink-0">
              {user.name.charAt(0)}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-gray-900 truncate">{user.name}</span>
              <span className="text-[10px] text-gray-500 truncate">{user.district}, {user.state}</span>
            </div>
          </div>
        )}
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-semibold transition-colors"
          title={collapsed ? t('nav_logout') : undefined}
        >
          <LogOut size={16} className="shrink-0" />
          {!collapsed && <span>{t('nav_logout')}</span>}
        </button>
      </div>
    </aside>
  );
};
