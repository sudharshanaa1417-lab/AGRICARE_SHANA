import React, { useState } from 'react';
import { 
  Sparkles, Camera, UploadCloud, CheckCircle2, AlertOctagon, 
  HelpCircle, ShieldCheck, Leaf, ExternalLink, Settings, RefreshCw, X 
} from 'lucide-react';
import { MultiImageUploader } from '../components/MultiImageUploader';
import { CameraModal } from '../components/CameraModal';
import { diagnoseCropImages } from '../services/api';
import { MultiImageDiagnosis } from '../types';

export const AiCropDoctor: React.FC = () => {
  const [crop, setCrop] = useState('tomato');
  const [part, setPart] = useState('leaf');
  const [images, setImages] = useState<File[]>([]);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [diagnosis, setDiagnosis] = useState<MultiImageDiagnosis | null>(null);
  const [configDrawerOpen, setConfigDrawerOpen] = useState(false);

  // Custom model config state
  const [customEndpoint, setCustomEndpoint] = useState(
    () => localStorage.getItem('agricare_custom_ai_endpoint') || ''
  );
  const [customModelVersion, setCustomModelVersion] = useState(
    () => localStorage.getItem('agricare_custom_ai_version') || 'AgriCare-EdgeVision-v2.5'
  );

  const handleCapture = (file: File) => {
    setImages((prev) => [...prev, file].slice(0, 8));
  };

  const handleDiagnose = async () => {
    if (images.length === 0) return;
    setIsAnalyzing(true);
    try {
      const res = await diagnoseCropImages(crop, part, images);
      setDiagnosis(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const saveModelConfig = () => {
    localStorage.setItem('agricare_custom_ai_endpoint', customEndpoint.trim());
    localStorage.setItem('agricare_custom_ai_version', customModelVersion.trim());
    setConfigDrawerOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Config Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
            <Sparkles className="text-forest-700" size={24} />
            AI Crop Doctor & Disease Diagnostics
          </h1>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            Computer vision plant pathology engine with verified IPM & extension remedies
          </p>
        </div>

        <button
          onClick={() => setConfigDrawerOpen(true)}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-forest-200 bg-white text-forest-800 text-xs font-bold hover:bg-forest-50 transition-colors shadow-2xs self-start sm:self-auto"
        >
          <Settings size={15} />
          Model Integration Settings
        </button>
      </div>

      {/* Dedicated Custom Model Integration Drawer */}
      {configDrawerOpen && (
        <div className="bg-white rounded-3xl p-5 border-2 border-forest-600/60 shadow-lg space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Settings size={18} className="text-forest-700" />
              <h3 className="text-sm font-extrabold text-gray-900">
                Custom Trained AI Model Endpoint Configuration
              </h3>
            </div>
            <button
              onClick={() => setConfigDrawerOpen(false)}
              className="p-1 rounded-full text-gray-400 hover:bg-gray-100"
            >
              <X size={16} />
            </button>
          </div>

          <p className="text-xs text-gray-600">
            You can connect your own trained TensorFlow / PyTorch / ONNX model inference service here.
            The backend forwards the images as multipart/form-data to your endpoint.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Model API Endpoint URL
              </label>
              <input
                type="url"
                value={customEndpoint}
                onChange={(e) => setCustomEndpoint(e.target.value)}
                placeholder="https://your-custom-ai-model.onrender.com/predict"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-mono focus:ring-2 focus:ring-forest-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Model Identifier & Version
              </label>
              <input
                type="text"
                value={customModelVersion}
                onChange={(e) => setCustomModelVersion(e.target.value)}
                placeholder="AgriCare-Vision-v2.5"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-mono focus:ring-2 focus:ring-forest-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              onClick={() => setConfigDrawerOpen(false)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              onClick={saveModelConfig}
              className="px-4 py-2 rounded-xl bg-forest-700 text-white text-xs font-bold hover:bg-forest-800 transition-colors"
            >
              Save Model Configuration
            </button>
          </div>
        </div>
      )}

      {/* Multi-Image Upload & Camera Component */}
      <MultiImageUploader
        selectedCrop={crop}
        setSelectedCrop={setCrop}
        selectedPart={part}
        setSelectedPart={setPart}
        images={images}
        setImages={setImages}
        onOpenCamera={() => setIsCameraOpen(true)}
        onRunDiagnosis={handleDiagnose}
        isAnalyzing={isAnalyzing}
      />

      {/* Detailed Pathology Report */}
      {diagnosis && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Summary Banner */}
          <div
            className={`p-6 rounded-3xl border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
              diagnosis.overall_health === 'Healthy'
                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                : 'bg-rose-50/80 border-rose-200 text-rose-950'
            }`}
          >
            <div className="flex items-center gap-3">
              {diagnosis.overall_health === 'Healthy' ? (
                <CheckCircle2 size={32} className="text-emerald-600 shrink-0" />
              ) : (
                <AlertOctagon size={32} className="text-rose-600 shrink-0" />
              )}
              <div>
                <span className="text-[11px] font-bold tracking-wider uppercase opacity-75">
                  Overall Diagnosis Result
                </span>
                <h2 className="text-xl font-extrabold leading-tight">
                  {diagnosis.overall_health === 'Healthy'
                    ? 'Crop Canopy Healthy & Vigorous'
                    : 'Crop Distress / Pathogen Identified'}
                </h2>
                <p className="text-xs font-medium mt-0.5 opacity-90">
                  {diagnosis.summary}
                </p>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="text-[10px] uppercase font-bold text-gray-500 block">
                Model Engine Used
              </span>
              <span className="text-xs font-bold font-mono text-gray-800">
                {diagnosis.results[0]?.model_version || 'AgriCare-Vision-v2.5'}
              </span>
            </div>
          </div>

          {/* Individual Image Breakdown */}
          <div className="space-y-4">
            <h3 className="text-base font-extrabold text-gray-900">
              Individual Photograph Diagnoses ({diagnosis.results.length} Image Results)
            </h3>

            {diagnosis.results.map((item, idx) => (
              <div
                key={idx}
                className="bg-white rounded-3xl p-6 border border-forest-100 shadow-xs space-y-4"
              >
                {/* Result Title & Health Badge */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-forest-700 bg-forest-50 px-2.5 py-0.5 rounded-full border border-forest-200">
                      Sample #{idx + 1} • {item.crop} ({item.plant_part})
                    </span>
                    <h4 className="text-lg font-extrabold text-gray-900 mt-1">
                      {item.disease_name}
                    </h4>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <span className="text-[10px] text-gray-400 block font-medium">
                        Model Confidence
                      </span>
                      <span className="text-sm font-extrabold font-mono text-forest-800">
                        {item.confidence}%
                      </span>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-extrabold ${
                        item.health_status === 'Healthy'
                          ? 'bg-emerald-100 text-emerald-800'
                          : item.health_status === 'Unhealthy'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {item.health_status}
                    </span>
                  </div>
                </div>

                {/* Visible Symptoms */}
                <div>
                  <h5 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Visible Symptoms Observed
                  </h5>
                  <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-2xl border border-gray-100">
                    {item.symptoms}
                  </p>
                </div>

                {/* Two Distinct Treatment Sections: Option 1 (Scientific IPM) & Option 2 (Home Remedies) */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-1">
                  {/* Option 1: Scientific Treatment & IPM */}
                  <div className="bg-forest-50/70 rounded-2xl p-4 border border-forest-200/80 space-y-2">
                    <div className="flex items-center gap-2">
                      <ShieldCheck size={18} className="text-forest-700" />
                      <span className="text-xs font-extrabold text-forest-950 uppercase tracking-wider">
                        Option 1: Scientific IPM Treatment
                      </span>
                    </div>
                    <p className="text-xs text-forest-900 leading-relaxed">
                      {item.scientific_recommendation}
                    </p>
                    <div className="text-[10px] text-forest-700/80 pt-1 font-medium">
                      ⚠️ Follow approved product labels, safety PPE, and harvest intervals.
                    </div>
                  </div>

                  {/* Option 2: Home Remedies & Low-Cost Cultural Practices */}
                  <div className="bg-amber-50/70 rounded-2xl p-4 border border-amber-200/80 space-y-2">
                    <div className="flex items-center gap-2">
                      <Leaf size={18} className="text-amber-800" />
                      <span className="text-xs font-extrabold text-amber-950 uppercase tracking-wider">
                        Option 2: Verified Cultural & Low-Cost Practices
                      </span>
                    </div>
                    <p className="text-xs text-amber-900 leading-relaxed">
                      {item.home_remedy}
                    </p>
                    <div className="text-[10px] text-amber-700/80 pt-1 font-medium">
                      🌱 Verified organic extension guidance. Never apply unverified caustic mixtures.
                    </div>
                  </div>
                </div>

                {/* Source Organization Citations */}
                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-gray-400 border-t border-gray-100">
                  <div className="flex items-center gap-1.5">
                    <ExternalLink size={13} className="text-forest-600" />
                    <span>Scientific Reference: <strong>{item.sources}</strong></span>
                  </div>
                  <span className="text-[10px] text-gray-400 mt-1 sm:mt-0">
                    Diagnosed: {new Date(item.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Camera Capture Modal */}
      <CameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCapture}
      />
    </div>
  );
};
