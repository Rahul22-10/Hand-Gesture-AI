/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { HandDetectionResult } from '../types/gestures';
import { GESTURE_DEFINITIONS } from '../utils/gestureDefinitions';
import { CheckCircle2, Info, Hand } from 'lucide-react';
import { AppTheme } from '../types/theme';

interface GestureCardProps {
  detections: HandDetectionResult[];
  isStreaming: boolean;
  theme?: AppTheme;
}

export const GestureCard: React.FC<GestureCardProps> = ({ detections, isStreaming, theme = 'black' }) => {
  const isDark = theme === 'black';

  if (!isStreaming) {
    return (
      <div
        className={`rounded-2xl p-6 flex flex-col items-center justify-center text-center min-h-[360px] border transition-colors ${
          isDark
            ? 'bg-[#0f0f10] border-neutral-800 text-neutral-300'
            : 'bg-white border-slate-200 text-slate-600 shadow-sm'
        }`}
      >
        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 border ${
            isDark ? 'bg-neutral-900 border-neutral-800 text-neutral-500' : 'bg-slate-100 border-slate-200 text-slate-400'
          }`}
        >
          <Hand className="w-7 h-7" />
        </div>
        <h3 className={`text-lg font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Recognition Standby
        </h3>
        <p className="text-xs max-w-xs leading-relaxed">
          Start the camera to begin real-time gesture classification.
        </p>
      </div>
    );
  }

  if (detections.length === 0) {
    return (
      <div
        className={`rounded-2xl p-6 flex flex-col items-center justify-center text-center min-h-[360px] border transition-colors ${
          isDark
            ? 'bg-[#0f0f10] border-neutral-800 text-neutral-300'
            : 'bg-white border-slate-200 text-slate-600 shadow-sm'
        }`}
      >
        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 border animate-pulse ${
            isDark ? 'bg-neutral-900 border-neutral-700 text-white' : 'bg-slate-100 border-slate-300 text-slate-900'
          }`}
        >
          <Hand className="w-7 h-7" />
        </div>
        <h3 className={`text-lg font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Scanning for Hands
        </h3>
        <p className="text-xs max-w-xs leading-relaxed mb-4">
          Place your hand in front of the webcam within good lighting.
        </p>
        <div className={`text-xs font-mono ${isDark ? 'text-neutral-500' : 'text-slate-400'}`}>
          Status: Active · Waiting for landmark lock
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {detections.map((detection, index) => {
        const {
          handedness,
          gesture,
          confidence,
          fingerStates,
          extendedCount,
          criteriaMet,
          limitationNote,
        } = detection;

        const def = GESTURE_DEFINITIONS.find((d) => d.id === gesture);
        const isRight = handedness === 'Right';

        return (
          <div
            key={index}
            className={`rounded-2xl p-6 relative overflow-hidden border transition-colors ${
              isDark
                ? 'bg-[#0f0f10] border-neutral-800 text-white shadow-xl'
                : 'bg-white border-slate-200 text-slate-900 shadow-sm'
            }`}
          >
            {/* Top Row: Handedness & Confidence */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-mono font-semibold px-2.5 py-1 rounded-md border ${
                    isDark
                      ? isRight
                        ? 'bg-neutral-900 text-white border-neutral-700'
                        : 'bg-neutral-900 text-neutral-300 border-neutral-700'
                      : isRight
                      ? 'bg-slate-100 text-slate-900 border-slate-300 font-bold'
                      : 'bg-slate-100 text-slate-700 border-slate-300'
                  }`}
                >
                  {handedness.toUpperCase()} HAND
                </span>
                <span className={`text-xs font-mono ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                  {extendedCount} / 5 EXTENDED
                </span>
              </div>

              <div className="flex items-center gap-2">
                <div className={`w-20 rounded-full h-2 overflow-hidden ${isDark ? 'bg-neutral-800' : 'bg-slate-200'}`}>
                  <div
                    className={`h-full transition-all duration-200 ${
                      isDark ? 'bg-white' : 'bg-slate-900'
                    }`}
                    style={{ width: `${Math.round(confidence * 100)}%` }}
                  />
                </div>
                <span className="text-xs font-mono font-bold tabular-nums">
                  {Math.round(confidence * 100)}%
                </span>
              </div>
            </div>

            {/* Gesture Hero Representation */}
            <div
              className={`flex items-center gap-4 mb-5 pb-5 border-b ${
                isDark ? 'border-neutral-800' : 'border-slate-200'
              }`}
            >
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shrink-0 border ${
                  isDark
                    ? 'bg-neutral-900 border-neutral-800'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                {def?.icon || '✋'}
              </div>
              <div className="min-w-0">
                <div className={`text-xs font-medium tracking-wide uppercase mb-0.5 ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                  Detected Gesture
                </div>
                <h2 className="text-2xl font-extrabold tracking-tight truncate">
                  {gesture}
                </h2>
                <p className={`text-xs mt-1 line-clamp-1 ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                  {def?.summary || 'Custom finger configuration detected.'}
                </p>
              </div>
            </div>

            {/* 5 Finger State Badges */}
            <div className="mb-5">
              <div className={`text-xs font-medium mb-2.5 flex items-center justify-between ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                <span>Finger Extension Breakdown</span>
                <span className="font-mono text-[11px]">Knuckle-to-tip</span>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {fingerStates.map((finger) => (
                  <div
                    key={finger.name}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all ${
                      finger.isExtended
                        ? isDark
                          ? 'bg-neutral-800 border-neutral-600 text-white font-semibold'
                          : 'bg-slate-900 border-slate-900 text-white font-semibold'
                        : isDark
                        ? 'bg-neutral-950 border-neutral-800 text-neutral-500'
                        : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}
                  >
                    <span className="text-[11px] font-medium">{finger.name}</span>
                    <span
                      className={`text-[10px] font-mono mt-1 ${
                        finger.isExtended
                          ? isDark ? 'text-emerald-400 font-bold' : 'text-emerald-300 font-bold'
                          : isDark ? 'text-neutral-500' : 'text-slate-400'
                      }`}
                    >
                      {finger.isExtended ? 'EXTENDED' : 'FOLDED'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Classification Rationale */}
            <div className="space-y-2 mb-3">
              <div className={`text-xs font-medium ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                Classification Verification
              </div>
              <div
                className={`rounded-xl p-3 border space-y-1.5 ${
                  isDark ? 'bg-black border-neutral-800' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                {criteriaMet.map((criterion, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs">
                    <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`} />
                    <span>{criterion}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Natural Limitations Note if present */}
            {limitationNote && (
              <div
                className={`flex items-start gap-2 rounded-xl p-3 text-xs border ${
                  isDark
                    ? 'bg-neutral-900 border-neutral-700 text-neutral-300'
                    : 'bg-amber-50 border-amber-200 text-amber-800'
                }`}
              >
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <span className="font-semibold">Perspective Note: </span>
                  {limitationNote}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
