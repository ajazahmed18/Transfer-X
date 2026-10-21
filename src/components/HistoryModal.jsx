import React, { useState, useEffect } from 'react';
import {
  History,
  Trash2,
  Download,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileBox,
  Database,
  RefreshCw,
} from 'lucide-react';
import { formatBytes } from '../utils/formatters';
import { FileIcon } from './FileIcon';

export const HistoryModal = ({ isOpen, onClose }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isMongoSource, setIsMongoSource] = useState(false);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      // 1. Try to fetch from MongoDB API
      const res = await fetch('/api/transfers');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setHistory(data);
          setIsMongoSource(true);
          setLoading(false);
          return;
        }
      }
    } catch (e) {
      console.warn('[HistoryModal] Backend API offline, loading localStorage', e);
    }

    // 2. Fallback to localStorage
    try {
      const raw = localStorage.getItem('peerdrop_history');
      if (raw) {
        setHistory(JSON.parse(raw));
        setIsMongoSource(false);
      } else {
        setHistory([]);
      }
    } catch (e) {
      setHistory([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      fetchHistory();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClearHistory = async () => {
    try {
      // Clear from MongoDB
      await fetch('/api/transfers', { method: 'DELETE' });
    } catch (e) {}

    // Clear from localStorage
    try {
      localStorage.removeItem('peerdrop_history');
    } catch (e) {}

    setHistory([]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto text-slate-900 dark:text-slate-100 transition-colors">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center border border-teal-100 dark:border-teal-900/60">
              <History className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Transfer History</h3>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80 flex items-center gap-1">
                  <Database className="w-2.5 h-2.5" />
                  {isMongoSource ? 'MongoDB Connected' : 'Local Storage'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Past transmissions with Transfer X</p>
            </div>
          </div>
          <button
            id="close-history-btn"
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 px-2 py-1 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 dark:text-slate-500 flex flex-col items-center gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-indigo-500" />
            <p className="text-xs">Loading transfers from database...</p>
          </div>
        ) : history.length === 0 ? (
          <div className="py-12 text-center text-slate-400 dark:text-slate-500 space-y-2">
            <FileBox className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600 stroke-1" />
            <p className="text-sm font-medium">No transfer history yet</p>
            <p className="text-xs text-slate-400 dark:text-slate-500">Files you send or receive will appear here</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
              <span>{history.length} Transfers Recorded</span>
              <button
                id="clear-history-btn"
                type="button"
                onClick={handleClearHistory}
                className="text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 font-medium inline-flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                Clear History
              </button>
            </div>

            <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
              {history.map((item, idx) => {
                const dateVal = item.createdAt || item.timestamp;
                const dateStr = dateVal
                  ? new Date(dateVal).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      month: 'short',
                      day: 'numeric',
                    })
                  : 'Recent';

                return (
                  <div
                    key={item._id || item.id || idx}
                    className="p-3.5 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center shrink-0">
                        <FileIcon mimeType={item.fileType || ''} filename={item.fileName} size={18} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-900 dark:text-slate-100 truncate max-w-[200px] sm:max-w-[260px]">
                          {item.fileName}
                        </p>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          <span>{formatBytes(item.fileSize)}</span>
                          <span>•</span>
                          <span className="font-mono text-indigo-600 dark:text-indigo-400">Code: {item.code}</span>
                          <span>•</span>
                          <span>{dateStr}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {item.direction === 'send' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-medium text-[11px]">
                          <ArrowUpRight className="w-3 h-3" />
                          Sent
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 font-medium text-[11px]">
                          <ArrowDownLeft className="w-3 h-3" />
                          Received
                        </span>
                      )}

                      {item.status === 'completed' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" title="Completed" />
                      ) : item.status === 'failed' ? (
                        <XCircle className="w-4 h-4 text-rose-500" title="Failed" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-500" title="Cancelled" />
                      )}

                      {item.downloadUrl && (
                        <a
                          href={item.downloadUrl}
                          download={item.fileName}
                          className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
                          title="Save again"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
