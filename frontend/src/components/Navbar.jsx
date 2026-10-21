import React from 'react';
import { Send, Download, Settings, History, Zap } from 'lucide-react';

export const Navbar = ({
  activeTab,
  setActiveTab,
  onOpenSettings,
  onOpenHistory,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3 transition-colors duration-150">
      <div className="max-w-xl mx-auto flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs">
            <Zap className="w-4 h-4 fill-current" />
          </div>
          <span className="font-bold text-slate-900 text-base tracking-tight">TransferX</span>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/70">
          <button
            id="nav-send-tab"
            type="button"
            onClick={() => setActiveTab('send')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'send'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send</span>
          </button>
          <button
            id="nav-receive-tab"
            type="button"
            onClick={() => setActiveTab('receive')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'receive'
                ? 'bg-white text-teal-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Receive</span>
          </button>
        </div>

        {/* Utility Controls */}
        <div className="flex items-center gap-1">
          <button
            id="history-btn"
            type="button"
            onClick={onOpenHistory}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Transfer History (MongoDB)"
          >
            <History className="w-4 h-4" />
          </button>

          <button
            id="settings-btn"
            type="button"
            onClick={onOpenSettings}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
