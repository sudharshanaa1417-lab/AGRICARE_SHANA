import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { PwaInstallBanner } from './components/PwaInstallBanner';

// Pages
import { Dashboard } from './pages/Dashboard';
import { AiCropDoctor } from './pages/AiCropDoctor';
import { CropCareCalendar } from './pages/CropCareCalendar';
import { RealTimeMonitoring } from './pages/RealTimeMonitoring';
import { MarketPrices } from './pages/MarketPrices';
import { YieldPrediction } from './pages/YieldPrediction';
import { IrrigationControl } from './pages/IrrigationControl';
import { SolarFieldRobot } from './pages/SolarFieldRobot';
import { AiVoiceChatbot } from './pages/AiVoiceChatbot';
import { HistoryReports } from './pages/HistoryReports';
import { Notifications } from './pages/Notifications';
import { Settings } from './pages/Settings';
import { HelpSupport } from './pages/HelpSupport';
import { AuthModal } from './pages/AuthModal';

import { useAuth } from './context/AuthContext';
import { useIoT } from './context/IoTContext';

export const App: React.FC = () => {
  const [activePage, setActivePage] = useState<string>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { openAuthModal } = useAuth();
  const { isDemoMode } = useIoT();

  const renderCurrentPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard onNavigate={setActivePage} />;
      case 'doctor':
        return <AiCropDoctor />;
      case 'calendar':
        return <CropCareCalendar />;
      case 'monitoring':
        return <RealTimeMonitoring />;
      case 'market':
        return <MarketPrices />;
      case 'yield':
        return <YieldPrediction />;
      case 'irrigation':
        return <IrrigationControl />;
      case 'robot':
        return <SolarFieldRobot />;
      case 'chatbot':
        return <AiVoiceChatbot />;
      case 'history':
        return <HistoryReports />;
      case 'notifications':
        return <Notifications />;
      case 'settings':
        return <Settings />;
      case 'help':
        return <HelpSupport />;
      default:
        return <Dashboard onNavigate={setActivePage} />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#f8faf8]">
      {/* Desktop Sidebar Navigation */}
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* PWA Install Notification Bar */}
        <PwaInstallBanner />

        {/* Global Demo Mode Warning Banner */}
        {isDemoMode && (
          <div className="bg-amber-500 text-amber-950 px-4 py-1 text-[11px] font-bold text-center border-b border-amber-600/40 flex items-center justify-center gap-2">
            <span>⚠️ DEMO / SIMULATION MODE ACTIVE: Simulating NodeMCU ESP8266 & AI model telemetry. Connect live hardware in Settings anytime.</span>
          </div>
        )}

        {/* Top Header */}
        <Header
          onOpenNotifications={() => setActivePage('notifications')}
          onOpenProfile={openAuthModal}
        />

        {/* Main Scrollable View */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-8 py-5">
          <div className="max-w-7xl mx-auto">
            {renderCurrentPage()}
          </div>
        </main>

        {/* Mobile-First Bottom Navigation Bar */}
        <BottomNav
          activePage={activePage}
          setActivePage={setActivePage}
        />

        {/* Auth / Profile Modal */}
        <AuthModal />
      </div>
    </div>
  );
};

export default App;
