/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { GESTURE_DEFINITIONS } from '../utils/gestureDefinitions';
import { GestureType } from '../types/gestures';
import { BookOpen, Sparkles, CheckCircle2 } from 'lucide-react';
import { AppTheme } from '../types/theme';

interface GestureGuideProps {
  currentDetectedGestures: GestureType[];
  theme?: AppTheme;
}

export const GestureGuide: React.FC<GestureGuideProps> = ({ currentDetectedGestures, theme = 'black' }) => {
  const [selectedGestureId, setSelectedGestureId] = useState<GestureType>('Open Palm');
  const isDark = theme === 'black';

  const activeDef =
    GESTURE_DEFINITIONS.find((g) => g.id === selectedGestureId) || GESTURE_DEFINITIONS[0];

  const isCurrentActiveDetected = currentDetectedGestures.includes(activeDef.id);

  return (
    <div
      className={`rounded-2xl p-5 sm:p-6 border transition-colors ${
        isDark
          ? 'bg-[#0f0f10] border-neutral-800 text-white shadow-xl'
          : 'bg-white border-slate-200 text-slate-900 shadow-sm'
      }`}
    >
      {/* Title */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b mb-5 ${isDark ? 'border-neutral-800' : 'border-slate-200'}`}>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className={`w-4 h-4 ${isDark ? 'text-white' : 'text-slate-900'}`} />
            <h3 className="text-base sm:text-lg font-bold">Gesture Reference Guide</h3>
          </div>
          <p className={`text-xs ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
            Click any gesture below to inspect criteria. When detected by camera, gestures and finger guides glow in <span className="text-blue-400 font-semibold">blue</span>.
          </p>
        </div>

        {currentDetectedGestures.length > 0 && (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/40 text-blue-400 text-xs font-mono font-semibold self-start sm:self-auto">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
            <span>Active: {currentDetectedGestures.join(', ')}</span>
          </div>
        )}
      </div>

      {/* Small Buttons Row (replaces previous large buttons) */}
      <div className="flex flex-wrap gap-2 mb-5">
        {GESTURE_DEFINITIONS.map((def) => {
          const isCurrentlyDetected = currentDetectedGestures.includes(def.id);
          const isSelected = selectedGestureId === def.id;

          return (
            <button
              key={def.id}
              onClick={() => setSelectedGestureId(def.id)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-all relative inline-flex items-center gap-2 cursor-pointer ${
                isCurrentlyDetected
                  ? 'bg-blue-600/20 border-blue-500 text-blue-400 font-bold shadow-[0_0_12px_rgba(59,130,246,0.45)] ring-1 ring-blue-500'
                  : isSelected
                  ? isDark
                    ? 'bg-neutral-800 border-white text-white font-semibold'
                    : 'bg-slate-900 border-slate-900 text-white font-semibold shadow-xs'
                  : isDark
                  ? 'bg-black border-neutral-800 text-neutral-300 hover:border-neutral-700 hover:text-white'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300 hover:text-slate-900'
              }`}
            >
              <span className="text-sm">{def.icon}</span>
              <span className="truncate">{def.name}</span>
              {isCurrentlyDetected && (
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-blue-500 text-white font-extrabold tracking-wide animate-pulse">
                  DETECTED
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Deep-Dive Spec Card for Selected Gesture */}
      <div
        className={`rounded-xl border p-4 sm:p-5 space-y-4 transition-all ${
          isCurrentActiveDetected
            ? 'border-blue-500/60 shadow-[0_0_16px_rgba(59,130,246,0.2)] ' + (isDark ? 'bg-black/90' : 'bg-blue-50/30')
            : isDark
            ? 'bg-black border-neutral-800'
            : 'bg-slate-50 border-slate-200'
        }`}
      >
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b ${isDark ? 'border-neutral-800' : 'border-slate-200'}`}>
          <div className="flex items-center gap-3">
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center text-2xl border transition-all ${
                isCurrentActiveDetected
                  ? 'bg-blue-500/20 border-blue-500 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.3)]'
                  : isDark
                  ? 'bg-neutral-900 border-neutral-800 text-white'
                  : 'bg-white border-slate-200 text-slate-900'
              }`}
            >
              {activeDef.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-base sm:text-lg font-bold">{activeDef.name}</h4>
                <span
                  className={`text-xs font-mono px-2 py-0.5 rounded border ${
                    isCurrentActiveDetected
                      ? 'bg-blue-500/10 border-blue-500 text-blue-400 font-bold'
                      : isDark
                      ? 'bg-neutral-900 border-neutral-700 text-neutral-300'
                      : 'bg-white border-slate-200 text-slate-700'
                  }`}
                >
                  {activeDef.badge}
                </span>
                {isCurrentActiveDetected && (
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-blue-400">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
                    Live Detected
                  </span>
                )}
              </div>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                {activeDef.summary}
              </p>
            </div>
          </div>
        </div>

        {/* Target Finger Configuration Guide with Blue Detection Accent */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className={`text-xs font-semibold flex items-center gap-1.5 ${isCurrentActiveDetected ? 'text-blue-400' : isDark ? 'text-neutral-300' : 'text-slate-700'}`}>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Finger Position Matrix & Guide</span>
            </div>
            {isCurrentActiveDetected && (
              <span className="text-[11px] font-mono text-blue-400 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping inline-block" />
                Detected in Blue
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {Object.entries(activeDef.fingerConfig).map(([fingerName, state]) => {
              const isUp = state === 'Extended' || state === 'Upward';
              const isDown = state === 'Folded' || state === 'Downward';

              // When detected or extended, highlight with vibrant blue color as requested
              const useBlueHighlight = isCurrentActiveDetected || isUp;

              return (
                <div
                  key={fingerName}
                  className={`border p-2.5 rounded-lg text-center transition-all ${
                    useBlueHighlight
                      ? isDark
                        ? 'bg-blue-950/30 border-blue-500/60 shadow-[0_0_8px_rgba(59,130,246,0.15)]'
                        : 'bg-blue-50 border-blue-400 shadow-xs'
                      : isDark
                      ? 'bg-neutral-900 border-neutral-800'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <div
                    className={`text-[11px] font-medium capitalize ${
                      useBlueHighlight ? 'text-blue-300 font-bold' : isDark ? 'text-neutral-300' : 'text-slate-700'
                    }`}
                  >
                    {fingerName}
                  </div>
                  <div
                    className={`text-[10px] font-mono font-bold mt-1 ${
                      useBlueHighlight
                        ? 'text-blue-400'
                        : isDown
                        ? 'text-neutral-400'
                        : 'text-neutral-500'
                    }`}
                  >
                    {state.toUpperCase()}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
