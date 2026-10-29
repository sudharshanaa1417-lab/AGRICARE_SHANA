import React, { useState, useEffect } from 'react';
import { 
  History, Download, Printer, Filter, Calendar, 
  Cpu, Droplets, Bot, Sparkles, CheckCircle2 
} from 'lucide-react';
import { fetchAuditLogs, getApiBaseUrl, getDeviceId } from '../services/api';
import { AuditRecord } from '../types';

export const HistoryReports: React.FC = () => {
  const [logs, setLogs] = useState<AuditRecord[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadLogs(selectedCategory);
  }, [selectedCategory]);

  const loadLogs = async (cat: string) => {
    setLoading(true);
    try {
      const data = await fetchAuditLogs(cat);
      setLogs(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    const baseUrl = getApiBaseUrl();
    const deviceId = getDeviceId();
    window.open(`${baseUrl}/api/history/export/csv?device_id=${deviceId}`, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'IoT':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Hardware':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'AI':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Robot':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="space-y-6 pb-12 print:p-0">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:hidden">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
            <History className="text-forest-700" size={24} />
            Unified Farm History & Diagnostic Audit Records
          </h1>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            Immutable chronological logging of telemetry events, valve actions, AI diagnoses, and robot runs
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 text-xs font-bold hover:bg-gray-50 shadow-2xs"
          >
            <Printer size={15} />
            Print Report
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-forest-700 text-white text-xs font-bold hover:bg-forest-800 shadow-sm"
          >
            <Download size={15} />
            Export CSV
          </button>
        </div>
      </div>

      {/* Printable Farm Header (Only visible on print) */}
      <div className="hidden print:block border-b-2 border-forest-800 pb-4 mb-6">
        <h1 className="text-2xl font-black text-forest-900">AgriCare Farm Audit & Diagnostic Report</h1>
        <p className="text-xs text-gray-600">Grow Smarter. Farm Better. Harvest More. • Generated: {new Date().toLocaleString()}</p>
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 print:hidden">
        {['ALL', 'IoT', 'Hardware', 'AI', 'Robot', 'User'].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors shrink-0 ${
              selectedCategory === cat
                ? 'bg-forest-700 text-white shadow-xs'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-forest-50'
            }`}
          >
            {cat} Events
          </button>
        ))}
      </div>

      {/* Timeline List */}
      <div className="bg-white rounded-3xl p-6 border border-forest-100 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            Chronological Audit Feed ({logs.length} Records)
          </span>
          <span className="text-[11px] text-gray-400 font-mono">
            Device: {getDeviceId()}
          </span>
        </div>

        <div className="space-y-3">
          {logs.map((log) => (
            <div
              key={log.id}
              className="p-4 rounded-2xl bg-gray-50/70 border border-gray-100 hover:border-forest-200 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getCategoryBadge(
                      log.category
                    )}`}
                  >
                    {log.category}
                  </span>
                  <span className="font-extrabold text-gray-900">{log.action}</span>
                </div>
                <p className="text-gray-600 font-medium">{log.details}</p>
                <span className="text-[10px] text-gray-400 font-mono block">Actor: {log.actor}</span>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[11px] font-mono font-semibold text-gray-500">
                  {new Date(log.timestamp).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
