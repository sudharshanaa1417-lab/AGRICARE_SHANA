import React, { useState, useEffect } from 'react';
import { 
  Activity, Droplets, Thermometer, Wind, Layers, Download, 
  RefreshCw, Radio, AlertTriangle, Settings, Clock, HelpCircle, CheckCircle2 
} from 'lucide-react';
import { useIoT } from '../context/IoTContext';
import { SensorCard } from '../components/SensorCard';
import { fetchHistoricalTelemetry, getApiBaseUrl, getDeviceId, getDeviceApiKey } from '../services/api';

export const RealTimeMonitoring: React.FC = () => {
  const { deviceStatus, reading, refreshTelemetry, isDemoMode } = useIoT();
  const [timeRangeHours, setTimeRangeHours] = useState(24);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<'moisture' | 'temperature' | 'humidity'>('moisture');
  const [wiringModalOpen, setWiringModalOpen] = useState(false);

  useEffect(() => {
    loadHistory(timeRangeHours);
  }, [timeRangeHours]);

  const loadHistory = async (hours: number) => {
    setLoadingHistory(true);
    try {
      const res = await fetchHistoricalTelemetry(hours);
      setHistoryData(res.data || []);
      setStats(res.stats || null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleExportCSV = () => {
    const baseUrl = getApiBaseUrl();
    const deviceId = getDeviceId();
    window.open(`${baseUrl}/api/history/export/csv?device_id=${deviceId}`, '_blank');
  };

  // SVG Chart rendering
  const renderLineChart = () => {
    if (!historyData || historyData.length === 0) {
      return (
        <div className="h-64 flex flex-col items-center justify-center text-gray-400 text-xs">
          <Activity size={32} className="text-gray-300 mb-2" />
          <span>Waiting for device telemetry points to generate line chart...</span>
        </div>
      );
    }

    const values = historyData
      .map((p) => p[selectedMetric])
      .filter((v) => v !== null && v !== undefined && !isNaN(v));

    if (values.length < 2) {
      return (
        <div className="h-64 flex items-center justify-center text-gray-400 text-xs">
          Accumulating initial sensor points...
        </div>
      );
    }

    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const valRange = maxVal - minVal || 1;

    const width = 800;
    const height = 240;
    const padding = 35;

    const points = historyData.map((d, index) => {
      const x = padding + (index / (historyData.length - 1)) * (width - 2 * padding);
      const val = d[selectedMetric] ?? minVal;
      const y = height - padding - ((val - minVal) / valRange) * (height - 2 * padding);
      return `${x},${y}`;
    }).join(' ');

    const strokeColor =
      selectedMetric === 'moisture'
        ? '#2563eb'
        : selectedMetric === 'temperature'
        ? '#ea580c'
        : '#0891b2';

    const fillColor =
      selectedMetric === 'moisture'
        ? 'rgba(37, 99, 235, 0.12)'
        : selectedMetric === 'temperature'
        ? 'rgba(234, 88, 12, 0.12)'
        : 'rgba(8, 145, 178, 0.12)';

    const areaPoints = `${points} ${width - padding},${height - padding} ${padding},${height - padding}`;

    return (
      <div className="w-full overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-64 block">
          {/* Grid lines */}
          <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="#f3f4f6" strokeWidth="1" />
          <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="#f3f4f6" strokeWidth="1" />
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#e5e7eb" strokeWidth="1.5" />

          {/* Area fill */}
          <polygon points={areaPoints} fill={fillColor} />

          {/* Value trend line */}
          <polyline fill="none" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" points={points} />

          {/* Min & Max value tags */}
          <text x={padding} y={padding - 10} fill="#6b7280" fontSize="10" fontWeight="bold">
            Max: {maxVal.toFixed(1)} {selectedMetric === 'temperature' ? '°C' : '%'}
          </text>
          <text x={padding} y={height - padding + 18} fill="#6b7280" fontSize="10" fontWeight="bold">
            Min: {minVal.toFixed(1)} {selectedMetric === 'temperature' ? '°C' : '%'}
          </text>
        </svg>
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Export CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
            <Activity className="text-forest-700" size={24} />
            Real-Time IoT Telemetry & Sensor Analytics
          </h1>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            Continuous soil moisture, temperature, humidity and NPK telemetry from your ESP8266 node
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setWiringModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-forest-200 bg-white text-forest-800 text-xs font-bold hover:bg-forest-50 shadow-2xs"
          >
            <HelpCircle size={15} />
            Hardware Wiring Guide
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-forest-700 hover:bg-forest-800 text-white text-xs font-bold shadow-sm transition-colors"
          >
            <Download size={15} />
            Download CSV
          </button>
        </div>
      </div>

      {/* Hardware Connection Card */}
      <div className="bg-white rounded-3xl p-5 border border-forest-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={`p-3 rounded-2xl ${
              deviceStatus.status === 'ONLINE'
                ? 'bg-emerald-50 text-emerald-600'
                : deviceStatus.status === 'DEMO'
                ? 'bg-amber-50 text-amber-600'
                : 'bg-rose-50 text-rose-600'
            }`}
          >
            <Radio size={24} className={deviceStatus.status === 'ONLINE' ? 'animate-pulse' : ''} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Target Node
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                  deviceStatus.status === 'ONLINE'
                    ? 'bg-emerald-100 text-emerald-800'
                    : deviceStatus.status === 'DEMO'
                    ? 'bg-amber-100 text-amber-900'
                    : 'bg-rose-100 text-rose-900'
                }`}
              >
                {deviceStatus.status}
              </span>
            </div>
            <h3 className="text-base font-extrabold text-gray-900 mt-0.5">
              NodeMCU ESP8266 Gateway ({deviceStatus.device_id})
            </h3>
            <p className="text-[11px] text-gray-500">
              Cloud Target: <strong className="font-mono text-gray-700">{getApiBaseUrl()}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-medium text-gray-500 border-t sm:border-t-0 sm:border-l border-gray-100 pt-3 sm:pt-0 sm:pl-4">
          <div>
            <span className="block text-[10px] text-gray-400">Last Telemetry Heartbeat</span>
            <span className="font-mono font-bold text-gray-800">
              {deviceStatus.reading?.timestamp
                ? new Date(deviceStatus.reading.timestamp).toLocaleTimeString()
                : 'Waiting for packets'}
            </span>
          </div>
          <button
            onClick={refreshTelemetry}
            className="p-2 rounded-xl bg-forest-50 hover:bg-forest-100 text-forest-700 transition-colors"
            title="Refresh Heartbeat"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* Sensor Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <SensorCard
          title="Soil Moisture"
          value={reading?.moisture ?? null}
          unit="%"
          icon={Droplets}
          colorClass="bg-blue-50 text-blue-600"
          statusLabel={
            reading?.moisture !== null && reading?.moisture !== undefined
              ? reading.moisture < 30
                ? 'LOW MOISTURE'
                : 'HEALTHY'
              : 'OFFLINE'
          }
          statusColor={
            reading?.moisture !== null && reading?.moisture !== undefined
              ? reading.moisture < 30
                ? 'rose'
                : 'green'
              : 'gray'
          }
          subtext="Analog Pin A0 (Calibrated)"
          min={0}
          max={100}
        />

        <SensorCard
          title="Soil / Air Temperature"
          value={reading?.temperature ?? null}
          unit="°C"
          icon={Thermometer}
          colorClass="bg-amber-50 text-amber-600"
          statusLabel={reading?.temperature ? 'OPTIMAL' : 'OFFLINE'}
          statusColor="green"
          subtext="DHT22 Sensor (Pin D2)"
          min={10}
          max={45}
        />

        <SensorCard
          title="Air Humidity"
          value={reading?.humidity ?? null}
          unit="%"
          icon={Wind}
          colorClass="bg-cyan-50 text-cyan-600"
          statusLabel={reading?.humidity ? 'NORMAL' : 'OFFLINE'}
          statusColor="green"
          subtext="Relative Ambient Humidity"
          min={20}
          max={90}
        />

        <SensorCard
          title="Soil NPK Nutrients"
          value={
            reading?.nitrogen && reading.nitrogen !== -1
              ? `${reading.nitrogen}:${reading.phosphorus}:${reading.potassium}`
              : '45:22:110'
          }
          unit="mg/kg"
          icon={Layers}
          colorClass="bg-emerald-50 text-emerald-700"
          statusLabel="RS485 MODBUS"
          statusColor="green"
          subtext="MAX485 on D7/D1/D0"
        />
      </div>

      {/* Historical Telemetry Chart Card */}
      <div className="bg-white rounded-3xl p-5 border border-forest-100 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-extrabold text-gray-900">
              Historical Sensor Trends
            </h3>
            <p className="text-xs text-gray-500 font-medium">
              Interactive telemetry curve over selected observation window
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Metric Switcher */}
            <div className="flex items-center bg-gray-100 p-1 rounded-xl text-xs font-bold text-gray-700">
              <button
                onClick={() => setSelectedMetric('moisture')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  selectedMetric === 'moisture' ? 'bg-white shadow-xs text-blue-700' : 'text-gray-500'
                }`}
              >
                Moisture (%)
              </button>
              <button
                onClick={() => setSelectedMetric('temperature')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  selectedMetric === 'temperature' ? 'bg-white shadow-xs text-amber-700' : 'text-gray-500'
                }`}
              >
                Temp (°C)
              </button>
              <button
                onClick={() => setSelectedMetric('humidity')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  selectedMetric === 'humidity' ? 'bg-white shadow-xs text-cyan-700' : 'text-gray-500'
                }`}
              >
                Humidity (%)
              </button>
            </div>

            {/* Time Window Switcher */}
            <div className="flex items-center bg-forest-50 p-1 rounded-xl text-xs font-bold text-forest-900">
              {[
                { label: '1 Hr', val: 1 },
                { label: '24 Hr', val: 24 },
                { label: '7 Days', val: 168 },
                { label: '30 Days', val: 720 },
              ].map((t) => (
                <button
                  key={t.val}
                  onClick={() => setTimeRangeHours(t.val)}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    timeRangeHours === t.val ? 'bg-forest-700 text-white shadow-xs' : 'text-forest-800'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Render Chart */}
        {renderLineChart()}

        {/* Min / Max / Average Statistics Summary */}
        {stats && (
          <div className="grid grid-cols-3 gap-3 pt-3 border-t border-gray-100 text-center">
            <div className="p-3 bg-gray-50 rounded-2xl">
              <span className="text-[10px] uppercase font-bold text-gray-400 block">Minimum</span>
              <span className="text-base font-extrabold font-mono text-gray-800">
                {stats[selectedMetric]?.min !== null ? `${stats[selectedMetric]?.min}` : '--'}
              </span>
            </div>
            <div className="p-3 bg-gray-50 rounded-2xl">
              <span className="text-[10px] uppercase font-bold text-gray-400 block">Average</span>
              <span className="text-base font-extrabold font-mono text-forest-700">
                {stats[selectedMetric]?.avg !== null ? `${stats[selectedMetric]?.avg}` : '--'}
              </span>
            </div>
            <div className="p-3 bg-gray-50 rounded-2xl">
              <span className="text-[10px] uppercase font-bold text-gray-400 block">Maximum</span>
              <span className="text-base font-extrabold font-mono text-gray-800">
                {stats[selectedMetric]?.max !== null ? `${stats[selectedMetric]?.max}` : '--'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Hardware Wiring Modal */}
      {wiringModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full border border-forest-100 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <h3 className="text-sm font-extrabold text-gray-900">
                NodeMCU ESP8266 Pinout & Kit Wiring
              </h3>
              <button
                onClick={() => setWiringModalOpen(false)}
                className="p-1 rounded-full text-gray-400 hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

            <div className="text-xs space-y-3 text-gray-600 leading-relaxed">
              <p>
                Your sketch in <code className="font-mono text-forest-700 bg-forest-50 px-1 py-0.5 rounded">arduino/AgriCare_ESP8266.ino</code> is configured for:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Soil Moisture:</strong> Pin <strong>A0</strong> (Calibrated: Dry=800, Wet=350)</li>
                <li><strong>DHT22 Temp & Humidity:</strong> Pin <strong>D2</strong> (GPIO 4)</li>
                <li><strong>Water Servo Valve:</strong> Pin <strong>D5</strong> (GPIO 14, 5s pulse)</li>
                <li><strong>Medicine Servo Valve:</strong> Pin <strong>D6</strong> (GPIO 12, 3s dose)</li>
                <li><strong>MAX485 Modbus NPK:</strong> RO $\rightarrow$ <strong>D7</strong>, DI $\rightarrow$ <strong>D1</strong>, DE/RE $\rightarrow$ <strong>D0</strong></li>
                <li><strong>Cloud API Target:</strong> <code className="font-mono text-forest-800">{getApiBaseUrl()}/api/readings</code></li>
                <li><strong>Auth Header:</strong> <code className="font-mono text-gray-700">X-API-Key: {getDeviceApiKey()}</code></li>
              </ul>
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900 text-[11px]">
                💡 Tip: Ensure your NodeMCU and external servos share a common ground line.
              </div>
            </div>

            <button
              onClick={() => setWiringModalOpen(false)}
              className="w-full py-2.5 rounded-xl bg-forest-700 text-white text-xs font-bold hover:bg-forest-800"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
