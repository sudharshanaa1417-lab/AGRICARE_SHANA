import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, User, MapPin, Globe, Cpu, 
  ShieldCheck, Database, Save, RotateCcw, AlertTriangle, Check 
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { useIoT } from '../context/IoTContext';
import { 
  getApiBaseUrl, setApiBaseUrl, getDeviceId, setDeviceId, 
  getDeviceApiKey, setDeviceApiKey 
} from '../services/api';

export const Settings: React.FC = () => {
  const { language, setLanguage, availableLanguages, t } = useLanguage();
  const { user, updateProfile } = useAuth();
  const { isDemoMode, toggleDemoMode } = useIoT();

  // Profile state
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [state, setState] = useState(user?.state || '');
  const [district, setDistrict] = useState(user?.district || '');
  const [village, setVillage] = useState(user?.village || '');
  const [pincode, setPincode] = useState(user?.pincode || '');
  const [farmName, setFarmName] = useState(user?.farm_name || '');
  const [farmSize, setFarmSize] = useState(user?.farm_size_acres || 2.5);
  const [role, setRole] = useState(user?.role || 'farmer');

  // IoT device configuration
  const [apiUrl, setApiUrl] = useState(getApiBaseUrl());
  const [devId, setDevId] = useState(getDeviceId());
  const [apiKey, setApiKey] = useState(getDeviceApiKey());
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiBaseUrl(apiUrl);
    setDeviceId(devId);
    setDeviceApiKey(apiKey);

    await updateProfile({
      name,
      phone,
      state,
      district,
      village,
      pincode,
      farm_name: farmName,
      farm_size_acres: farmSize,
      preferred_lang: language,
      role: role as any
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
          <SettingsIcon className="text-forest-700" size={24} />
          System Settings & Farm Gateway Configuration
        </h1>
        <p className="text-xs text-gray-500 font-medium mt-0.5">
          Configure your personal profile, Render backend API URL, NodeMCU IoT credentials, and UI language
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <Check size={18} className="text-emerald-600" />
          Settings successfully saved and synchronized!
        </div>
      )}

      <form onSubmit={handleSaveAll} className="space-y-6">
        {/* Section 1: Cloud & IoT Hardware Connection Settings (Render & ESP8266) */}
        <div className="bg-white rounded-3xl p-6 border border-forest-100 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
            <Cpu size={20} className="text-forest-700" />
            <h3 className="text-sm font-extrabold text-gray-900">
              Render Cloud Backend & ESP8266 Device Provisioning
            </h3>
          </div>

          <p className="text-xs text-gray-500 leading-relaxed">
            Provide the live deployed Render backend URL here. Your frontend will seamlessly fetch telemetry and dispatch commands to this endpoint without rebuilding.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Backend API Base URL (Render Cloud)
              </label>
              <input
                type="url"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder="https://YOUR-APP-NAME.onrender.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-mono font-semibold focus:ring-2 focus:ring-forest-500"
              />
              <span className="text-[10px] text-gray-400 mt-1 block">
                Default: http://localhost:8000 or your Render web service URL
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Hardware Device Identifier (Device ID)
              </label>
              <input
                type="text"
                value={devId}
                onChange={(e) => setDevId(e.target.value)}
                placeholder="esp8266-01"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-mono font-semibold focus:ring-2 focus:ring-forest-500"
              />
              <span className="text-[10px] text-gray-400 mt-1 block">
                Must match DEVICE_ID in your Arduino sketch
              </span>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Device Secret Key (X-API-Key Header)
              </label>
              <input
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="agricare_live_secret_key_2026"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-mono font-semibold focus:ring-2 focus:ring-forest-500"
              />
              <span className="text-[10px] text-gray-400 mt-1 block">
                Configured on Render environment variable DEVICE_API_KEY
              </span>
            </div>
          </div>

          {/* Demo Mode Toggle */}
          <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-gray-800 block">
                Simulator / Demo Mode
              </span>
              <span className="text-[11px] text-gray-400">
                Use built-in realistic mock telemetry when hardware is powered off
              </span>
            </div>
            <button
              type="button"
              onClick={() => toggleDemoMode(!isDemoMode)}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                isDemoMode ? 'bg-amber-500' : 'bg-gray-300'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                  isDemoMode ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Section 2: Personal Farmer Profile & Role */}
        <div className="bg-white rounded-3xl p-6 border border-forest-100 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
            <User size={20} className="text-forest-700" />
            <h3 className="text-sm font-extrabold text-gray-900">
              Personal Farmer Profile & Farm Management
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold focus:ring-2 focus:ring-forest-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Mobile Phone (OTP Verified)</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold focus:ring-2 focus:ring-forest-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">User Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold focus:ring-2 focus:ring-forest-500"
              >
                <option value="farmer">Farmer (Standard Field Access)</option>
                <option value="manager">Farm Manager (Multi-Field Supervisor)</option>
                <option value="admin">Administrator (System & Model Config)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-1">
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
              <label className="block text-xs font-bold text-gray-700 mb-1">Village / Locality</label>
              <input
                type="text"
                value={village}
                onChange={(e) => setVillage(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold focus:ring-2 focus:ring-forest-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Postal PIN Code</label>
              <input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold focus:ring-2 focus:ring-forest-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Farm Name</label>
              <input
                type="text"
                value={farmName}
                onChange={(e) => setFarmName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold focus:ring-2 focus:ring-forest-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Farm Acreage (Acres)</label>
              <input
                type="number"
                step="0.5"
                value={farmSize}
                onChange={(e) => setFarmSize(parseFloat(e.target.value) || 1.0)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold focus:ring-2 focus:ring-forest-500"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Interface Language Selection (7 Languages) */}
        <div className="bg-white rounded-3xl p-6 border border-forest-100 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
            <Globe size={20} className="text-forest-700" />
            <h3 className="text-sm font-extrabold text-gray-900">
              Preferred Interface Language (7 Indian Languages Supported)
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
            {availableLanguages.map((l) => (
              <button
                key={l.code}
                type="button"
                onClick={() => setLanguage(l.code)}
                className={`p-3 rounded-2xl border text-center transition-all ${
                  language === l.code
                    ? 'border-forest-700 bg-forest-50 text-forest-900 ring-1 ring-forest-700 font-extrabold'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-forest-300 font-medium'
                }`}
              >
                <span className="block text-sm">{l.native}</span>
                <span className="text-[10px] text-gray-400">{l.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Save CTA */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-forest-700 hover:bg-forest-800 text-white font-extrabold text-xs shadow-md transition-all active:scale-95"
          >
            <Save size={16} />
            {t('save_settings')}
          </button>
        </div>
      </form>
    </div>
  );
};
