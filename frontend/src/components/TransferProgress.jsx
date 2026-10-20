import React from 'react';
import { motion } from 'motion/react';
import {
  Upload,
  Download,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Zap,
  Clock,
  HardDrive,
  Layers,
  StopCircle,
  ShieldCheck,
  Activity,
} from 'lucide-react';
import { formatBytes, formatSpeed, formatTimeRemaining } from '../utils/formatters';
import { FileIcon } from './FileIcon';

export const TransferProgress = ({
  fileName,
  fileSize,
  fileType,
  status,
  progress,
  direction,
  onCancel,
  errorMessage,
}) => {
  const isSend = direction === 'send';
  const percentage = progress?.percentage ?? (status === 'completed' ? 100 : 0);
  const bytesTransferred = progress?.bytesTransferred ?? (status === 'completed' ? fileSize : 0);
  const speed = progress?.speed ?? 0;
  const timeRemaining = progress?.timeRemaining ?? 0;
  const currentChunk = progress?.currentChunk ?? (status === 'completed' ? Math.ceil(fileSize / (64 * 1024)) : 0);
  const totalChunks = progress?.totalChunks ?? Math.max(1, Math.ceil(fileSize / (64 * 1024)));

  const isTransferring = status === 'transferring';
  const isConnecting = status === 'connecting';
  const isWaiting = status === 'waiting';
  const isConnected = status === 'connected';
  const isCompleted = status === 'completed';
  const isFailed = status === 'failed';
  const isCancelled = status === 'cancelled';

  // Status badge with icon & color
  const getStatusBadge = () => {
    if (isWaiting) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/80">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
          Waiting for peer...
        </span>
      );
    }
    if (isConnecting) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/80">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          WebRTC Handshake...
        </span>
      );
    }
    if (isConnected) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/80">
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
          Connected, preparing...
        </span>
      );
    }
    if (isTransferring) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80">
          <Activity className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 animate-pulse" />
          Transferring P2P
        </span>
      );
    }
    if (isCompleted) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800/80">
          <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
          Transfer Complete!
        </span>
      );
    }
    if (isFailed) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/80">
          <XCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
          Transfer Failed
        </span>
      );
    }
    if (isCancelled) {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
          <AlertTriangle className="w-3.5 h-3.5 text-slate-500" />
          Transfer Cancelled
        </span>
      );
    }
    return null;
  };

  return (
    <div
      id="transfer-progress-card"
      className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xl space-y-6 text-slate-900 dark:text-slate-100 transition-colors duration-150"
    >
      {/* Top Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/60 flex items-center justify-center shrink-0">
            <FileIcon mimeType={fileType} filename={fileName} size={26} />
          </div>
          <div className="min-w-0">
            <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 truncate max-w-xs sm:max-w-md">
              {progress?.currentFileName || fileName}
            </h4>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              <span>{formatBytes(fileSize)}</span>
              {progress?.totalFiles && progress.totalFiles > 1 && (
                <>
                  <span>•</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                    File {progress.currentFileIndex || 1} of {progress.totalFiles}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="shrink-0">{getStatusBadge()}</div>
      </div>

      {/* Main Progress Bar Area */}
      <div className="space-y-2">
        <div className="flex justify-between items-baseline text-xs font-semibold">
          <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
            {isSend ? (
              <Upload className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            ) : (
              <Download className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            )}
            <span>{isSend ? 'Uploading' : 'Receiving'} Progress</span>
          </span>
          <span className="text-xl font-mono font-bold text-indigo-600 dark:text-indigo-400 tracking-tight">
            {percentage}%
          </span>
        </div>

        {/* Outer Bar Track */}
        <div className="w-full h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200/80 dark:border-slate-700/80">
          <motion.div
            className={`h-full rounded-full transition-all relative ${
              isCompleted
                ? 'bg-gradient-to-r from-teal-500 to-emerald-500'
                : isFailed
                ? 'bg-gradient-to-r from-rose-500 to-red-600'
                : isCancelled
                ? 'bg-slate-400 dark:bg-slate-600'
                : 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-teal-500 animate-progress-stripes'
            }`}
            style={{ width: `${Math.max(percentage, isTransferring ? 3 : 0)}%` }}
            initial={{ width: 0 }}
            animate={{ width: `${Math.max(percentage, isTransferring ? 3 : 0)}%` }}
            transition={{ ease: 'easeOut', duration: 0.2 }}
          />
        </div>

        <div className="flex justify-between text-[11px] text-slate-400 dark:text-slate-500 font-mono">
          <span>{formatBytes(bytesTransferred)} transferred</span>
          <span>{formatBytes(fileSize)} total</span>
        </div>
      </div>

      {/* Metrics Row: Speed, ETA, Chunks */}
      <div className="grid grid-cols-3 gap-2.5 pt-1">
        <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
          <div className="flex items-center justify-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 font-medium mb-0.5">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Speed</span>
          </div>
          <p className="text-xs sm:text-sm font-bold font-mono text-slate-900 dark:text-slate-100">
            {isTransferring ? formatSpeed(speed) : isCompleted ? 'Complete' : '—'}
          </p>
        </div>

        <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
          <div className="flex items-center justify-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 font-medium mb-0.5">
            <Clock className="w-3.5 h-3.5 text-blue-500" />
            <span>ETA</span>
          </div>
          <p className="text-xs sm:text-sm font-bold font-mono text-slate-900 dark:text-slate-100">
            {isTransferring ? formatTimeRemaining(timeRemaining) : isCompleted ? '0s' : '—'}
          </p>
        </div>

        <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
          <div className="flex items-center justify-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 font-medium mb-0.5">
            <Layers className="w-3.5 h-3.5 text-indigo-500" />
            <span>Chunks</span>
          </div>
          <p className="text-xs sm:text-sm font-bold font-mono text-slate-900 dark:text-slate-100 truncate">
            {currentChunk} / {totalChunks}
          </p>
        </div>
      </div>

      {/* Error Message Box if Failed */}
      {errorMessage && (
        <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-200 text-xs flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
          <p className="leading-relaxed">{errorMessage}</p>
        </div>
      )}

      {/* Bottom Controls */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Encrypted Direct P2P</span>
        </div>

        {onCancel && (isTransferring || isConnecting || isWaiting || isConnected) && (
          <button
            id="cancel-transfer-btn"
            type="button"
            onClick={onCancel}
            className="px-3.5 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/60 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <StopCircle className="w-3.5 h-3.5" />
            <span>Cancel Transfer</span>
          </button>
        )}
      </div>
    </div>
  );
};
