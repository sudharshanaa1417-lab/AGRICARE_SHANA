import React from 'react';
import { HelpCircle, Phone, BookOpen, GitBranch, Cloud, ExternalLink, Cpu, CheckCircle2 } from 'lucide-react';

export const HelpSupport: React.FC = () => {
  return (
    <div className="space-y-6 pb-12">
      {/* Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
          <HelpCircle className="text-forest-700" size={24} />
          Help, Agricultural Helplines & Deployment Guide
        </h1>
        <p className="text-xs text-gray-500 font-medium mt-0.5">
          Emergency agronomic support contacts, hardware troubleshooting, and GitHub $\rightarrow$ Vercel $\rightarrow$ Render deployment steps
        </p>
      </div>

      {/* Emergency Agronomic Helplines */}
      <div className="bg-gradient-to-r from-forest-800 to-forest-900 rounded-3xl p-6 text-white shadow-md space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white/10 rounded-2xl">
            <Phone size={24} className="text-emerald-300" />
          </div>
          <div>
            <span className="text-[10px] font-bold tracking-wider uppercase text-emerald-300">
              Government Agricultural Extension
            </span>
            <h3 className="text-lg font-extrabold">National Kisan Call Center (KCC)</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
          <div className="p-3.5 bg-forest-950/50 rounded-2xl border border-white/10 space-y-1">
            <span className="text-forest-300 font-semibold block">Toll-Free Helpline (All India)</span>
            <span className="text-xl font-black font-mono text-emerald-400">1800-180-1551</span>
            <p className="text-[11px] text-gray-300">Available 6:00 AM to 10:00 PM across all 22 scheduled languages.</p>
          </div>

          <div className="p-3.5 bg-forest-950/50 rounded-2xl border border-white/10 space-y-1">
            <span className="text-forest-300 font-semibold block">Krishi Vigyan Kendra (KVK) Network</span>
            <span className="text-base font-extrabold text-white">731+ KVK Centers</span>
            <p className="text-[11px] text-gray-300">District-level farm scientists for soil testing, seed trials, and pest confirmation.</p>
          </div>
        </div>
      </div>

      {/* Step-by-Step Deployment Guide: GitHub -> Vercel -> Render */}
      <div className="bg-white rounded-3xl p-6 border border-forest-100 shadow-xs space-y-5">
        <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
          <GitBranch size={20} className="text-forest-700" />
          <h3 className="text-base font-extrabold text-gray-900">
            Step-by-Step Cloud Deployment Architecture
          </h3>
        </div>

        <div className="space-y-4 text-xs text-gray-600">
          {/* Step 1 */}
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-2">
            <div className="flex items-center gap-2 text-forest-950 font-bold text-sm">
              <span className="w-6 h-6 rounded-full bg-forest-700 text-white flex items-center justify-center text-xs">1</span>
              <span>Push Codebase to GitHub</span>
            </div>
            <p>
              Your GitHub account: <code className="font-mono bg-white px-2 py-0.5 rounded border text-forest-800">https://github.com/sudharshanaa1417-lab</code>.
              Push this complete monorepo containing <code className="font-mono">frontend/</code>, <code className="font-mono">backend/</code>, and <code className="font-mono">arduino/</code>.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-2">
            <div className="flex items-center gap-2 text-forest-950 font-bold text-sm">
              <span className="w-6 h-6 rounded-full bg-forest-700 text-white flex items-center justify-center text-xs">2</span>
              <span>Deploy Backend on Render (https://render.com)</span>
            </div>
            <p>
              Create a new <strong>Web Service</strong> connected to your repository:
            </p>
            <ul className="list-disc pl-5 space-y-1 font-mono text-[11px] text-gray-700">
              <li>Root Directory: <strong>backend</strong></li>
              <li>Runtime: <strong>Python 3</strong></li>
              <li>Build Command: <strong>pip install -r requirements.txt</strong></li>
              <li>Start Command: <strong>uvicorn app.main:app --host 0.0.0.0 --port $PORT</strong></li>
              <li>Environment Variable: <strong>DEVICE_API_KEY</strong> = <code className="text-forest-700">agricare_live_secret_key_2026</code></li>
            </ul>
            <p className="text-[11px] text-emerald-800 bg-emerald-50 p-2 rounded-xl border border-emerald-200">
              Render will assign a live URL: <code className="font-mono font-bold">https://agricare-backend.onrender.com</code>.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-2">
            <div className="flex items-center gap-2 text-forest-950 font-bold text-sm">
              <span className="w-6 h-6 rounded-full bg-forest-700 text-white flex items-center justify-center text-xs">3</span>
              <span>Deploy Frontend PWA on Vercel (https://vercel.com)</span>
            </div>
            <p>
              Import your repository in Vercel:
            </p>
            <ul className="list-disc pl-5 space-y-1 font-mono text-[11px] text-gray-700">
              <li>Root Directory: <strong>frontend</strong></li>
              <li>Framework Preset: <strong>Vite</strong></li>
              <li>Environment Variable: <strong>VITE_API_BASE_URL</strong> = (your Render URL from step 2)</li>
            </ul>
          </div>

          {/* Step 4 */}
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-2">
            <div className="flex items-center gap-2 text-forest-950 font-bold text-sm">
              <span className="w-6 h-6 rounded-full bg-forest-700 text-white flex items-center justify-center text-xs">4</span>
              <span>Flash NodeMCU ESP8266 Arduino Sketch</span>
            </div>
            <p>
              Open <code className="font-mono text-forest-700">arduino/AgriCare_ESP8266.ino</code> and update:
            </p>
            <pre className="p-3 bg-gray-900 text-emerald-400 rounded-xl font-mono text-[11px] overflow-x-auto">
{`const char* WIFI_SSID     = "YOUR_WIFI_NAME";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";
const char* RENDER_URL    = "https://YOUR-APP-NAME.onrender.com";
const char* API_KEY       = "agricare_live_secret_key_2026";`}
            </pre>
            <p className="text-[11px] text-gray-500">
              The NodeMCU will automatically upload sensor data to Render every 5 seconds and execute valve commands without any direct cables to the user app!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
