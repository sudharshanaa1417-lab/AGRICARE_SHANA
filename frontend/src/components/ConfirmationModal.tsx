import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel,
  isDestructive = false,
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl p-6 max-w-sm w-full border border-gray-100 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className={`p-2.5 rounded-2xl ${isDestructive ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'}`}>
            <AlertTriangle size={22} />
          </div>
          <button
            onClick={onCancel}
            className="p-1 rounded-full text-gray-400 hover:bg-gray-100"
          >
            <X size={18} />
          </button>
        </div>

        <div>
          <h3 className="text-base font-extrabold text-gray-900 leading-tight">
            {title}
          </h3>
          <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
            {message}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2.5 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="py-2.5 px-4 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onCancel();
            }}
            className={`py-2.5 px-4 rounded-xl text-xs font-bold text-white shadow-sm transition-all ${
              isDestructive
                ? 'bg-rose-600 hover:bg-rose-700'
                : 'bg-forest-700 hover:bg-forest-800'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
