import React from 'react';
import {
  BookOpen,
  Laptop,
  Server,
  Smartphone,
  Layers,
  Globe,
  Database,
} from 'lucide-react';

export const WebRtcGuideModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6 max-h-[90vh] overflow-y-auto text-slate-800 dark:text-slate-100 transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">TransferX MERN Architecture</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">How MERN Stack & WebRTC work together</p>
            </div>
          </div>
          <button
            id="close-guide-btn"
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 px-2 py-1 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Section 1: MERN Flow */}
        <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-3 font-sans">
          <p className="text-xs font-semibold uppercase tracking-wider text-indigo-400">
            1. MERN Stack & Signaling Flow
          </p>
          <div className="grid grid-cols-3 gap-2 text-center text-xs py-2">
            <div className="bg-slate-800 p-2.5 rounded-xl border border-slate-700">
              <Laptop className="w-5 h-5 mx-auto text-indigo-400 mb-1" />
              <p className="font-semibold text-slate-200">React Frontend</p>
              <p className="text-[10px] text-slate-400 mt-1">Peer UI & WebRTC Channel</p>
            </div>
            <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60 flex flex-col justify-center">
              <Server className="w-5 h-5 mx-auto text-amber-400 mb-1" />
              <p className="font-semibold text-slate-200">Node / Express</p>
              <p className="text-[10px] text-amber-300 mt-1">Socket.IO Matchmaker</p>
            </div>
            <div className="bg-slate-800 p-2.5 rounded-xl border border-slate-700">
              <Database className="w-5 h-5 mx-auto text-emerald-400 mb-1" />
              <p className="font-semibold text-slate-200">MongoDB</p>
              <p className="text-[10px] text-emerald-300 mt-1">Transfer History & Rooms</p>
            </div>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            The Express server pairs users via 6-digit codes. When Peer A sends, they exchange SDP and ICE candidates through Socket.IO. MongoDB stores transfer history records and room validity. The file bytes flow directly peer-to-peer!
          </p>
        </div>

        {/* Section 2: Flow Control */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            2. High Speed 64 KB Binary Streaming
          </h4>
          <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 space-y-2 leading-relaxed">
            <p>
              • <strong>Chunking:</strong> Files are sliced into 64 KB binary packets and transmitted directly over the WebRTC DataChannel.
            </p>
            <p>
              • <strong>Backpressure:</strong> If the network gets saturated, chunk sending pauses until the buffer drains, preventing browser crashes.
            </p>
          </div>
        </div>

        {/* Section 3: Testing */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
            <Globe className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            3. How to Test
          </h4>
          <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 space-y-2 leading-relaxed">
            <p>
              1. Open <strong>http://localhost:5173</strong> in two browser windows or tabs.
            </p>
            <p>
              2. On Window 1: Select files in the <strong>Send</strong> tab. A 6-digit code will appear.
            </p>
            <p>
              3. On Window 2: Enter the 6-digit code in the <strong>Receive</strong> tab.
            </p>
            <p>
              4. Watch the progress bar transfer files at maximum local speed, and check the <strong>History</strong> modal to see the record saved in MongoDB!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
