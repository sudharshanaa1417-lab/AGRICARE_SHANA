import React, { useState } from 'react';
import { X, Phone, Lock, User, MapPin, Globe, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { LanguageCode } from '../types';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, login, register } = useAuth();
  const { language, setLanguage, availableLanguages } = useLanguage();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [phone, setPhone] = useState('9876543210');
  const [otp, setOtp] = useState('123456');
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Register fields
  const [name, setName] = useState('');
  const [state, setState] = useState('Tamil Nadu');
  const [district, setDistrict] = useState('Coimbatore');
  const [village, setVillage] = useState('Thondamuthur');
  const [pincode, setPincode] = useState('641109');
  const [farmName, setFarmName] = useState('Sri Amman Agro Farm');
  const [farmSize, setFarmSize] = useState(2.5);

  if (!isAuthModalOpen) return null;

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length < 10) {
      setError('Please enter a valid 10-digit mobile number.');
      return;
    }
    setOtpSent(true);
  };

  const handleVerifyLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (otp.length < 4) {
      setError('Please enter the 6-digit OTP received.');
      return;
    }
    await login(phone, otp);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (pincode.length !== 6) {
      setError('Please enter a valid 6-digit Indian PIN code.');
      return;
    }
    await register({
      name,
      phone,
      state,
      district,
      village,
      pincode,
      preferred_lang: language,
      farm_name: farmName,
      farm_size_acres: farmSize,
      role: 'farmer'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-forest-100 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto relative">
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:bg-gray-100 transition-colors"
        >
          <X size={18} />
        </button>

        {/* Brand Header */}
        <div className="text-center space-y-1">
          <img src="/logo.svg" alt="AgriCare" className="w-12 h-12 mx-auto" />
          <h2 className="text-2xl font-black text-forest-950 tracking-tight">
            Agri<span className="text-forest-600">Care</span>
          </h2>
          <p className="text-[11px] text-earth-800 font-extrabold tracking-wide uppercase">
            Grow Smarter. Farm Better. Harvest More.
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="flex bg-gray-100 p-1 rounded-2xl text-xs font-bold">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(null); }}
            className={`flex-1 py-2 rounded-xl transition-all ${
              mode === 'login' ? 'bg-white shadow-xs text-forest-800' : 'text-gray-500'
            }`}
          >
            Farmer Sign In
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(null); }}
            className={`flex-1 py-2 rounded-xl transition-all ${
              mode === 'register' ? 'bg-white shadow-xs text-forest-800' : 'text-gray-500'
            }`}
          >
            Register Farm
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Login Form with OTP */}
        {mode === 'login' && (
          <form onSubmit={otpSent ? handleVerifyLogin : handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Mobile Number (+91)
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="9876543210"
                  disabled={otpSent}
                  className="w-full px-3.5 py-2.5 pl-9 rounded-xl border border-gray-200 text-xs font-mono font-semibold focus:ring-2 focus:ring-forest-500 disabled:bg-gray-50"
                />
                <Phone size={15} className="absolute left-3 top-3 text-gray-400" />
              </div>
            </div>

            {otpSent && (
              <div className="space-y-2 animate-in fade-in">
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Enter 6-Digit OTP Code
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="123456"
                    className="w-full px-3.5 py-2.5 pl-9 rounded-xl border border-gray-200 text-xs font-mono font-extrabold tracking-widest focus:ring-2 focus:ring-forest-500"
                  />
                  <Lock size={15} className="absolute left-3 top-3 text-gray-400" />
                </div>
                <div className="flex items-center justify-between text-[11px] text-gray-400">
                  <span>Demo test code: <strong>123456</strong></span>
                  <button
                    type="button"
                    onClick={() => setOtpSent(false)}
                    className="text-forest-700 hover:underline font-semibold"
                  >
                    Change Phone
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-forest-700 hover:bg-forest-800 text-white font-extrabold text-xs shadow-md transition-all active:scale-95"
            >
              {otpSent ? 'Verify OTP & Enter AgriCare' : 'Send Verification OTP'}
            </button>
          </form>
        )}

        {/* Registration Form */}
        {mode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-gray-700 mb-0.5">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ramesh Kumar"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold focus:ring-2 focus:ring-forest-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-0.5">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="9876543210"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold focus:ring-2 focus:ring-forest-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-0.5">PIN Code</label>
                <input
                  type="text"
                  required
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="641109"
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold focus:ring-2 focus:ring-forest-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-0.5">State</label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold focus:ring-2 focus:ring-forest-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-0.5">District</label>
                <input
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold focus:ring-2 focus:ring-forest-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-0.5">Farm Name</label>
                <input
                  type="text"
                  value={farmName}
                  onChange={(e) => setFarmName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold focus:ring-2 focus:ring-forest-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-0.5">Farm Size (Acres)</label>
                <input
                  type="number"
                  step="0.5"
                  value={farmSize}
                  onChange={(e) => setFarmSize(parseFloat(e.target.value) || 1.0)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold focus:ring-2 focus:ring-forest-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-3 rounded-2xl bg-forest-700 hover:bg-forest-800 text-white font-extrabold text-xs shadow-md transition-all active:scale-95"
            >
              Complete Registration & Enter
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
