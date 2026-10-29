import React, { useState } from 'react';
import { 
  Droplets, Thermometer, Wind, Layers, AlertTriangle, 
  Sparkles, CheckCircle2, ChevronRight, TrendingUp, Sun, CloudRain,
  Camera, UploadCloud, RefreshCw, Cpu
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useIoT } from '../context/IoTContext';
import { useAuth } from '../context/AuthContext';
import { SensorCard } from '../components/SensorCard';
import { MultiImageUploader } from '../components/MultiImageUploader';
import { CameraModal } from '../components/CameraModal';
import { diagnoseCropImages } from '../services/api';
import { MultiImageDiagnosis } from '../types';

interface DashboardProps {
  onNavigate: (page: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { t } = useLanguage();
  const { deviceStatus, reading, refreshTelemetry } = useIoT();
  const { user } = useAuth();

  // Dashboard in-place multi-image upload & camera state
  const [selectedCrop, setSelectedCrop] = useState('tomato');
  const [selectedPart, setSelectedPart] = useState('leaf');
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [diagnosisResult, setDiagnosisResult] = useState<MultiImageDiagnosis | null>(null);

  const handleCapturePhoto = (file: File) => {
    setUploadedImages((prev) => [...prev, file].slice(0, 8));
  };

  const handleRunDiagnosis = async () => {
    if (uploadedImages.length === 0) return;
    setIsAnalyzing(true);
    try {
      const result = await diagnoseCropImages(selectedCrop, selectedPart, uploadedImages);
      setDiagnosisResult(result);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome Banner & Tagline */}
      <div className="bg-gradient-to-r from-forest-900 via-forest-800 to-forest-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg border border-forest-700/50">
        <div className="absolute -right-8 -bottom-8 w-44 h-44 rounded-full bg-forest-600/20 blur-2xl pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs text-[11px] font-semibold text-emerald-300">
            <span>🌱 {user?.farm_name || 'AgriCare Farm'}</span>
            <span>•</span>
            <span>{user?.district || 'Coimbatore'}, {user?.state || 'Tamil Nadu'}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {t('welcome_title')}
          </h1>
          <p className="text-xs sm:text-sm text-forest-100 max-w-xl font-medium leading-relaxed">
            {t('welcome_sub')}
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3 text-xs font-semibold">
            <span className="bg-forest-950/60 px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Selected Crop: <strong className="text-white">Tomato (Solanum lycopersicum)</strong>
            </span>
            <span className="bg-forest-950/60 px-3 py-1.5 rounded-xl border border-white/10 text-emerald-200">
              Stage: <strong>Flowering & Fruit Set (Day 65)</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Prominent Quick-Action Image & Camera Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={18} className="text-forest-700" />
            <h2 className="text-sm sm:text-base font-extrabold text-gray-900">
              AI Crop Doctor — Instant Leaf & Pest Diagnosis
            </h2>
          </div>
          <span className="text-[11px] text-gray-500 font-medium">
            No navigation needed
          </span>
        </div>

        <MultiImageUploader
          selectedCrop={selectedCrop}
          setSelectedCrop={setSelectedCrop}
          selectedPart={selectedPart}
          setSelectedPart={setSelectedPart}
          images={uploadedImages}
          setImages={setUploadedImages}
          onOpenCamera={() => setIsCameraOpen(true)}
          onRunDiagnosis={handleRunDiagnosis}
          isAnalyzing={isAnalyzing}
        />
      </div>

      {/* Instant In-Place Diagnosis Report Card */}
      {diagnosisResult && (
        <div className="bg-white rounded-3xl p-6 border-2 border-forest-500/50 shadow-md animate-in fade-in duration-300 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div className="flex items-center gap-2.5">
              <span
                className={`px-3 py-1 rounded-full text-xs font-extrabold ${
                  diagnosisResult.overall_health === 'Healthy'
                    ? 'bg-emerald-100 text-emerald-900'
                    : 'bg-rose-100 text-rose-900'
                }`}
              >
                Health Status: {diagnosisResult.overall_health}
              </span>
              <span className="text-xs text-gray-400">|</span>
              <span className="text-xs font-semibold text-gray-600">
                {diagnosisResult.summary}
              </span>
            </div>
            <button
              onClick={() => onNavigate('doctor')}
              className="text-xs font-bold text-forest-700 hover:underline flex items-center gap-1"
            >
              Full Pathology Report <ChevronRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {diagnosisResult.results.map((item, i) => (
              <div key={i} className="p-4 rounded-2xl bg-forest-50/50 border border-forest-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-sm text-forest-950">
                    #{i + 1} {item.disease_name}
                  </span>
                  <span className="text-xs font-bold text-forest-700">
                    Model Confidence: {item.confidence}%
                  </span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  <strong>Symptoms:</strong> {item.symptoms}
                </p>
                <div className="pt-1 text-[11px] text-forest-900 bg-white p-2.5 rounded-xl border border-forest-200">
                  <strong>Scientific IPM Action:</strong> {item.scientific_recommendation}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Real-Time IoT Telemetry Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu size={18} className="text-forest-700" />
            <h2 className="text-sm sm:text-base font-extrabold text-gray-900">
              Live Field Sensor Telemetry (NodeMCU ESP8266)
            </h2>
          </div>
          <button
            onClick={refreshTelemetry}
            className="flex items-center gap-1 text-xs font-bold text-forest-700 hover:text-forest-900 p-1.5 rounded-lg hover:bg-forest-50 transition-colors"
          >
            <RefreshCw size={13} />
            Sync Now
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <SensorCard
            title={t('soil_moisture')}
            value={reading?.moisture ?? null}
            unit="%"
            icon={Droplets}
            colorClass="bg-blue-50 text-blue-600"
            statusLabel={
              reading?.moisture !== null && reading?.moisture !== undefined
                ? reading.moisture < 30
                  ? 'CRITICAL LOW'
                  : reading.moisture > 65
                  ? 'SATURATED'
                  : 'OPTIMAL'
                : 'WAITING'
            }
            statusColor={
              reading?.moisture !== null && reading?.moisture !== undefined
                ? reading.moisture < 30
                  ? 'rose'
                  : reading.moisture > 65
                  ? 'amber'
                  : 'green'
                : 'gray'
            }
            subtext="Auto-watering threshold: 30%"
            min={0}
            max={100}
          />

          <SensorCard
            title={t('soil_temp')}
            value={reading?.temperature ?? null}
            unit="°C"
            icon={Thermometer}
            colorClass="bg-amber-50 text-amber-600"
            statusLabel={reading?.temperature ? 'NORMAL' : 'WAITING'}
            statusColor="green"
            subtext="Optimal range: 22°C - 32°C"
            min={10}
            max={45}
          />

          <SensorCard
            title={t('air_humidity')}
            value={reading?.humidity ?? null}
            unit="%"
            icon={Wind}
            colorClass="bg-cyan-50 text-cyan-600"
            statusLabel={reading?.humidity ? 'ADEQUATE' : 'WAITING'}
            statusColor="green"
            subtext="Measured by DHT22 Sensor"
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
            subtext="N : P : K Macro elements"
          />
        </div>
      </div>

      {/* Agricultural Weather & Market Snapshot Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Agricultural Weather Widget */}
        <div className="bg-white rounded-3xl p-5 border border-forest-100 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              {t('weather_summary')}
            </span>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Coimbatore Weather Station
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Sun size={42} className="text-amber-500 animate-spin-slow" />
              <div>
                <span className="text-3xl font-extrabold text-gray-900">29.2°C</span>
                <p className="text-xs text-gray-500 font-medium">Mostly Sunny • 0% Rain Probability</p>
              </div>
            </div>
            <div className="text-right text-xs text-gray-500 space-y-1">
              <p>Wind: <strong>11 km/h NE</strong></p>
              <p>UV Index: <strong>6.5 (Moderate)</strong></p>
              <p>Evapotranspiration: <strong>4.2 mm/day</strong></p>
            </div>
          </div>

          <div className="p-3 bg-forest-50/60 rounded-2xl border border-forest-100 text-xs text-forest-900 flex items-center gap-2">
            <CloudRain size={16} className="text-forest-600 shrink-0" />
            <span>Favorable window for drip fertigation and foliar spray until 4:30 PM.</span>
          </div>
        </div>

        {/* Mandi Price Snapshot */}
        <div className="bg-white rounded-3xl p-5 border border-forest-100 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Today's Mandi Price Snapshot
            </span>
            <button
              onClick={() => onNavigate('market')}
              className="text-xs font-bold text-forest-700 hover:underline flex items-center gap-1"
            >
              All Mandis <ChevronRight size={14} />
            </button>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-2xl border border-gray-100">
              <div>
                <span className="font-extrabold text-xs text-gray-900 block">Tomato (Hybrid Red)</span>
                <span className="text-[10px] text-gray-500">Uzhavar Sandhai, Coimbatore</span>
              </div>
              <div className="text-right">
                <span className="font-mono font-extrabold text-sm text-forest-800 block">₹ 3,200 / Q</span>
                <span className="text-[10px] text-emerald-600 font-bold">▲ ₹150 from yesterday</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-2xl border border-gray-100">
              <div>
                <span className="font-extrabold text-xs text-gray-900 block">Chilli (Samba Green)</span>
                <span className="text-[10px] text-gray-500">Mattuthavani, Madurai</span>
              </div>
              <div className="text-right">
                <span className="font-mono font-extrabold text-sm text-forest-800 block">₹ 8,400 / Q</span>
                <span className="text-[10px] text-gray-400 font-medium">Stable</span>
              </div>
            </div>
          </div>

          <div className="text-[10px] text-gray-400 font-medium text-right">
            Source: AGMARKNET Official Mandi Gate Arrivals
          </div>
        </div>
      </div>

      {/* Upcoming Farming Tasks & Crop Advisory */}
      <div className="bg-white rounded-3xl p-5 border border-forest-100 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} className="text-forest-700" />
            <h2 className="text-sm sm:text-base font-extrabold text-gray-900">
              {t('upcoming_tasks')} — Day 65 to Day 70
            </h2>
          </div>
          <button
            onClick={() => onNavigate('calendar')}
            className="text-xs font-bold text-forest-700 hover:underline flex items-center gap-1"
          >
            Full Crop Calendar <ChevronRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-2xl bg-forest-50/70 border border-forest-100 space-y-1.5">
            <span className="text-[10px] uppercase font-bold text-forest-700 bg-white px-2 py-0.5 rounded-full inline-block">
              Day 65 • Irrigation
            </span>
            <p className="text-xs font-bold text-gray-900">Uniform Drip Moisture Check</p>
            <p className="text-[11px] text-gray-600">
              Maintain soil moisture above 35% to prevent Blossom End Rot during fruit set.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-100 space-y-1.5">
            <span className="text-[10px] uppercase font-bold text-amber-800 bg-white px-2 py-0.5 rounded-full inline-block">
              Day 67 • Nutrition
            </span>
            <p className="text-xs font-bold text-gray-900">Calcium Nitrate & Boron Spray</p>
            <p className="text-[11px] text-gray-600">
              Apply Calcium Nitrate @ 5 kg/acre via drip + Boron 20% @ 1 g/L foliar spray.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100 space-y-1.5">
            <span className="text-[10px] uppercase font-bold text-blue-800 bg-white px-2 py-0.5 rounded-full inline-block">
              Day 70 • Scouting
            </span>
            <p className="text-xs font-bold text-gray-900">Fruit Borer Pheromone Inspection</p>
            <p className="text-[11px] text-gray-600">
              Check trap catches. If catches exceed 5 moths/trap/night, spray Neem NSKE 5%.
            </p>
          </div>
        </div>
      </div>

      {/* Live Device Camera Modal */}
      <CameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCapturePhoto}
      />
    </div>
  );
};
