/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { GESTURE_DEFINITIONS } from '../utils/gestureDefinitions';
import { GestureType } from '../types/gestures';
import { BookOpen, Sparkles, CheckCircle2, Zap } from 'lucide-react';
import { AppTheme } from '../types/theme';
import { get3DGestureImage } from '../utils/gesture3DMap';

interface GestureGuideProps {
  currentDetectedGestures: GestureType[];
  theme?: AppTheme;
}

// Unique color palette — each gesture gets its own distinct color
const GESTURE_COLORS: Record<string, {
  bg: string;        // button background (detected)
  border: string;    // border color
  text: string;      // text color (detected)
  glow: string;      // box-shadow glow
  badge: string;     // badge bg
  idleBg: string;    // resting background tint
  idleText: string;  // resting text
  finger: string;    // finger card highlight color
}> = {
  'Open Palm':     { bg: '#7c3aed', border: '#a855f7', text: '#fff', glow: '0 0 20px rgba(167,139,250,0.7)', badge: '#6d28d9', idleBg: '#3b1f6e22', idleText: '#a78bfa', finger: '#7c3aed' },
  'Closed Fist':   { bg: '#dc2626', border: '#f87171', text: '#fff', glow: '0 0 20px rgba(248,113,113,0.7)', badge: '#b91c1c', idleBg: '#6b1c1c22', idleText: '#fca5a5', finger: '#dc2626' },
  'Thumbs Up':     { bg: '#16a34a', border: '#4ade80', text: '#fff', glow: '0 0 20px rgba(74,222,128,0.7)',  badge: '#15803d', idleBg: '#14532d22', idleText: '#86efac', finger: '#16a34a' },
  'Thumbs Down':   { bg: '#ea580c', border: '#fb923c', text: '#fff', glow: '0 0 20px rgba(251,146,60,0.7)',  badge: '#c2410c', idleBg: '#7c2d1222', idleText: '#fdba74', finger: '#ea580c' },
  'Peace Sign':    { bg: '#0891b2', border: '#22d3ee', text: '#fff', glow: '0 0 20px rgba(34,211,238,0.7)',  badge: '#0e7490', idleBg: '#164e6322', idleText: '#67e8f9', finger: '#0891b2' },
  'One Finger':    { bg: '#d97706', border: '#fbbf24', text: '#fff', glow: '0 0 20px rgba(251,191,36,0.7)',  badge: '#b45309', idleBg: '#78350f22', idleText: '#fde68a', finger: '#d97706' },
  'Two Fingers':   { bg: '#0284c7', border: '#38bdf8', text: '#fff', glow: '0 0 20px rgba(56,189,248,0.7)',  badge: '#0369a1', idleBg: '#0c4a6e22', idleText: '#7dd3fc', finger: '#0284c7' },
  'Three Fingers': { bg: '#db2777', border: '#f472b6', text: '#fff', glow: '0 0 20px rgba(244,114,182,0.7)', badge: '#be185d', idleBg: '#83185722', idleText: '#f9a8d4', finger: '#db2777' },
  'Four Fingers':  { bg: '#059669', border: '#34d399', text: '#fff', glow: '0 0 20px rgba(52,211,153,0.7)',  badge: '#047857', idleBg: '#064e3b22', idleText: '#6ee7b7', finger: '#059669' },
  'Five Fingers':  { bg: '#7c3aed', border: '#c084fc', text: '#fff', glow: '0 0 20px rgba(192,132,252,0.7)', badge: '#6d28d9', idleBg: '#3b1f6e22', idleText: '#d8b4fe', finger: '#7c3aed' },
};

const DEFAULT_COLOR = { bg: '#374151', border: '#6b7280', text: '#fff', glow: '0 0 20px rgba(107,114,128,0.5)', badge: '#1f2937', idleBg: '#11182722', idleText: '#9ca3af', finger: '#6b7280' };

export const GestureGuide: React.FC<GestureGuideProps> = ({ currentDetectedGestures, theme = 'black' }) => {
  const [selectedGestureId, setSelectedGestureId] = useState<GestureType>('Open Palm');
  const isDark = theme === 'black';

  const activeDef =
    GESTURE_DEFINITIONS.find((g) => g.id === selectedGestureId) || GESTURE_DEFINITIONS[0];

  const isCurrentActiveDetected = currentDetectedGestures.includes(activeDef.id);
  const activeColor = GESTURE_COLORS[activeDef.id] || DEFAULT_COLOR;
  const activeImage3D = get3DGestureImage(activeDef.id);

  return (
    <div
      className={`rounded-2xl p-5 sm:p-6 border transition-colors ${
        isDark
          ? 'bg-[#0f0f10] border-neutral-800 text-white shadow-xl'
          : 'bg-white border-slate-200 text-slate-900 shadow-sm'
      }`}
    >
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div
        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b mb-5 ${
          isDark ? 'border-neutral-800' : 'border-slate-200'
        }`}
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className={`w-4 h-4 ${isDark ? 'text-white' : 'text-slate-900'}`} />
            <h3 className="text-base sm:text-lg font-bold">Gesture Reference Guide</h3>
          </div>
          <p className={`text-xs ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
            Click any button to inspect details. When your hand matches on camera, its 3D button{' '}
            <span className="font-semibold" style={{ color: '#a78bfa' }}>shrinks & glows</span> in its unique color!
          </p>
        </div>

        {currentDetectedGestures.length > 0 && (
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono font-semibold self-start sm:self-auto"
            style={{
              backgroundColor: (GESTURE_COLORS[currentDetectedGestures[0]] || DEFAULT_COLOR).idleBg,
              border: `1px solid ${(GESTURE_COLORS[currentDetectedGestures[0]] || DEFAULT_COLOR).border}`,
              color: (GESTURE_COLORS[currentDetectedGestures[0]] || DEFAULT_COLOR).idleText,
            }}
          >
            <Zap className="w-3 h-3" />
            <span>Active: {currentDetectedGestures.join(', ')}</span>
          </div>
        )}
      </div>

      {/* ── 3D Gesture Buttons Grid (like the reference photo) ──────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 mb-6">
        {GESTURE_DEFINITIONS.map((def) => {
          const isDetected = currentDetectedGestures.includes(def.id);
          const isSelected = selectedGestureId === def.id;
          const color = GESTURE_COLORS[def.id] || DEFAULT_COLOR;
          const img3D = get3DGestureImage(def.id);

          return (
            <button
              key={def.id}
              onClick={() => setSelectedGestureId(def.id)}
              title={def.name}
              style={{
                // Detected = shrink + full color glow
                transform: isDetected ? 'scale(0.88)' : isSelected ? 'scale(1.03)' : 'scale(1)',
                transition: 'transform 0.18s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.18s, background-color 0.18s, border-color 0.18s',

                backgroundColor: isDetected
                  ? color.bg
                  : isSelected
                  ? isDark ? color.idleBg : '#f1f5f9'
                  : isDark ? '#121216' : '#fafafa',

                border: isDetected
                  ? `2px solid ${color.border}`
                  : isSelected
                  ? `2px solid ${color.border}`
                  : isDark ? '2px solid #22222a' : '2px solid #e2e8f0',

                boxShadow: isDetected
                  ? color.glow
                  : isSelected
                  ? `0 0 12px ${color.border}66`
                  : 'none',

                borderRadius: '18px',
                padding: '12px 10px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={(e) => {
                if (!isDetected) {
                  e.currentTarget.style.borderColor = color.border;
                  e.currentTarget.style.boxShadow = `0 0 10px ${color.border}66`;
                }
              }}
              onMouseLeave={(e) => {
                if (!isDetected && !isSelected) {
                  e.currentTarget.style.borderColor = isDark ? '#22222a' : '#e2e8f0';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            >
              {/* Animated pulse outline when detected */}
              {isDetected && (
                <span
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '18px',
                    border: `2px solid ${color.border}`,
                    animation: 'pulse 1s cubic-bezier(0.4,0,0.6,1) infinite',
                    opacity: 0.6,
                    pointerEvents: 'none',
                  }}
                />
              )}

              {/* 3D Hand Illustration Picture */}
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '14px',
                  backgroundColor: isDetected
                    ? 'rgba(0,0,0,0.25)'
                    : isDark ? '#1a1a24' : '#ffffff',
                  border: `1.5px solid ${isDetected ? 'rgba(255,255,255,0.4)' : isDark ? '#2c2c3a' : '#cbd5e1'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '4px',
                  overflow: 'hidden',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  transition: 'transform 0.15s ease',
                }}
              >
                <img
                  src={img3D}
                  alt={def.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                  }}
                />
              </div>

              {/* Gesture Name */}
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: isDetected || isSelected ? 800 : 600,
                  textAlign: 'center',
                  lineHeight: 1.25,
                  color: isDetected
                    ? '#fff'
                    : isSelected
                    ? isDark ? color.idleText : color.finger
                    : isDark ? '#ddd' : '#334155',
                }}
              >
                {def.name}
              </span>

              {/* LIVE or Badge */}
              {isDetected ? (
                <span
                  style={{
                    fontSize: '9px',
                    fontWeight: 800,
                    letterSpacing: '0.08em',
                    backgroundColor: '#22c55e',
                    color: '#fff',
                    borderRadius: '999px',
                    padding: '2px 8px',
                    boxShadow: '0 2px 6px rgba(34,197,94,0.5)',
                  }}
                >
                  LIVE ●
                </span>
              ) : (
                <span
                  style={{
                    fontSize: '9px',
                    fontWeight: 600,
                    color: isDark ? '#777' : '#94a3b8',
                    fontFamily: 'monospace',
                  }}
                >
                  {def.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Deep-Dive Spec Card ──────────────────────────────────────────── */}
      <div
        className="rounded-xl border p-4 sm:p-5 space-y-4 transition-all"
        style={{
          backgroundColor: isCurrentActiveDetected
            ? `${activeColor.bg}18`
            : isDark ? '#070709' : '#f8f8fa',
          borderColor: isCurrentActiveDetected
            ? activeColor.border
            : isDark ? '#1f1f1f' : '#e5e7eb',
          boxShadow: isCurrentActiveDetected
            ? `0 0 24px ${activeColor.border}44`
            : 'none',
          transition: 'all 0.25s ease',
        }}
      >
        {/* Card Header */}
        <div
          className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b`}
          style={{ borderColor: isCurrentActiveDetected ? `${activeColor.border}55` : isDark ? '#1f1f1f' : '#e5e7eb' }}
        >
          <div className="flex items-center gap-3">
            {/* 3D Hand picture box */}
            <div
              style={{
                width: '54px', height: '54px',
                borderRadius: '14px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backgroundColor: isCurrentActiveDetected ? `${activeColor.bg}33` : isDark ? '#1a1a24' : '#ffffff',
                border: `2px solid ${isCurrentActiveDetected ? activeColor.border : isDark ? '#2a2a3a' : '#cbd5e1'}`,
                boxShadow: isCurrentActiveDetected ? activeColor.glow : 'none',
                padding: '4px',
                overflow: 'hidden',
                transition: 'all 0.25s',
              }}
            >
              <img
                src={activeImage3D}
                alt={activeDef.name}
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-base sm:text-lg font-bold">{activeDef.name}</h4>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '999px',
                    backgroundColor: isCurrentActiveDetected ? activeColor.bg : isDark ? '#1a1a1a' : '#f0f0f0',
                    color: isCurrentActiveDetected ? '#fff' : isDark ? '#aaa' : '#555',
                    border: `1px solid ${isCurrentActiveDetected ? activeColor.border : isDark ? '#2a2a2a' : '#e0e0e0'}`,
                  }}
                >
                  {activeDef.badge}
                </span>

                {isCurrentActiveDetected && (
                  <span
                    className="flex items-center gap-1 text-xs font-bold font-mono px-2 py-0.5 rounded-full animate-pulse"
                    style={{ backgroundColor: `${activeColor.bg}33`, color: activeColor.border }}
                  >
                    <Sparkles className="w-3 h-3" />
                    LIVE ON CAMERA
                  </span>
                )}
              </div>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                {activeDef.summary}
              </p>
            </div>
          </div>
        </div>

        {/* Finger Configuration Specs */}
        <div>
          <h5 className={`text-xs font-semibold uppercase tracking-wider mb-2.5 ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
            Required Finger Configuration
          </h5>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {(
              [
                ['Thumb', activeDef.fingerConfig.thumb],
                ['Index', activeDef.fingerConfig.index],
                ['Middle', activeDef.fingerConfig.middle],
                ['Ring', activeDef.fingerConfig.ring],
                ['Pinky', activeDef.fingerConfig.pinky],
              ] as const
            ).map(([digit, state]) => {
              const isExtended = state === 'Extended' || state === 'Upward';
              const isCurled = state === 'Folded' || state === 'Downward';
              return (
                <div
                  key={digit}
                  className="rounded-lg p-2.5 border text-center transition-all"
                  style={{
                    backgroundColor: isExtended
                      ? isDark ? `${activeColor.bg}22` : '#f0fdf4'
                      : isDark ? '#121212' : '#f9fafb',
                    borderColor: isExtended
                      ? isDark ? activeColor.border : '#86efac'
                      : isDark ? '#222' : '#e5e7eb',
                  }}
                >
                  <div className={`text-xs font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {digit}
                  </div>
                  <div
                    className="text-xs font-mono font-semibold mt-0.5"
                    style={{
                      color: isExtended
                        ? isDark ? activeColor.text : '#16a34a'
                        : isCurled
                        ? isDark ? '#666' : '#9ca3af'
                        : '#3b82f6',
                    }}
                  >
                    {state}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Classification Criteria & Limitations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
          <div
            className="rounded-lg p-3 border"
            style={{
              backgroundColor: isDark ? '#111113' : '#f9fafb',
              borderColor: isDark ? '#1f1f22' : '#e5e7eb',
            }}
          >
            <div className="flex items-center gap-1.5 font-bold mb-1.5" style={{ color: activeColor.border }}>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Classification Vector Math</span>
            </div>
            <p className={`leading-relaxed ${isDark ? 'text-neutral-300' : 'text-slate-600'}`}>
              {activeDef.classificationLogic}
            </p>
          </div>

          <div
            className="rounded-lg p-3 border"
            style={{
              backgroundColor: isDark ? '#111113' : '#f9fafb',
              borderColor: isDark ? '#1f1f22' : '#e5e7eb',
            }}
          >
            <div className="flex items-center gap-1.5 font-bold mb-1.5 text-amber-500">
              <Zap className="w-3.5 h-3.5" />
              <span>Natural Biomechanical Limitations</span>
            </div>
            <p className={`leading-relaxed ${isDark ? 'text-neutral-300' : 'text-slate-600'}`}>
              {activeDef.naturalLimitations}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
