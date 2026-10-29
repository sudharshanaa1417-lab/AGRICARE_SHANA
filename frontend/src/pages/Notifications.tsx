import React from 'react';
import { Bell, CheckCheck, Trash2, AlertTriangle, Info, CheckCircle2, AlertOctagon } from 'lucide-react';
import { useIoT } from '../context/IoTContext';

export const Notifications: React.FC = () => {
  const { notifications, markNotificationRead, clearNotifications } = useIoT();

  const getSeverityIcon = (sev: string) => {
    switch (sev) {
      case 'critical':
        return <AlertOctagon size={20} className="text-rose-600" />;
      case 'warning':
        return <AlertTriangle size={20} className="text-amber-600" />;
      default:
        return <Info size={20} className="text-blue-600" />;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Title & Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
            <Bell className="text-forest-700" size={24} />
            In-App Alerts & Notifications Center
          </h1>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            Sensor threshold breaches, valve actuations, and pest diagnosis alerts
          </p>
        </div>

        {notifications.length > 0 && (
          <button
            onClick={clearNotifications}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <Trash2 size={14} />
            Clear All
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-3xl p-6 border border-forest-100 shadow-xs space-y-3">
        {notifications.length > 0 ? (
          notifications.map((n) => (
            <div
              key={n.id}
              onClick={() => markNotificationRead(n.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                n.read
                  ? 'bg-gray-50/50 border-gray-100 text-gray-500'
                  : 'bg-forest-50/40 border-forest-200/80 text-gray-900 shadow-2xs'
              }`}
            >
              <div className="mt-0.5 shrink-0">{getSeverityIcon(n.severity)}</div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold">{n.title}</h4>
                  <span className="text-[10px] text-gray-400 font-mono">
                    {new Date(n.created_at).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-gray-600">{n.message}</p>
              </div>

              {!n.read && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 self-center" />
              )}
            </div>
          ))
        ) : (
          <div className="py-12 text-center text-gray-400 text-xs space-y-2">
            <CheckCircle2 size={36} className="mx-auto text-emerald-500 mb-2" />
            <span className="font-bold text-gray-700 block">No Active Alerts</span>
            <p className="text-[11px] text-gray-400">
              All sensors and automated thresholds are operating normally.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
