import React from 'react';
import { motion } from 'motion/react';
import {
  Upload,
  Download,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  StopCircle,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { formatBytes, formatSpeed, formatTimeRemaining } from '../utils/formatters';
import { FileIcon } from './FileIcon';

export const TransferProgress = ({
  fileName,
  fileSize,
  fileType,
  status,
  progress,
  direction = 'send',
  onCancel,
  onReset,
  errorMessage,
}) => {
  const isSend = direction === 'send';
  const percentage = progress?.percentage ?? (status === 'completed' ? 100 : 0);
  const bytesTransferred = progress?.bytesTransferred ?? (status === 'completed' ? fileSize : 0);
  const speed = progress?.speed ?? 0;
  const timeRemaining = progress?.timeRemaining ?? 0;

  const isTransferring = status === 'transferring';
  const isConnecting = status === 'connecting';
  const isWaiting = status === 'waiting';
  const isConnected = status === 'connected';
  const isCompleted = status === 'completed';
  const isFailed = status === 'failed';
  const isCancelled = status === 'cancelled';

  // 1. Clean Human Design for COMPLETED State
  if (isCompleted) {
    return (
      <div
        id="transfer-completed-card"
        className="p-6 sm:p-7 bg-white rounded-2xl border border-slate-200/80 shadow-xs text-center space-y-4 animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Subtle Checkmark Badge */}
        <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100">
          <CheckCircle2 className="w-6 h-6 stroke-[2.2]" />
        </div>

        <div>
          <h3 className="text-base font-semibold text-slate-900 tracking-tight">
            {isSend ? 'Transfer completed' : 'File received'}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
            {isSend
              ? `"${progress?.currentFileName || fileName}" was delivered directly to the receiver.`
              : `"${progress?.currentFileName || fileName}" was saved successfully.`}
          </p>
        </div>

        {/* Quiet File Strip */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-left">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-white border border-slate-200/80 flex items-center justify-center shrink-0">
              <FileIcon mimeType={fileType} filename={fileName} size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-800 truncate max-w-[200px] sm:max-w-[260px]">
                {progress?.currentFileName || fileName}
              </p>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                <span>{formatBytes(fileSize)}</span>
                <span>·</span>
                <span>Direct Transfer X</span>
              </div>
            </div>
          </div>
          <span className="text-xs font-semibold text-emerald-600 shrink-0">
            100%
          </span>
        </div>

        {/* Integrated Action Button */}
        {onReset && (
          <div className="pt-1">
            <button
              id="send-another-file-btn"
              type="button"
              onClick={onReset}
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 active:scale-[0.99] text-white text-xs font-semibold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{isSend ? 'Send more files' : 'Receive another file'}</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  // 2. Clean Human Design for ACTIVE TRANSFER & CONNECTING States
  return (
    <div
      id="transfer-progress-card"
      className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-5 text-slate-900 transition-colors"
    >
      {/* Header: File info & quiet status */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center shrink-0">
            <FileIcon mimeType={fileType} filename={fileName} size={20} />
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-semibold text-slate-900 truncate max-w-[220px] sm:max-w-xs">
              {progress?.currentFileName || fileName}
            </h4>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
              <span>{formatBytes(fileSize)}</span>
              {progress?.totalFiles && progress.totalFiles > 1 && (
                <>
                  <span>·</span>
                  <span>
                    File {progress.currentFileIndex || 1} of {progress.totalFiles}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Quiet inline status text (no loud pill capsules) */}
        <div className="shrink-0 text-xs">
          {isWaiting && (
            <span className="text-amber-600 font-medium flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              Waiting for receiver...
            </span>
          )}
          {isConnecting && (
            <span className="text-indigo-600 font-medium flex items-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Connecting...
            </span>
          )}
          {isConnected && (
            <span className="text-indigo-600 font-medium flex items-center gap-1.5">
              Connected, starting...
            </span>
          )}
          {isTransferring && (
            <span className="text-slate-900 font-semibold tabular-nums">
              {percentage}%
            </span>
          )}
          {isFailed && (
            <span className="text-rose-600 font-medium flex items-center gap-1">
              <XCircle className="w-3.5 h-3.5" />
              Transfer failed
            </span>
          )}
          {isCancelled && (
            <span className="text-slate-500 font-medium flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              Cancelled
            </span>
          )}
        </div>
      </div>

      {/* Slim, Minimalist Progress Bar */}
      <div className="space-y-2">
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full transition-all ${
              isFailed
                ? 'bg-rose-500'
                : isCancelled
                ? 'bg-slate-400'
                : 'bg-indigo-600'
            }`}
            style={{ width: `${Math.max(percentage, isTransferring ? 3 : 0)}%` }}
            initial={{ width: 0 }}
            animate={{ width: `${Math.max(percentage, isTransferring ? 3 : 0)}%` }}
            transition={{ ease: 'easeOut', duration: 0.2 }}
          />
        </div>

        {/* Clean, readable metadata row */}
        <div className="flex justify-between items-center text-xs text-slate-500 tabular-nums">
          <span>
            {formatBytes(bytesTransferred)} of {formatBytes(fileSize)}
          </span>
          {isTransferring && speed > 0 && (
            <span className="text-slate-600 font-medium">
              {formatSpeed(speed)} · {formatTimeRemaining(timeRemaining)} remaining
            </span>
          )}
        </div>
      </div>

      {/* Error message callout if present */}
      {errorMessage && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-700 text-xs flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
          <p className="leading-relaxed">{errorMessage}</p>
        </div>
      )}

      {/* Footer: Quiet security label & clean cancel button */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-100">
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
          <span>Encrypted Transfer X</span>
        </div>

        {onCancel && (isTransferring || isConnecting || isWaiting || isConnected) && (
          <button
            id="cancel-transfer-btn"
            type="button"
            onClick={onCancel}
            className="text-xs text-slate-400 hover:text-rose-600 font-medium transition-colors cursor-pointer"
          >
            Cancel transfer
          </button>
        )}

        {(isFailed || isCancelled) && onReset && (
          <button
            id="retry-transfer-btn"
            type="button"
            onClick={onReset}
            className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold transition-colors cursor-pointer"
          >
            Try again
          </button>
        )}
      </div>
    </div>
  );
};
