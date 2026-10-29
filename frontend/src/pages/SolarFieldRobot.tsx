import React, { useState, useEffect } from 'react';
import { 
  Bot, Sun, BatteryCharging, Play, Pause, Square, 
  RotateCcw, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Home, 
  ShieldAlert, Settings, RefreshCw 
} from 'lucide-react';
import { RobotCanvas } from '../components/RobotCanvas';
import { fetchRobotTelemetry, sendRobotCommand } from '../services/api';
import { RobotState } from '../types';

export const SolarFieldRobot: React.FC = () => {
  const [robotState, setRobotState] = useState<RobotState>({
    status: 'IDLE',
    mode: 'MANUAL',
    x_pos: 10.0,
    y_pos: 10.0,
    heading_deg: 90.0,
    distance_target_ft: 20.0,
    distance_travelled_ft: 0.0,
    battery_pct: 94.0,
    solar_power_w: 48.5,
    obstacle_detected: false,
    last_command: 'STOP',
    updated_at: new Date().toISOString()
  });

  const [configuredDistance, setConfiguredDistance] = useState<number>(20.0);
  const [isDemoRunning, setIsDemoRunning] = useState(false);
  const [sequenceStep, setSequenceStep] = useState<string>('Ready for mission');

  // Synchronize telemetry
  useEffect(() => {
    fetchRobotTelemetry().then(setRobotState);
    const interval = setInterval(() => {
      fetchRobotTelemetry().then(setRobotState);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const dispatch = async (cmd: string, dist = configuredDistance, mode?: string) => {
    const updated = await sendRobotCommand(cmd, dist, mode);
    setRobotState(updated);
  };

  // Automated 20-Foot Demonstration Sequence: Forward 20ft -> Stop -> U-Turn -> Return 20ft -> Stop
  const runAutonomousDemonstration = async () => {
    setIsDemoRunning(true);
    setSequenceStep(`Phase 1/4: Moving forward along crop row by ${configuredDistance} feet...`);
    await dispatch('START', configuredDistance, 'AUTONOMOUS');

    // Simulate forward progress
    let dist = 0;
    const forwardInterval = setInterval(async () => {
      dist += 2.0;
      if (dist >= configuredDistance) {
        clearInterval(forwardInterval);
        setSequenceStep('Phase 2/4: Target reached. Safe Stop.');
        await dispatch('PAUSE');

        // Phase 3: U-Turn
        setTimeout(async () => {
          setSequenceStep('Phase 3/4: Executing calibrated 180° U-turn into adjacent row...');
          setRobotState((prev) => ({
            ...prev,
            heading_deg: 270.0, // Face West
            y_pos: prev.y_pos + 4.0 // Shift to adjacent furrow
          }));

          // Phase 4: Return Trip
          setTimeout(() => {
            setSequenceStep(`Phase 4/4: Returning along adjacent row by ${configuredDistance} feet...`);
            let returnDist = 0;
            const returnInterval = setInterval(async () => {
              returnDist += 2.0;
              setRobotState((prev) => ({
                ...prev,
                x_pos: Math.max(10.0, prev.x_pos - 2.0),
                distance_travelled_ft: prev.distance_travelled_ft + 2.0
              }));

              if (returnDist >= configuredDistance) {
                clearInterval(returnInterval);
                setSequenceStep(`Mission Complete! Covered ${configuredDistance * 2} ft roundtrip autonomously.`);
                setIsDemoRunning(false);
                await dispatch('STOP');
              }
            }, 600);
          }, 1500);
        }, 1200);
      } else {
        setRobotState((prev) => ({
          ...prev,
          x_pos: prev.x_pos + 2.0,
          distance_travelled_ft: prev.distance_travelled_ft + 2.0
        }));
      }
    }, 600);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
          <Bot className="text-forest-700" size={24} />
          Solar-Powered Autonomous Field Robot Rover
        </h1>
        <p className="text-xs text-gray-500 font-medium mt-0.5">
          Top-down field path navigation, solar generation telemetry, and autonomous 20-foot scouting missions
        </p>
      </div>

      {/* Top Telemetry Pills (Battery, Solar, Distance) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl p-4 border border-forest-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-gray-400 block">Battery Level</span>
            <span className="text-xl font-extrabold font-mono text-gray-900">
              {robotState.battery_pct.toFixed(0)}%
            </span>
          </div>
          <BatteryCharging size={24} className="text-emerald-600" />
        </div>

        <div className="bg-white rounded-2xl p-4 border border-forest-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-gray-400 block">Solar Generation</span>
            <span className="text-xl font-extrabold font-mono text-amber-600">
              {robotState.solar_power_w.toFixed(1)} W
            </span>
          </div>
          <Sun size={24} className="text-amber-500 animate-spin-slow" />
        </div>

        <div className="bg-white rounded-2xl p-4 border border-forest-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-gray-400 block">Distance Covered</span>
            <span className="text-xl font-extrabold font-mono text-forest-800">
              {robotState.distance_travelled_ft.toFixed(1)} ft
            </span>
          </div>
          <Bot size={24} className="text-forest-600" />
        </div>

        <div className="bg-white rounded-2xl p-4 border border-forest-100 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-gray-400 block">Rover Mode</span>
            <span className="text-base font-extrabold text-forest-900">
              {robotState.mode}
            </span>
          </div>
          <span
            className={`w-3 h-3 rounded-full ${
              robotState.status.includes('RUNNING') ? 'bg-emerald-500 animate-ping' : 'bg-gray-300'
            }`}
          />
        </div>
      </div>

      {/* Top-Down Visual Agricultural Canvas */}
      <RobotCanvas state={robotState} />

      {/* Autonomous Sequence Mission Controller */}
      <div className="bg-white rounded-3xl p-6 border border-forest-100 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-forest-700 bg-forest-50 px-2.5 py-0.5 rounded-full border border-forest-200">
              Automated Mission Sequence
            </span>
            <h3 className="text-base font-extrabold text-gray-900 mt-1">
              Autonomous Row Scouting (Forward $\rightarrow$ U-Turn $\rightarrow$ Return)
            </h3>
          </div>

          {/* Configurable Distance Field (Default 20 ft) */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-gray-700">Mission Distance:</label>
            <div className="flex items-center gap-1 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200">
              <input
                type="number"
                min="5"
                max="100"
                value={configuredDistance}
                onChange={(e) => setConfiguredDistance(parseFloat(e.target.value) || 20.0)}
                className="w-14 font-mono font-bold text-xs bg-transparent focus:outline-none text-right"
              />
              <span className="text-xs font-semibold text-gray-500">feet</span>
            </div>
          </div>
        </div>

        {/* Live Mission Feedback */}
        <div className="p-3.5 bg-forest-50/70 rounded-2xl border border-forest-200 text-xs font-medium text-forest-900 flex items-center justify-between">
          <span>Active Mission Status: <strong>{sequenceStep}</strong></span>
          {isDemoRunning && <div className="w-4 h-4 border-2 border-forest-700 border-t-transparent rounded-full animate-spin" />}
        </div>

        {/* Autonomous Run Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={runAutonomousDemonstration}
            disabled={isDemoRunning}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-forest-700 hover:bg-forest-800 text-white font-extrabold text-xs shadow-md shadow-forest-800/10 active:scale-95 transition-all disabled:opacity-50"
          >
            <Play size={16} />
            Start {configuredDistance}ft Autonomous Mission
          </button>

          <button
            onClick={() => dispatch('PAUSE')}
            className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs transition-colors"
          >
            <Pause size={16} />
            Pause
          </button>

          <button
            onClick={() => dispatch('RESUME')}
            className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs transition-colors"
          >
            <Play size={16} />
            Resume
          </button>

          <button
            onClick={() => dispatch('RETURN_HOME')}
            className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-blue-50 text-blue-800 border border-blue-200 font-bold text-xs hover:bg-blue-100 transition-colors"
          >
            <Home size={16} />
            Return to Start
          </button>

          <button
            onClick={() => dispatch('EMERGENCY_STOP')}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-md shadow-rose-900/10 ml-auto transition-all"
          >
            <Square size={16} />
            Emergency STOP
          </button>
        </div>
      </div>

      {/* Manual Remote Control Pad */}
      <div className="bg-white rounded-3xl p-6 border border-forest-100 shadow-xs space-y-4">
        <h3 className="text-sm font-extrabold text-gray-900">
          Manual Jog & Directional Controls
        </h3>

        <div className="flex flex-col items-center justify-center gap-2 py-2">
          <button
            onClick={() => dispatch('FORWARD')}
            className="p-4 rounded-2xl bg-gray-100 hover:bg-forest-100 text-gray-800 hover:text-forest-800 active:scale-95 transition-all shadow-xs"
            title="Move Forward"
          >
            <ArrowUp size={22} />
          </button>

          <div className="flex items-center gap-4">
            <button
              onClick={() => dispatch('LEFT')}
              className="p-4 rounded-2xl bg-gray-100 hover:bg-forest-100 text-gray-800 hover:text-forest-800 active:scale-95 transition-all shadow-xs"
              title="Turn Left"
            >
              <ArrowLeft size={22} />
            </button>

            <button
              onClick={() => dispatch('STOP')}
              className="p-4 rounded-2xl bg-rose-100 text-rose-800 active:scale-95 transition-all shadow-xs font-bold text-xs"
              title="Stop"
            >
              STOP
            </button>

            <button
              onClick={() => dispatch('RIGHT')}
              className="p-4 rounded-2xl bg-gray-100 hover:bg-forest-100 text-gray-800 hover:text-forest-800 active:scale-95 transition-all shadow-xs"
              title="Turn Right"
            >
              <ArrowRight size={22} />
            </button>
          </div>

          <button
            onClick={() => dispatch('BACKWARD')}
            className="p-4 rounded-2xl bg-gray-100 hover:bg-forest-100 text-gray-800 hover:text-forest-800 active:scale-95 transition-all shadow-xs"
            title="Move Backward"
          >
            <ArrowDown size={22} />
          </button>
        </div>
      </div>
    </div>
  );
};
