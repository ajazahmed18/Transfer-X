import React, { useState, useEffect } from 'react';
import {
  Settings,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  Laptop,
  Trash2,
  CheckCircle2,
} from 'lucide-react';
import {
  isSoundEnabled,
  setSoundEnabled,
  playInitiatedSound,
} from '../utils/sound';
import { useTheme } from '../hooks/useTheme';

export const SettingsModal = ({ isOpen, onClose }) => {
  const { theme, setTheme } = useTheme();
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 text-slate-900 dark:text-slate-100 transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-100 dark:border-indigo-900/60">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Settings</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">App preferences & settings</p>
            </div>
          </div>
          <button
            id="close-settings-btn"
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 text-sm font-medium rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Theme Settings Selector */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 space-y-2.5">
          <div>
            <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">Appearance</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Select your preferred color theme
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1">
            <button
              id="theme-light-btn"
              type="button"
              onClick={() => setTheme('light')}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                theme === 'light'
                  ? 'bg-white dark:bg-slate-800 border-indigo-600 text-indigo-600 dark:text-indigo-400 shadow-xs ring-2 ring-indigo-500/20 font-semibold'
                  : 'bg-white/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span>Light</span>
            </button>

            <button
              id="theme-dark-btn"
              type="button"
              onClick={() => setTheme('dark')}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                theme === 'dark'
                  ? 'bg-white dark:bg-slate-800 border-indigo-600 text-indigo-600 dark:text-indigo-400 shadow-xs ring-2 ring-indigo-500/20 font-semibold'
                  : 'bg-white/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Moon className="w-3.5 h-3.5 text-indigo-400" />
              <span>Dark</span>
            </button>

            <button
              id="theme-system-btn"
              type="button"
              onClick={() => setTheme('system')}
              className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                theme === 'system'
                  ? 'bg-white dark:bg-slate-800 border-indigo-600 text-indigo-600 dark:text-indigo-400 shadow-xs ring-2 ring-indigo-500/20 font-semibold'
                  : 'bg-white/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Laptop className="w-3.5 h-3.5 text-slate-500" />
              <span>System</span>
            </button>
          </div>
        </div>

        {/* Audio Notifications */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">Sound Notifications</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Gentle audio chimes on transfer start and completion
            </p>
          </div>
          <button
            id="toggle-sound-btn"
            type="button"
            onClick={handleToggleSound}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
              soundOn
                ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400'
                : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
            }`}
          >
            {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>

        {/* Clear Storage & Database */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">Clear Transfer Logs</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Wipe recorded transfer history from MongoDB and browser
              </p>
            </div>
            <button
              id="settings-clear-history-btn"
              type="button"
              onClick={handleClearHistory}
              className="px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-medium hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          </div>
          {clearedNotice && (
            <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 pt-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Transfer history cleared!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
