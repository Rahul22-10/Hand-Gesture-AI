/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { GESTURE_DEFINITIONS } from '../utils/gestureDefinitions';
import { GestureType } from '../types/gestures';
import { BookOpen } from 'lucide-react';
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

  return (
    <div
      className={`rounded-2xl p-6 border transition-colors ${
        isDark
          ? 'bg-[#0f0f10] border-neutral-800 text-white shadow-xl'
          : 'bg-white border-slate-200 text-slate-900 shadow-sm'
      }`}
    >
      {/* Title */}
      <div className={`flex items-center justify-between gap-4 pb-5 border-b mb-6 ${isDark ? 'border-neutral-800' : 'border-slate-200'}`}>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className={`w-5 h-5 ${isDark ? 'text-white' : 'text-slate-900'}`} />
            <h3 className="text-lg font-bold">Gesture Reference & Limitations Guide</h3>
          </div>
          <p className={`text-xs ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
            Comprehensive specifications for all 10 recognized hand gestures and their mathematical classification criteria
          </p>
        </div>
      </div>

      {/* Grid of 10 Gestures */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 mb-6">
        {GESTURE_DEFINITIONS.map((def) => {
          const isCurrentlyDetected = currentDetectedGestures.includes(def.id);
          const isSelected = selectedGestureId === def.id;

          return (
            <button
              key={def.id}
              onClick={() => setSelectedGestureId(def.id)}
              className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between min-h-[96px] cursor-pointer ${
                isSelected
                  ? isDark
                    ? 'bg-neutral-800 border-white text-white font-semibold'
                    : 'bg-slate-900 border-slate-900 text-white font-semibold shadow-xs'
                  : isDark
                  ? 'bg-black border-neutral-800 text-neutral-300 hover:border-neutral-700'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl">{def.icon}</span>
                {isCurrentlyDetected && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500 text-white font-bold animate-pulse">
                    LIVE
                  </span>
                )}
              </div>
              <div>
                <div className="text-xs font-semibold truncate mt-2">{def.name}</div>
                <div className={`text-[10px] font-mono mt-0.5 ${isSelected ? 'text-neutral-300' : isDark ? 'text-neutral-500' : 'text-slate-400'}`}>
                  {def.badge}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Deep-Dive Spec Card for Selected Gesture */}
      <div
        className={`rounded-xl border p-5 space-y-5 ${
          isDark ? 'bg-black border-neutral-800' : 'bg-slate-50 border-slate-200'
        }`}
      >
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b ${isDark ? 'border-neutral-800' : 'border-slate-200'}`}>
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center text-3xl border ${
                isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-slate-200'
              }`}
            >
              {activeDef.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-lg font-bold">{activeDef.name}</h4>
                <span
                  className={`text-xs font-mono px-2 py-0.5 rounded border ${
                    isDark
                      ? 'bg-neutral-900 border-neutral-700 text-neutral-300'
                      : 'bg-white border-slate-200 text-slate-700'
                  }`}
                >
                  {activeDef.badge}
                </span>
              </div>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                {activeDef.summary}
              </p>
            </div>
          </div>
        </div>

        {/* Target Finger Configuration */}
        <div>
          <div className={`text-xs font-medium mb-2 ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
            Finger Position Matrix
          </div>
          <div className="grid grid-cols-5 gap-2">
            {Object.entries(activeDef.fingerConfig).map(([fingerName, state]) => {
              const isUp = state === 'Extended' || state === 'Upward';
              const isDown = state === 'Folded' || state === 'Downward';
              return (
                <div
                  key={fingerName}
                  className={`border p-2.5 rounded-lg text-center ${
                    isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-slate-200'
                  }`}
                >
                  <div className={`text-[11px] font-medium capitalize ${isDark ? 'text-neutral-300' : 'text-slate-700'}`}>
                    {fingerName}
                  </div>
                  <div
                    className={`text-[10px] font-mono font-semibold mt-1 ${
                      isUp ? 'text-emerald-500 font-bold' : isDown ? 'text-neutral-400' : 'text-neutral-500'
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
