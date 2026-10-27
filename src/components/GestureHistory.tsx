/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { GestureHistoryItem } from '../types/gestures';
import { Trash2, Download, History, Filter } from 'lucide-react';
import { GESTURE_DEFINITIONS } from '../utils/gestureDefinitions';
import { AppTheme } from '../types/theme';

interface GestureHistoryProps {
  history: GestureHistoryItem[];
  onClearHistory: () => void;
  theme?: AppTheme;
}

export const GestureHistory: React.FC<GestureHistoryProps> = ({ history, onClearHistory, theme = 'black' }) => {
  const [filterGesture, setFilterGesture] = useState<string>('All');
  const isDark = theme === 'black';

  const filteredHistory = filterGesture === 'All'
    ? history
    : history.filter((item) => item.gesture === filterGesture);

  const handleExportJSON = () => {
    if (history.length === 0) return;
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(history, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `gesture-recognition-history-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div
      className={`rounded-2xl p-6 border transition-colors ${
        isDark
          ? 'bg-[#0f0f10] border-neutral-800 text-white shadow-xl'
          : 'bg-white border-slate-200 text-slate-900 shadow-sm'
      }`}
    >
      {/* Header */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b ${isDark ? 'border-neutral-800' : 'border-slate-200'}`}>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <History className={`w-5 h-5 ${isDark ? 'text-white' : 'text-slate-900'}`} />
            <h3 className="text-lg font-bold">Recognition History</h3>
          </div>
          <p className={`text-xs ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
            Recorded event log of identified gestures with millisecond timestamps
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Filter Dropdown */}
          <div className="relative">
            <select
              value={filterGesture}
              onChange={(e) => setFilterGesture(e.target.value)}
              className={`appearance-none text-xs py-1.5 pl-3 pr-8 rounded-lg cursor-pointer focus:outline-none border ${
                isDark
                  ? 'bg-neutral-900 border-neutral-700 text-white'
                  : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            >
              <option value="All">All Gestures ({history.length})</option>
              {GESTURE_DEFINITIONS.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
            <Filter className={`w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${isDark ? 'text-neutral-400' : 'text-slate-500'}`} />
          </div>

          <button
            onClick={handleExportJSON}
            disabled={history.length === 0}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border rounded-lg transition-colors cursor-pointer disabled:opacity-40 ${
              isDark
                ? 'bg-neutral-900 hover:bg-neutral-800 border-neutral-700 text-neutral-200'
                : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800'
            }`}
            title="Download logs as JSON"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>

          <button
            onClick={onClearHistory}
            disabled={history.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors cursor-pointer disabled:opacity-40 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 dark:border-rose-500/25 dark:text-rose-300"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear
          </button>
        </div>
      </div>

      {/* History Table / List */}
      {filteredHistory.length === 0 ? (
        <div className={`py-12 text-center text-xs ${isDark ? 'text-neutral-500' : 'text-slate-400'}`}>
          {history.length === 0
            ? 'No gesture events recorded yet. Perform gestures in front of the camera.'
            : 'No gestures match the selected filter.'}
        </div>
      ) : (
        <div className={`mt-4 max-h-80 overflow-y-auto divide-y ${isDark ? 'divide-neutral-800' : 'divide-slate-200'}`}>
          {filteredHistory.map((item) => {
            const def = GESTURE_DEFINITIONS.find((d) => d.id === item.gesture);

            return (
              <div
                key={item.id}
                className={`py-3 px-2 flex items-center justify-between gap-4 rounded-lg transition-colors ${
                  isDark ? 'hover:bg-neutral-900/60' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg border ${
                      isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    {def?.icon || '✋'}
                  </div>
                  <div>
                    <div className="text-sm font-semibold flex items-center gap-2">
                      <span>{item.gesture}</span>
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                          isDark
                            ? 'bg-neutral-900 border-neutral-700 text-neutral-300'
                            : 'bg-slate-100 border-slate-300 text-slate-700'
                        }`}
                      >
                        {item.handedness.toUpperCase()}
                      </span>
                    </div>
                    <div className={`text-[11px] font-mono mt-0.5 ${isDark ? 'text-neutral-500' : 'text-slate-400'}`}>
                      Fingers: {item.extendedFingers}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className={`text-xs font-mono font-medium tabular-nums ${isDark ? 'text-neutral-300' : 'text-slate-700'}`}>
                    {item.timestamp}
                  </div>
                  <div className={`text-[11px] font-mono mt-0.5 tabular-nums ${isDark ? 'text-emerald-400' : 'text-emerald-600 font-bold'}`}>
                    {Math.round(item.confidence * 100)}% match
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
