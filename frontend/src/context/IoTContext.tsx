import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { DeviceStatus, TelemetryReading, AppNotification } from '../types';
import { fetchLatestTelemetry, sendHardwareCommand, isDemoModeActive, setDemoModeActive } from '../services/api';

interface IoTContextType {
  deviceStatus: DeviceStatus;
  reading: TelemetryReading | null;
  isPolling: boolean;
  isDemoMode: boolean;
  toggleDemoMode: (val: boolean) => void;
  pendingCommand: string | null;
  lastCommandResult: string | null;
  executeCommand: (cmd: string) => Promise<boolean>;
  notifications: AppNotification[];
  markNotificationRead: (id: number) => void;
  clearNotifications: () => void;
  refreshTelemetry: () => Promise<void>;
}

const IoTContext = createContext<IoTContextType | undefined>(undefined);

export const IoTProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [deviceStatus, setDeviceStatus] = useState<DeviceStatus>({
    status: 'DEMO',
    device_id: 'esp8266-01',
    connected: true,
    reading: {
      soil_raw: 520,
      moisture: 42.5,
      temperature: 28.4,
      humidity: 61.0,
      nitrogen: 45,
      phosphorus: 22,
      potassium: 110,
      water_open: false,
      medicine_open: false,
      auto_water: true
    }
  });

  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => isDemoModeActive());
  const [pendingCommand, setPendingCommand] = useState<string | null>(null);
  const [lastCommandResult, setLastCommandResult] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([
    {
      id: 1,
      type: 'SENSOR_ALERT',
      title: 'Optimal Moisture Maintained',
      message: 'Soil moisture is currently at 42.5% in Root Zone 1.',
      severity: 'info',
      read: false,
      created_at: new Date(Date.now() - 10 * 60000).toISOString()
    },
    {
      id: 2,
      type: 'VALVE_ACTION',
      title: 'Auto-Watering Armed',
      message: 'System will trigger 5-second pulse if moisture drops below 30%.',
      severity: 'info',
      read: false,
      created_at: new Date(Date.now() - 30 * 60000).toISOString()
    }
  ]);

  const refreshTelemetry = useCallback(async () => {
    try {
      const status = await fetchLatestTelemetry();
      setDeviceStatus(status);

      // Alert if moisture drops below critical 30%
      if (status.reading && status.reading.moisture !== null && status.reading.moisture < 30) {
        setNotifications((prev) => {
          if (prev.some((n) => n.title.includes('Critical Low Moisture'))) return prev;
          return [
            {
              id: Date.now(),
              type: 'SENSOR_ALERT',
              title: 'Critical Low Moisture (<30%)',
              message: `Soil moisture dropped to ${status.reading?.moisture}%. Water valve pulse engaged.`,
              severity: 'critical',
              read: false,
              created_at: new Date().toISOString()
            },
            ...prev
          ];
        });
      }
    } catch (e) {
      console.error('Telemetry refresh error:', e);
    }
  }, []);

  // Polling loop every 5 seconds (matching Arduino sketch cycle)
  useEffect(() => {
    refreshTelemetry();
    const interval = setInterval(refreshTelemetry, 5000);
    return () => clearInterval(interval);
  }, [refreshTelemetry]);

  const toggleDemoMode = (val: boolean) => {
    setIsDemoMode(val);
    setDemoModeActive(val);
    refreshTelemetry();
  };

  const executeCommand = async (cmd: string): Promise<boolean> => {
    setPendingCommand(cmd);
    setLastCommandResult('Command dispatched to cloud queue...');
    try {
      await sendHardwareCommand(cmd);
      setLastCommandResult(`Command '${cmd}' confirmed by hardware gateway.`);
      // Refresh telemetry right after sending command
      setTimeout(refreshTelemetry, 800);
      return true;
    } catch {
      setLastCommandResult(`Failed to dispatch '${cmd}'. Check network.`);
      return false;
    } finally {
      setTimeout(() => setPendingCommand(null), 1200);
    }
  };

  const markNotificationRead = (id: number) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <IoTContext.Provider
      value={{
        deviceStatus,
        reading: deviceStatus.reading,
        isPolling: true,
        isDemoMode,
        toggleDemoMode,
        pendingCommand,
        lastCommandResult,
        executeCommand,
        notifications,
        markNotificationRead,
        clearNotifications,
        refreshTelemetry
      }}
    >
      {children}
    </IoTContext.Provider>
  );
};

export const useIoT = () => {
  const context = useContext(IoTContext);
  if (!context) {
    throw new Error('useIoT must be used within an IoTProvider');
  }
  return context;
};
