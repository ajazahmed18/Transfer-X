import React, { useState, useEffect } from 'react';
import {
  Settings,
  Volume2,
  VolumeX,
  Trash2,
  CheckCircle2,
} from 'lucide-react';
import {
  isSoundEnabled,
  setSoundEnabled,
  playInitiatedSound,
} from '../utils/sound';

export const SettingsModal = ({ isOpen, onClose }) => {
  const [soundOn, setSoundOn] = useState(true);
  const [clearedNotice, setClearedNotice] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSoundOn(isSoundEnabled());
      setClearedNotice(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggleSound = () => {
    const nextVal = !soundOn;
    setSoundOn(nextVal);
    setSoundEnabled(nextVal);
    if (nextVal) {
      playInitiatedSound();
    }
  };

  const handleClearHistory = async () => {
    try {
      // Clear from MongoDB backend
      await fetch('/api/transfers', { method: 'DELETE' });
    } catch (e) {}

    // Clear local cache
    try {
      localStorage.removeItem('peerdrop_history');
    } catch (e) {}

    setClearedNotice(true);
    setTimeout(() => setClearedNotice(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 text-slate-900 transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Settings</h3>
              <p className="text-xs text-slate-500">App preferences & settings</p>
            </div>
          </div>
          <button
            id="close-settings-btn"
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 text-sm font-medium rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Audio Notifications */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-slate-900">Sound Notifications</p>
            <p className="text-[11px] text-slate-500">
              Gentle audio chimes on transfer start and completion
            </p>
          </div>
          <button
            id="toggle-sound-btn"
            type="button"
            onClick={handleToggleSound}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
              soundOn
                ? 'bg-indigo-50 border-indigo-200 text-indigo-600'
                : 'bg-slate-100 border-slate-200 text-slate-400'
            }`}
          >
            {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>

        {/* Clear Storage & Database */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-900">Clear Transfer Logs</p>
              <p className="text-[11px] text-slate-500">
                Wipe recorded transfer history from MongoDB and browser
              </p>
            </div>
            <button
              id="settings-clear-history-btn"
              type="button"
              onClick={handleClearHistory}
              className="px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-600 text-xs font-medium hover:bg-rose-100 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          </div>
          {clearedNotice && (
            <p className="text-xs text-emerald-600 flex items-center gap-1 pt-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Transfer history cleared!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
