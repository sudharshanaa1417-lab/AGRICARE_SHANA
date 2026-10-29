import React, { useState } from 'react';
import { 
  Droplet, AlertTriangle, ShieldAlert, CheckCircle2, 
  Clock, Zap, Power, Radio, RefreshCw 
} from 'lucide-react';
import { useIoT } from '../context/IoTContext';
import { ConfirmationModal } from '../components/ConfirmationModal';

export const IrrigationControl: React.FC = () => {
  const { deviceStatus, reading, executeCommand, pendingCommand, lastCommandResult } = useIoT();
  const [modalConfig, setModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel: string;
    isDestructive: boolean;
    actionCmd: string;
  }>({
    isOpen: false,
    title: '',
    message: '',
    confirmLabel: '',
    isDestructive: false,
    actionCmd: ''
  });

  const isConnected = deviceStatus.connected || deviceStatus.status === 'DEMO';

  const promptAction = (title: string, message: string, confirmLabel: string, actionCmd: string, isDestructive = false) => {
    setModalConfig({
      isOpen: true,
      title,
      message,
      confirmLabel,
      actionCmd,
      isDestructive
    });
  };

  const handleConfirmAction = () => {
    executeCommand(modalConfig.actionCmd);
    setModalConfig((prev) => ({ ...prev, isOpen: false }));
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
          <Droplet className="text-forest-700" size={24} />
          Smart Irrigation, Motor & Valve Actuation Control
        </h1>
        <p className="text-xs text-gray-500 font-medium mt-0.5">
          Real-time servo actuation on NodeMCU D5 (Water) and D6 (Fertilizer/Medicine) with safety interlocks
        </p>
      </div>

      {/* Emergency Stop Hero Bar */}
      <div className="bg-gradient-to-r from-rose-900 to-rose-800 rounded-3xl p-6 text-white shadow-lg border border-rose-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white/10 rounded-2xl shrink-0">
            <ShieldAlert size={32} className="text-rose-300" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold leading-tight">Emergency Master Cutoff</h3>
            <p className="text-xs text-rose-100 mt-0.5 max-w-md">
              Immediately commands all solenoids, servos, and pumps to safe CLOSED position.
            </p>
          </div>
        </div>

        <button
          onClick={() =>
            promptAction(
              'Confirm EMERGENCY STOP',
              'This will instantly close both Water and Medicine valves and shut down auto-watering pulses.',
              'STOP ALL VALVES NOW',
              'EMERGENCY_STOP',
              true
            )
          }
          className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white text-rose-950 font-black text-xs hover:bg-rose-50 active:scale-95 shadow-md transition-all uppercase tracking-wider"
        >
          <Power size={18} className="text-rose-600" />
          Emergency STOP
        </button>
      </div>

      {/* Hardware Status & Command Queue Feedback */}
      <div className="bg-white rounded-3xl p-5 border border-forest-100 shadow-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
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
            <span className="text-xs font-bold text-gray-800">
              Hardware Gateway: {deviceStatus.device_id} ({deviceStatus.status})
            </span>
          </div>

          {pendingCommand && (
            <div className="flex items-center gap-1.5 text-xs text-amber-700 font-bold bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              <Clock size={13} className="animate-spin" />
              <span>Pending Acknowledgment ({pendingCommand})...</span>
            </div>
          )}
        </div>

        {lastCommandResult && (
          <p className="text-xs font-mono text-gray-600 bg-gray-50 p-2.5 rounded-xl border border-gray-200">
            Gateway Log: {lastCommandResult}
          </p>
        )}
      </div>

      {/* Valve Controls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 1. Water Irrigation Valve */}
        <div className="bg-white rounded-3xl p-6 border border-forest-100 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-2xl bg-blue-50 text-blue-600">
                <Droplet size={20} />
              </div>
              <span
                className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                  reading?.water_open
                    ? 'bg-emerald-100 text-emerald-800 animate-pulse'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {reading?.water_open ? 'VALVE OPEN (90°)' : 'VALVE CLOSED (0°)'}
              </span>
            </div>

            <h3 className="text-base font-extrabold text-gray-900 mt-3">
              Water Irrigation Servo (Pin D5)
            </h3>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              Opens the main irrigation line for a calibrated 5-second pulse. Mandatory 60-second cooldown protects soil saturation.
            </p>
          </div>

          <div className="space-y-2 pt-2">
            {reading?.water_open ? (
              <button
                onClick={() => executeCommand('WATER_OFF')}
                className="w-full py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition-all"
              >
                Close Water Valve
              </button>
            ) : (
              <button
                onClick={() =>
                  promptAction(
                    'Open Water Valve (Pulse)',
                    'The valve servo will open to 90 degrees for 5 seconds and then auto-close safely.',
                    'Confirm & Open Valve',
                    'WATER_ON'
                  )
                }
                disabled={!isConnected}
                className="w-full py-3 rounded-2xl bg-forest-700 hover:bg-forest-800 text-white font-bold text-xs shadow-md shadow-forest-800/10 transition-all disabled:opacity-40"
              >
                Open Water Valve (5s Pulse)
              </button>
            )}
            <span className="text-[10px] text-gray-400 block text-center font-medium">
              Reported angle: {reading?.water_open ? '90°' : '0°'}
            </span>
          </div>
        </div>

        {/* 2. Medicine / Fertilizer Dosing Valve */}
        <div className="bg-white rounded-3xl p-6 border border-forest-100 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-2xl bg-amber-50 text-amber-600">
                <Zap size={20} />
              </div>
              <span
                className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                  reading?.medicine_open
                    ? 'bg-amber-100 text-amber-800 animate-pulse'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {reading?.medicine_open ? 'DOSING OPEN (90°)' : 'DOSING CLOSED (0°)'}
              </span>
            </div>

            <h3 className="text-base font-extrabold text-gray-900 mt-3">
              Medicine / Fertilizer Valve (Pin D6)
            </h3>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              Dispenses liquid biopesticides or biofertilizers for a timed 3-second micro-dose into the drip line.
            </p>
          </div>

          <div className="space-y-2 pt-2">
            {reading?.medicine_open ? (
              <button
                onClick={() => executeCommand('MEDICINE_OFF')}
                className="w-full py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition-all"
              >
                Close Medicine Valve
              </button>
            ) : (
              <button
                onClick={() =>
                  promptAction(
                    'Confirm Bio-Medicine Dosing',
                    'The medicine servo will open to 90 degrees for 3 seconds to dose liquid bio-fertilizer.',
                    'Authorize Dosing Pulse',
                    'MEDICINE_ON'
                  )
                }
                disabled={!isConnected}
                className="w-full py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md shadow-amber-800/10 transition-all disabled:opacity-40"
              >
                Dispense Medicine (3s Dose)
              </button>
            )}
            <span className="text-[10px] text-gray-400 block text-center font-medium">
              Reported angle: {reading?.medicine_open ? '90°' : '0°'}
            </span>
          </div>
        </div>

        {/* 3. Automatic Soil-Moisture Threshold Mode */}
        <div className="bg-white rounded-3xl p-6 border border-forest-100 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 size={20} />
              </div>
              <span
                className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                  reading?.auto_water
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {reading?.auto_water ? 'AUTO MODE ACTIVE' : 'MANUAL ONLY'}
              </span>
            </div>

            <h3 className="text-base font-extrabold text-gray-900 mt-3">
              Automated Moisture Threshold Mode
            </h3>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              When enabled, the NodeMCU automatically triggers watering when moisture &lt; 30% and re-arms when moisture reaches 40%.
            </p>
          </div>

          <div className="space-y-2 pt-2">
            <button
              onClick={() => executeCommand(reading?.auto_water ? 'AUTO_OFF' : 'AUTO_ON')}
              disabled={!isConnected}
              className={`w-full py-3 rounded-2xl text-white font-bold text-xs shadow-md transition-all disabled:opacity-40 ${
                reading?.auto_water
                  ? 'bg-rose-600 hover:bg-rose-700'
                  : 'bg-forest-700 hover:bg-forest-800'
              }`}
            >
              {reading?.auto_water ? 'Disable Auto-Watering' : 'Enable Auto-Watering'}
            </button>
            <span className="text-[10px] text-gray-400 block text-center font-medium">
              Auto Threshold: 30% | Rearm: 40%
            </span>
          </div>
        </div>
      </div>

      {/* Safety Interlocks Card */}
      <div className="bg-forest-50/60 rounded-3xl p-5 border border-forest-100 text-xs text-forest-950 space-y-2">
        <span className="font-extrabold uppercase tracking-wider text-forest-700 block">
          Hardware Safety Interlocks & Safeguards
        </span>
        <ul className="list-disc pl-5 space-y-1 text-gray-600">
          <li><strong>Autonomous Firmware Control:</strong> In case of WiFi disruption, the ESP8266 local watering timer continues to safeguard root zones.</li>
          <li><strong>Fail-Safe Shutoff:</strong> Water servo is restricted to a maximum 5-second pulse to prevent field waterlogging.</li>
          <li><strong>Anti-Short Cycle Cooldown:</strong> 60-second cooldown is enforced between consecutive watering cycles in firmware.</li>
        </ul>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={modalConfig.isOpen}
        title={modalConfig.title}
        message={modalConfig.message}
        confirmLabel={modalConfig.confirmLabel}
        isDestructive={modalConfig.isDestructive}
        onConfirm={handleConfirmAction}
        onCancel={() => setModalConfig((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};
