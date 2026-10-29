import React, { useState } from 'react';
import { 
  Sparkles, MapPin, Layers, Calendar, ChevronRight, CheckCircle2, 
  AlertTriangle, ShieldCheck, ArrowRight, Droplets 
} from 'lucide-react';
import { predictYield } from '../services/api';
import { YieldPredictionResult } from '../types';

export const YieldPrediction: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [state, setState] = useState('Tamil Nadu');
  const [district, setDistrict] = useState('Coimbatore');
  const [pincode, setPincode] = useState('641109');
  const [soilType, setSoilType] = useState('Red soil');
  const [crop, setCrop] = useState('Tomato');
  const [sowingMonth, setSowingMonth] = useState('October');
  const [areaAcres, setAreaAcres] = useState(2.0);
  const [irrigation, setIrrigation] = useState('Drip');
  const [variety, setVariety] = useState('Hybrid Red Special');
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<YieldPredictionResult | null>(null);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const soils = [
    'Red soil', 'Black soil', 'Alluvial', 'Laterite', 
    'Loamy soil', 'Clayey soil', 'Sandy soil', 'Other / Unknown'
  ];

  const handlePredict = async () => {
    setLoading(true);
    try {
      const res = await predictYield({
        state,
        district,
        soil_type: soilType,
        crop,
        sowing_month: sowingMonth,
        area_acres: areaAcres,
        irrigation_type: irrigation,
        variety
      });
      setResult(res);
      setCurrentStep(6);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
          <Sparkles className="text-forest-700" size={24} />
          Agricultural Yield Prediction & Suitability Model
        </h1>
        <p className="text-xs text-gray-500 font-medium mt-0.5">
          6-step guided agronomic forecasting based on soil compatibility, agro-climatic zones, and sowing season
        </p>
      </div>

      {/* Stepper Wizard Indicator */}
      <div className="bg-white rounded-3xl p-4 border border-forest-100 shadow-xs">
        <div className="flex items-center justify-between text-xs font-bold text-gray-400 overflow-x-auto pb-1">
          {[
            { num: 1, label: 'Location' },
            { num: 2, label: 'Soil Type' },
            { num: 3, label: 'Crop' },
            { num: 4, label: 'Sowing Month' },
            { num: 5, label: 'Farm Details' },
            { num: 6, label: 'Report' }
          ].map((s) => (
            <div
              key={s.num}
              onClick={() => s.num < currentStep && setCurrentStep(s.num)}
              className={`flex items-center gap-1.5 shrink-0 px-2 py-1 rounded-xl cursor-pointer transition-colors ${
                currentStep === s.num
                  ? 'text-forest-800 bg-forest-50 font-extrabold'
                  : currentStep > s.num
                  ? 'text-emerald-700 font-bold'
                  : 'text-gray-400'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                  currentStep === s.num
                    ? 'bg-forest-700 text-white'
                    : currentStep > s.num
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                {currentStep > s.num ? '✓' : s.num}
              </span>
              <span>{s.label}</span>
              {s.num < 6 && <ChevronRight size={13} className="text-gray-300 ml-1" />}
            </div>
          ))}
        </div>
      </div>

      {/* Wizard Steps Form */}
      {currentStep === 1 && (
        <div className="bg-white rounded-3xl p-6 border border-forest-100 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <MapPin size={20} className="text-forest-700" />
            <h3 className="text-base font-extrabold text-gray-900">
              Step 1: Farm Location & Agro-Climatic Zone
            </h3>
          </div>
          <p className="text-xs text-gray-500">
            Regional weather patterns and historical district rainfalls calibrate yield expectations.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">State</label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold focus:ring-2 focus:ring-forest-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">District</label>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold focus:ring-2 focus:ring-forest-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">PIN Code</label>
              <input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold focus:ring-2 focus:ring-forest-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-3">
            <button
              onClick={() => setCurrentStep(2)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-forest-700 text-white text-xs font-bold hover:bg-forest-800 transition-colors"
            >
              Next: Select Soil Type <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {currentStep === 2 && (
        <div className="bg-white rounded-3xl p-6 border border-forest-100 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Layers size={20} className="text-forest-700" />
            <h3 className="text-base font-extrabold text-gray-900">
              Step 2: Soil Classification
            </h3>
          </div>
          <p className="text-xs text-gray-500">
            Soil texture, water retention capacity, and drainage directly influence root anchoring.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            {soils.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSoilType(s)}
                className={`p-3.5 rounded-2xl border text-xs font-bold text-left transition-all ${
                  soilType === s
                    ? 'border-forest-700 bg-forest-50 text-forest-900 shadow-xs ring-1 ring-forest-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-forest-300'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="flex justify-between pt-3">
            <button
              onClick={() => setCurrentStep(1)}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100"
            >
              Back
            </button>
            <button
              onClick={() => setCurrentStep(3)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-forest-700 text-white text-xs font-bold hover:bg-forest-800"
            >
              Next: Choose Crop <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {currentStep === 3 && (
        <div className="bg-white rounded-3xl p-6 border border-forest-100 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles size={20} className="text-forest-700" />
            <h3 className="text-base font-extrabold text-gray-900">
              Step 3: Target Crop
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
            {[
              { id: 'Tomato', sub: 'Horticultural vegetable' },
              { id: 'Rice', sub: 'Paddy cereal staple' },
              { id: 'Cotton', sub: 'Cash fiber crop' },
              { id: 'Groundnut', sub: 'Legume oilseed' },
              { id: 'Maize', sub: 'Coarse grain cereal' },
              { id: 'Chilli', sub: 'Commercial spice crop' }
            ].map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCrop(c.id)}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  crop === c.id
                    ? 'border-forest-700 bg-forest-50 text-forest-900 ring-1 ring-forest-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-forest-300'
                }`}
              >
                <span className="font-extrabold text-sm block">{c.id}</span>
                <span className="text-[11px] text-gray-400 font-normal">{c.sub}</span>
              </button>
            ))}
          </div>

          <div className="flex justify-between pt-3">
            <button
              onClick={() => setCurrentStep(2)}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100"
            >
              Back
            </button>
            <button
              onClick={() => setCurrentStep(4)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-forest-700 text-white text-xs font-bold hover:bg-forest-800"
            >
              Next: Sowing Month <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {currentStep === 4 && (
        <div className="bg-white rounded-3xl p-6 border border-forest-100 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Calendar size={20} className="text-forest-700" />
            <h3 className="text-base font-extrabold text-gray-900">
              Step 4: Planned Sowing Month
            </h3>
          </div>
          <p className="text-xs text-gray-500">
            Daylight photoperiod and flowering temperatures depend heavily on your sowing month.
          </p>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5 pt-2">
            {months.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setSowingMonth(m)}
                className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all ${
                  sowingMonth === m
                    ? 'border-forest-700 bg-forest-50 text-forest-900 ring-1 ring-forest-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-forest-300'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          <div className="flex justify-between pt-3">
            <button
              onClick={() => setCurrentStep(3)}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100"
            >
              Back
            </button>
            <button
              onClick={() => setCurrentStep(5)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-forest-700 text-white text-xs font-bold hover:bg-forest-800"
            >
              Next: Area & Irrigation <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {currentStep === 5 && (
        <div className="bg-white rounded-3xl p-6 border border-forest-100 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Droplets size={20} className="text-forest-700" />
            <h3 className="text-base font-extrabold text-gray-900">
              Step 5: Farm Area & Agronomic Setup
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Farm Area (Acres)</label>
              <input
                type="number"
                step="0.5"
                min="0.1"
                value={areaAcres}
                onChange={(e) => setAreaAcres(parseFloat(e.target.value) || 1.0)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold focus:ring-2 focus:ring-forest-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Irrigation Method</label>
              <select
                value={irrigation}
                onChange={(e) => setIrrigation(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold focus:ring-2 focus:ring-forest-500"
              >
                <option value="Drip">Drip Irrigation (High Precision)</option>
                <option value="Sprinkler">Sprinkler System</option>
                <option value="Flood">Furrow / Flood Irrigation</option>
                <option value="Rainfed">Rainfed Only</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Crop Variety</label>
              <input
                type="text"
                value={variety}
                onChange={(e) => setVariety(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold focus:ring-2 focus:ring-forest-500"
              />
            </div>
          </div>

          <div className="flex justify-between pt-3">
            <button
              onClick={() => setCurrentStep(4)}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100"
            >
              Back
            </button>
            <button
              onClick={handlePredict}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-forest-800 text-white text-xs font-extrabold hover:bg-forest-900 shadow-md transition-all disabled:opacity-50"
            >
              {loading ? 'Computing Agronomic Model...' : 'Generate Harvest & Yield Report 🚀'}
            </button>
          </div>
        </div>
      )}

      {/* Step 6: Comprehensive Yield Prediction Report */}
      {currentStep === 6 && result && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="bg-gradient-to-r from-forest-800 to-forest-900 rounded-3xl p-6 text-white shadow-md space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-300 bg-white/10 px-2.5 py-0.5 rounded-full inline-block">
                  Suitability Assessment: {result.suitability_score}
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold mt-1">
                  {result.crop} Yield Forecast
                </h2>
                <p className="text-xs text-forest-200 mt-0.5">
                  Location: {result.location} • Sowing: {result.sowing_month} • Soil: {result.soil_type}
                </p>
              </div>

              <div className="text-right">
                <span className="text-3xl font-extrabold font-mono text-emerald-400">
                  {result.total_estimated_yield} Q
                </span>
                <span className="text-xs text-forest-200 block">
                  Total Estimated Harvest ({result.area_acres} Acres)
                </span>
              </div>
            </div>

            {/* Yield metrics band */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs border-t border-forest-700/80">
              <div className="p-3 bg-forest-950/50 rounded-2xl border border-white/10">
                <span className="text-[10px] text-forest-300 uppercase block font-semibold">Yield Per Acre</span>
                <span className="text-lg font-bold font-mono text-white">
                  {result.predicted_yield_per_acre} Quintals
                </span>
              </div>
              <div className="p-3 bg-forest-950/50 rounded-2xl border border-white/10">
                <span className="text-[10px] text-forest-300 uppercase block font-semibold">Confidence Band (±12%)</span>
                <span className="text-lg font-bold font-mono text-emerald-300">
                  {result.confidence_range.min_per_acre} - {result.confidence_range.max_per_acre} Q/acre
                </span>
              </div>
              <div className="p-3 bg-forest-950/50 rounded-2xl border border-white/10">
                <span className="text-[10px] text-forest-300 uppercase block font-semibold">Expected Days to Harvest</span>
                <span className="text-lg font-bold font-mono text-white">
                  ~ {result.growing_duration_days} Days
                </span>
              </div>
            </div>
          </div>

          {/* Factors and Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-3xl p-5 border border-forest-100 shadow-xs space-y-3">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Agronomic Water & Fertigation Guidelines
              </h4>
              <p className="text-xs text-gray-700 leading-relaxed bg-forest-50/50 p-3.5 rounded-2xl border border-forest-100">
                {result.water_nutrient_guidelines}
              </p>
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider pt-2">
                Pest & Disease Risk Factors
              </h4>
              <p className="text-xs text-gray-700 leading-relaxed bg-amber-50/50 p-3.5 rounded-2xl border border-amber-100">
                {result.pest_disease_risks}
              </p>
            </div>

            {/* Alternative Crops Comparison Table */}
            <div className="bg-white rounded-3xl p-5 border border-forest-100 shadow-xs space-y-3">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Alternative Crop Suitability for {result.soil_type}
              </h4>
              <div className="space-y-2">
                {result.alternative_crops_comparison.map((alt) => (
                  <div
                    key={alt.crop}
                    className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 border border-gray-100 text-xs"
                  >
                    <div>
                      <span className="font-extrabold text-gray-900 block">{alt.crop}</span>
                      <span className="text-[10px] text-gray-400">Duration: {alt.duration_days} days</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-forest-800 block">
                        {alt.expected_yield_q_per_acre} Q/acre
                      </span>
                      <span className="text-[10px] font-bold text-emerald-600">
                        {alt.suitability} Suitability
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => setCurrentStep(1)}
              className="px-5 py-2.5 rounded-xl border border-forest-200 text-xs font-bold text-forest-800 hover:bg-forest-50"
            >
              Start New Prediction
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
