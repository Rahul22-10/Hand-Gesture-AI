/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { GestureHistoryItem } from '../types/gestures';
import {
  Search,
  X,
  Trash2,
  Download,
  History,
  MoreVertical,
  CheckSquare,
  Square,
  Hand,
  Clock,
  Filter,
} from 'lucide-react';
import { GESTURE_DEFINITIONS } from '../utils/gestureDefinitions';
import { AppTheme } from '../types/theme';

interface GestureHistoryProps {
  history: GestureHistoryItem[];
  onClearHistory: () => void;
  onDeleteItem?: (id: string) => void;
  onDeleteItems?: (ids: string[]) => void;
  theme?: AppTheme;
}

export const GestureHistory: React.FC<GestureHistoryProps> = ({
  history,
  onClearHistory,
  onDeleteItem,
  onDeleteItems,
  theme = 'black',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const isDark = theme === 'black';

  // Filter history based on search query (by gesture name, handedness, or time)
  const filteredHistory = useMemo(() => {
    if (!searchQuery.trim()) return history;
    const q = searchQuery.toLowerCase().trim();
    return history.filter(
      (item) =>
        item.gesture.toLowerCase().includes(q) ||
        item.handedness.toLowerCase().includes(q) ||
        item.timestamp.toLowerCase().includes(q) ||
        item.extendedFingers.toLowerCase().includes(q)
    );
  }, [history, searchQuery]);

  // Group filtered history by Date string (like Google Chrome History)
  const groupedHistory = useMemo(() => {
    const groups: { [dateStr: string]: GestureHistoryItem[] } = {};

    filteredHistory.forEach((item) => {
      // Default to "Today" or extract date
      const dateKey = 'Today';
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(item);
    });

    return groups;
  }, [filteredHistory]);

  // Checkbox Selection Logic
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredHistory.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredHistory.map((item) => item.id));
    }
  };

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return;
    if (onDeleteItems) {
      onDeleteItems(selectedIds);
    } else if (onDeleteItem) {
      selectedIds.forEach((id) => onDeleteItem(id));
    } else if (selectedIds.length === history.length) {
      onClearHistory();
    }
    setSelectedIds([]);
  };

  const handleDeleteSingle = (id: string) => {
    if (onDeleteItem) {
      onDeleteItem(id);
    } else if (onDeleteItems) {
      onDeleteItems([id]);
    }
    setSelectedIds((prev) => prev.filter((i) => i !== id));
    setActiveMenuId(null);
  };

  const handleExportJSON = () => {
    if (history.length === 0) return;
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(history, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `gesture-recognition-history-${Date.now()}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const allSelected =
    filteredHistory.length > 0 && selectedIds.length === filteredHistory.length;

  return (
    <div
      className={`rounded-2xl border transition-colors shadow-sm overflow-hidden ${
        isDark
          ? 'bg-[#0f0f10] border-neutral-800 text-white'
          : 'bg-white border-slate-200 text-slate-900'
      }`}
      style={{ fontFamily: 'var(--font-sans)' }}
    >
      {/* Google Chrome Style Top Header Bar */}
      <div
        className={`px-5 py-4 border-b flex flex-col md:flex-row md:items-center justify-between gap-4 ${
          isDark ? 'bg-black border-neutral-800' : 'bg-slate-50 border-slate-200'
        }`}
      >
        {/* Left: Google History Brand / Title */}
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
              isDark ? 'bg-neutral-800 text-white' : 'bg-slate-200 text-slate-800'
            }`}
          >
            <History className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold tracking-tight">
              History
            </h2>
          </div>
        </div>

        {/* Center: Google Chrome Style Rounded Search Bar */}
        <div className="flex-1 max-w-xl mx-auto w-full">
          <div className="relative">
            <Search
              className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${
                isDark ? 'text-neutral-400' : 'text-slate-400'
              }`}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search history"
              className={`w-full py-2 pl-10 pr-9 text-xs sm:text-sm rounded-full border transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                isDark
                  ? 'bg-neutral-900 border-neutral-700 text-white placeholder:text-neutral-500 focus:bg-neutral-850'
                  : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 shadow-inner'
              }`}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white cursor-pointer"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Right: Actions (Export & Clear History) */}
        <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
          <button
            type="button"
            onClick={handleExportJSON}
            disabled={history.length === 0}
            className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-40 ${
              isDark
                ? 'bg-neutral-900 hover:bg-neutral-800 border-neutral-700 text-neutral-300'
                : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700'
            }`}
            title="Export history as JSON"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>

          <button
            type="button"
            onClick={onClearHistory}
            disabled={history.length === 0}
            className="px-3 py-1.5 rounded-lg border text-xs font-semibold text-rose-500 bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/30 transition-colors cursor-pointer disabled:opacity-40 flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear history</span>
          </button>
        </div>
      </div>

      {/* Google Chrome Style Floating / Inset Selection Bar (When items selected) */}
      {selectedIds.length > 0 && (
        <div
          className={`px-5 py-2.5 border-b flex items-center justify-between transition-all ${
            isDark
              ? 'bg-blue-950/40 border-blue-500/30 text-blue-300'
              : 'bg-blue-50 border-blue-200 text-blue-800'
          }`}
        >
          <div className="flex items-center gap-3 text-xs font-semibold">
            <span>{selectedIds.length} items selected</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedIds([])}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                isDark
                  ? 'hover:bg-neutral-800 text-neutral-300'
                  : 'hover:bg-blue-100 text-slate-700'
              }`}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeleteSelected}
              className="px-3 py-1 rounded-md text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-colors cursor-pointer flex items-center gap-1 shadow-sm"
            >
              <Trash2 className="w-3 h-3" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      )}

      {/* Google History Content Body */}
      <div className="p-4 sm:p-6 space-y-6">
        {filteredHistory.length === 0 ? (
          <div className="py-16 text-center">
            <div
              className={`w-14 h-14 mx-auto rounded-full flex items-center justify-center mb-3 ${
                isDark ? 'bg-neutral-900 text-neutral-500' : 'bg-slate-100 text-slate-400'
              }`}
            >
              <History className="w-7 h-7 stroke-[1.5]" />
            </div>
            <p className="text-sm font-semibold text-neutral-300">
              {searchQuery
                ? 'No matching results found'
                : 'Your recognition history appears here'}
            </p>
            <p className={`text-xs mt-1 ${isDark ? 'text-neutral-500' : 'text-slate-400'}`}>
              {searchQuery
                ? `No gestures matched "${searchQuery}"`
                : 'Gestures identified by your camera will be logged here chronologically'}
            </p>
          </div>
        ) : (
          Object.entries(groupedHistory).map(([dateLabel, items]) => (
            <div key={dateLabel} className="space-y-3">
              {/* Date Group Heading (like Google Chrome History) */}
              <div className="flex items-center justify-between px-1">
                <h3
                  className={`text-xs sm:text-sm font-bold tracking-tight ${
                    isDark ? 'text-neutral-300' : 'text-slate-700'
                  }`}
                >
                  {dateLabel}
                </h3>
                <span className={`text-[11px] font-mono ${isDark ? 'text-neutral-500' : 'text-slate-400'}`}>
                  {items.length} {items.length === 1 ? 'event' : 'events'}
                </span>
              </div>

              {/* Items Card List (Google History Row Style) */}
              <div
                className={`rounded-xl border overflow-hidden divide-y transition-colors ${
                  isDark
                    ? 'bg-black border-neutral-800 divide-neutral-800/80'
                    : 'bg-white border-slate-200 divide-slate-100 shadow-xs'
                }`}
              >
                {items.map((item) => {
                  const def = GESTURE_DEFINITIONS.find((d) => d.id === item.gesture);
                  const isChecked = selectedIds.includes(item.id);

                  return (
                    <div
                      key={item.id}
                      className={`group px-3.5 py-2.5 flex items-center gap-3 transition-colors ${
                        isChecked
                          ? isDark
                            ? 'bg-blue-950/25'
                            : 'bg-blue-50/60'
                          : isDark
                          ? 'hover:bg-neutral-900/60'
                          : 'hover:bg-slate-50'
                      }`}
                    >
                      {/* Checkbox (Google Style) */}
                      <button
                        type="button"
                        onClick={() => handleToggleSelect(item.id)}
                        className="p-1 rounded cursor-pointer text-neutral-400 hover:text-white"
                        title={isChecked ? 'Deselect' : 'Select'}
                      >
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-blue-500" />
                        ) : (
                          <Square className="w-4 h-4 text-neutral-500 group-hover:text-neutral-300" />
                        )}
                      </button>

                      {/* Timestamp (e.g. 16:42:15) */}
                      <span
                        className={`text-xs font-mono tabular-nums shrink-0 w-18 ${
                          isDark ? 'text-neutral-400' : 'text-slate-500'
                        }`}
                      >
                        {item.timestamp}
                      </span>

                      {/* Icon / Favicon badge */}
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-base shrink-0 border ${
                          isDark
                            ? 'bg-neutral-900 border-neutral-700/80 text-white'
                            : 'bg-slate-100 border-slate-200 text-slate-800'
                        }`}
                      >
                        {def?.icon || '✋'}
                      </div>

                      {/* Gesture Name (Title link style like Google History) */}
                      <div className="flex-1 min-w-0 flex items-center gap-2 flex-wrap">
                        <span className="text-xs sm:text-sm font-semibold truncate hover:underline cursor-default">
                          {item.gesture}
                        </span>

                        {/* Handedness Badge */}
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${
                            item.handedness === 'Right'
                              ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                              : 'bg-purple-500/10 border-purple-500/30 text-purple-400'
                          }`}
                        >
                          {item.handedness}
                        </span>

                        {/* Fingers metadata */}
                        <span
                          className={`text-[11px] truncate hidden sm:inline ${
                            isDark ? 'text-neutral-500' : 'text-slate-400'
                          }`}
                        >
                          · Fingers: {item.extendedFingers}
                        </span>
                      </div>

                      {/* Confidence Score Pill */}
                      <div className="shrink-0 text-right">
                        <span
                          className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                            item.confidence >= 0.85
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                              : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                          }`}
                        >
                          {Math.round(item.confidence * 100)}%
                        </span>
                      </div>

                      {/* Delete action / Three dots menu on right (Google Chrome style) */}
                      <div className="relative shrink-0">
                        <button
                          type="button"
                          onClick={() => handleDeleteSingle(item.id)}
                          className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 cursor-pointer"
                          title="Remove from history"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
