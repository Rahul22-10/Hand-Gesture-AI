/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { HandDetectionResult } from '../types/gestures';
import { GESTURE_DEFINITIONS } from '../utils/gestureDefinitions';
import { CheckCircle2, Info, Hand, Zap, Sparkles } from 'lucide-react';
import { AppTheme } from '../types/theme';
import { get3DGestureImage } from '../utils/gesture3DMap';

interface GestureCardProps {
  detections: HandDetectionResult[];
  isStreaming: boolean;
  theme?: AppTheme;
}

// Unique color per gesture — matching GestureGuide palette
const GESTURE_COLORS: Record<string, { bg: string; border: string; glow: string; text: string; bar: string }> = {
  'Open Palm':     { bg: '#7c3aed', border: '#a855f7', glow: '#7c3aed44', text: '#ddd6fe', bar: '#a855f7' },
  'Closed Fist':   { bg: '#dc2626', border: '#f87171', glow: '#dc262644', text: '#fecaca', bar: '#f87171' },
  'Thumbs Up':     { bg: '#16a34a', border: '#4ade80', glow: '#16a34a44', text: '#bbf7d0', bar: '#4ade80' },
  'Thumbs Down':   { bg: '#ea580c', border: '#fb923c', glow: '#ea580c44', text: '#fed7aa', bar: '#fb923c' },
  'Peace Sign':    { bg: '#0891b2', border: '#22d3ee', glow: '#0891b244', text: '#a5f3fc', bar: '#22d3ee' },
  'One Finger':    { bg: '#d97706', border: '#fbbf24', glow: '#d9770644', text: '#fde68a', bar: '#fbbf24' },
  'Two Fingers':   { bg: '#0284c7', border: '#38bdf8', glow: '#0284c744', text: '#bae6fd', bar: '#38bdf8' },
  'Three Fingers': { bg: '#db2777', border: '#f472b6', glow: '#db277744', text: '#fce7f3', bar: '#f472b6' },
  'Four Fingers':  { bg: '#059669', border: '#34d399', glow: '#05966944', text: '#d1fae5', bar: '#34d399' },
  'Five Fingers':  { bg: '#7c3aed', border: '#c084fc', glow: '#7c3aed44', text: '#ede9fe', bar: '#c084fc' },
};
const DEFAULT_COLOR = { bg: '#374151', border: '#6b7280', glow: '#37415144', text: '#e5e7eb', bar: '#6b7280' };

export const GestureCard: React.FC<GestureCardProps> = ({ detections, isStreaming, theme = 'black' }) => {
  const isDark = theme === 'black';

  const cardBase: React.CSSProperties = {
    borderRadius: '20px',
    padding: '24px',
    border: '1.5px solid',
    transition: 'all 0.25s ease',
    overflow: 'hidden',
    position: 'relative',
  };

  // ── Standby (camera off) ─────────────────────────────────────────────────
  if (!isStreaming) {
    return (
      <div style={{
        ...cardBase,
        backgroundColor: isDark ? '#0c0c0e' : '#ffffff',
        borderColor: isDark ? '#1f1f1f' : '#e5e7eb',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', textAlign: 'center',
        minHeight: '340px',
      }}>
        <div style={{
          width: '68px', height: '68px', borderRadius: '18px', marginBottom: '16px',
          backgroundColor: isDark ? '#161618' : '#f1f5f9',
          border: `1.5px solid ${isDark ? '#26262a' : '#cbd5e1'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Hand size={30} color={isDark ? '#555' : '#94a3b8'} />
        </div>
        <h3 style={{ fontSize: '17px', fontWeight: 800, color: isDark ? '#fff' : '#111', marginBottom: '8px' }}>
          Recognition Standby
        </h3>
        <p style={{ fontSize: '12px', color: isDark ? '#666' : '#64748b', maxWidth: '220px', lineHeight: 1.6 }}>
          Start the camera to begin real-time gesture classification.
        </p>
      </div>
    );
  }

  // ── Scanning (camera on, no hand detected yet) ───────────────────────────
  if (detections.length === 0) {
    return (
      <div style={{
        ...cardBase,
        backgroundColor: isDark ? '#0c0c0e' : '#ffffff',
        borderColor: isDark ? '#1f1f1f' : '#e5e7eb',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', textAlign: 'center',
        minHeight: '340px',
      }}>
        {/* Pulsing scan radar */}
        <div style={{ position: 'relative', marginBottom: '22px' }}>
          <div style={{
            width: '72px', height: '72px', borderRadius: '50%',
            border: '2px solid #22c55e44',
            position: 'absolute', inset: '-8px',
            animation: 'ping 1.5s cubic-bezier(0,0,0.2,1) infinite',
          }} />
          <div style={{
            width: '72px', height: '72px', borderRadius: '20px',
            backgroundColor: isDark ? '#0d1f14' : '#f0fdf4',
            border: `2px solid #22c55e66`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Hand size={32} color="#22c55e" />
          </div>
        </div>

        <h3 style={{ fontSize: '18px', fontWeight: 800, color: isDark ? '#fff' : '#0f172a', marginBottom: '6px' }}>
          Scanning for Hands
        </h3>
        <p style={{ fontSize: '12px', color: isDark ? '#777' : '#64748b', maxWidth: '240px', lineHeight: 1.6, marginBottom: '16px' }}>
          Show your hand in front of the webcam. Your matching cartoon duplicate hand will appear right here!
        </p>

        <div style={{
          fontSize: '10px', fontFamily: 'monospace', fontWeight: 800,
          color: '#22c55e', letterSpacing: '0.08em',
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '6px 14px', borderRadius: '999px',
          backgroundColor: isDark ? '#0d1f14' : '#f0fdf4',
          border: '1px solid #22c55e44',
        }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#22c55e', display: 'inline-block', animation: 'pulse 1s infinite' }} />
          ACTIVE · WAITING FOR HAND LOCK
        </div>
      </div>
    );
  }

  // ── Detection cards (ONLY SHOW CARTOON FINGER BASED ON USER FINGER) ─────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {detections.map((detection, index) => {
        const { handedness, gesture, confidence, fingerStates, extendedCount, criteriaMet, limitationNote } = detection;
        const def = GESTURE_DEFINITIONS.find((d) => d.id === gesture);
        const color = GESTURE_COLORS[gesture] || DEFAULT_COLOR;
        const isRight = handedness === 'Right';
        const confPct = Math.round(confidence * 100);
        // Only show cartoon finger image based on user's detected finger
        const image3D = get3DGestureImage(gesture, fingerStates);

        return (
          <div
            key={index}
            style={{
              ...cardBase,
              backgroundColor: isDark ? '#0c0c0e' : '#ffffff',
              borderColor: color.border,
              boxShadow: `0 0 30px ${color.glow}`,
            }}
          >
            {/* Background tinted top line */}
            <div style={{
              position: 'absolute', top: 0, right: 0, left: 0, height: '4px',
              background: `linear-gradient(90deg, ${color.bg}, ${color.border})`,
            }} />

            {/* Top row: Hand side badge + confidence */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  fontSize: '11px', fontWeight: 800, letterSpacing: '0.08em',
                  padding: '4px 10px', borderRadius: '999px',
                  backgroundColor: isRight ? color.bg : (isDark ? '#1a1a1a' : '#f3f4f6'),
                  color: isRight ? '#fff' : (isDark ? '#888' : '#666'),
                  border: `1px solid ${isRight ? color.border + 'aa' : (isDark ? '#2a2a2a' : '#e5e7eb')}`,
                }}>
                  {handedness.toUpperCase()} HAND
                </span>
                <span style={{ fontSize: '11px', color: isDark ? '#777' : '#64748b', fontFamily: 'monospace', fontWeight: 700 }}>
                  {extendedCount}/5 EXTENDED
                </span>
              </div>

              {/* Confidence badge */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '3px 10px', borderRadius: '999px',
                backgroundColor: color.bg + '22',
                border: `1px solid ${color.border}88`,
              }}>
                <Sparkles size={11} color={color.border} />
                <span style={{ fontSize: '12px', fontWeight: 800, fontFamily: 'monospace', color: color.text }}>
                  {confPct}% CONF.
                </span>
              </div>
            </div>

            {/* ── HERO: ONLY SHOW CARTOON FINGER BASED ON USER FINGER ───────── */}
            <div style={{
              borderRadius: '20px',
              padding: '20px',
              marginBottom: '20px',
              backgroundColor: isDark ? '#121217' : '#f8fafc',
              border: `2px solid ${color.border}66`,
              display: 'flex',
              alignItems: 'center',
              gap: '18px',
              boxShadow: `0 4px 20px ${color.glow}`,
            }}>
              {/* Cartoon Hand matching user's finger */}
              <div style={{
                width: '92px',
                height: '92px',
                borderRadius: '18px',
                flexShrink: 0,
                backgroundColor: isDark ? '#1a1a24' : '#ffffff',
                border: `2px solid ${color.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '6px',
                overflow: 'hidden',
                boxShadow: `0 0 20px ${color.glow}`,
              }}>
                <img
                  src={image3D}
                  alt={gesture}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    transform: 'scale(1.08)',
                  }}
                />
              </div>

              {/* Title & summary */}
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{
                  fontSize: '10px', fontWeight: 800, letterSpacing: '0.1em',
                  textTransform: 'uppercase', color: color.text, marginBottom: '3px',
                  display: 'flex', alignItems: 'center', gap: '5px',
                }}>
                  <Zap size={11} color={color.border} />
                  Matched Cartoon Hand
                </div>
                <div style={{
                  fontSize: '24px', fontWeight: 900, letterSpacing: '-0.5px',
                  color: isDark ? '#fff' : '#0f172a', lineHeight: 1.15,
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {gesture}
                </div>
                <div style={{ fontSize: '12px', color: isDark ? '#888' : '#64748b', marginTop: '4px', lineHeight: 1.4 }}>
                  {def?.summary || 'Finger configuration matched from camera'}
                </div>
              </div>
            </div>

            {/* ── Finger Breakdown Chips ────────────────────────────────────── */}
            <div style={{ marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: isDark ? '#666' : '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                  Finger Detection
                </span>
                <span style={{ fontSize: '10px', fontFamily: 'monospace', color: isDark ? '#555' : '#94a3b8' }}>
                  Real-time status
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
                {fingerStates.map((finger) => (
                  <div
                    key={finger.name}
                    style={{
                      borderRadius: '12px', padding: '8px 2px',
                      textAlign: 'center',
                      backgroundColor: finger.isExtended
                        ? color.bg + '25'
                        : isDark ? '#111114' : '#f1f5f9',
                      border: `1.5px solid ${finger.isExtended ? color.border : (isDark ? '#1f1f25' : '#e2e8f0')}`,
                      boxShadow: finger.isExtended ? `0 0 10px ${color.glow}` : 'none',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ fontSize: '10px', fontWeight: 700, color: finger.isExtended ? color.text : (isDark ? '#666' : '#94a3b8') }}>
                      {finger.name}
                    </div>
                    <div style={{
                      fontSize: '9px', fontFamily: 'monospace', fontWeight: 800, marginTop: '3px',
                      color: finger.isExtended ? color.bar : (isDark ? '#444' : '#cbd5e1'),
                    }}>
                      {finger.isExtended ? 'UP' : 'DOWN'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Classification checks */}
            <div style={{ marginBottom: limitationNote ? '10px' : 0 }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: isDark ? '#666' : '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '6px' }}>
                Classification Checks
              </div>
              <div style={{
                borderRadius: '12px', padding: '12px',
                backgroundColor: isDark ? '#0a0a0d' : '#f8fafc',
                border: `1px solid ${isDark ? '#1a1a22' : '#e2e8f0'}`,
                display: 'flex', flexDirection: 'column', gap: '6px',
              }}>
                {criteriaMet.map((criterion, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '11px', color: isDark ? '#ccc' : '#334155', lineHeight: 1.3 }}>
                    <CheckCircle2 size={12} color={color.bar} style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span>{criterion}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Limitation note */}
            {limitationNote && (
              <div style={{
                display: 'flex', alignItems: 'flex-start', gap: '8px',
                borderRadius: '12px', padding: '10px',
                backgroundColor: isDark ? '#1a110a' : '#fffbeb',
                border: `1px solid ${isDark ? '#3a200a' : '#fde68a'}`,
                fontSize: '11px', color: isDark ? '#d97706' : '#92400e',
                lineHeight: 1.4,
              }}>
                <Info size={13} color="#f59e0b" style={{ flexShrink: 0, marginTop: '1px' }} />
                <div>
                  <span style={{ fontWeight: 700 }}>Note: </span>
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
