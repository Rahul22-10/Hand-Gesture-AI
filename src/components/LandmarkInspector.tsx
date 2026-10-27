/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { HandDetectionResult } from '../types/gestures';
import { LANDMARK } from '../utils/gestureClassifier';
import { Crosshair, Layers } from 'lucide-react';
import { AppTheme } from '../types/theme';

interface LandmarkInspectorProps {
  detections: HandDetectionResult[];
  isStreaming: boolean;
  theme?: AppTheme;
}

const LANDMARK_NAMES: Record<number, string> = {
  [LANDMARK.WRIST]: '0. Wrist Base',
  [LANDMARK.THUMB_CMC]: '1. Thumb CMC',
  [LANDMARK.THUMB_MCP]: '2. Thumb MCP',
  [LANDMARK.THUMB_IP]: '3. Thumb IP',
  [LANDMARK.THUMB_TIP]: '4. Thumb Tip',
  [LANDMARK.INDEX_MCP]: '5. Index MCP',
  [LANDMARK.INDEX_PIP]: '6. Index PIP',
  [LANDMARK.INDEX_DIP]: '7. Index DIP',
  [LANDMARK.INDEX_TIP]: '8. Index Tip',
  [LANDMARK.MIDDLE_MCP]: '9. Middle MCP',
  [LANDMARK.MIDDLE_PIP]: '10. Middle PIP',
  [LANDMARK.MIDDLE_DIP]: '11. Middle DIP',
  [LANDMARK.MIDDLE_TIP]: '12. Middle Tip',
  [LANDMARK.RING_MCP]: '13. Ring MCP',
  [LANDMARK.RING_PIP]: '14. Ring PIP',
  [LANDMARK.RING_DIP]: '15. Ring DIP',
  [LANDMARK.RING_TIP]: '16. Ring Tip',
  [LANDMARK.PINKY_MCP]: '17. Pinky MCP',
  [LANDMARK.PINKY_PIP]: '18. Pinky PIP',
  [LANDMARK.PINKY_DIP]: '19. Pinky DIP',
  [LANDMARK.PINKY_TIP]: '20. Pinky Tip',
};

export const LandmarkInspector: React.FC<LandmarkInspectorProps> = ({
  detections,
  isStreaming,
  theme = 'black',
}) => {
  const [selectedHandIndex, setSelectedHandIndex] = useState(0);
  const isDark = theme === 'black';

  if (!isStreaming || detections.length === 0) {
    return (
      <div
        className={`rounded-2xl p-8 text-center border transition-colors ${
          isDark
            ? 'bg-[#0f0f10] border-neutral-800 text-neutral-400'
            : 'bg-white border-slate-200 text-slate-500 shadow-sm'
        }`}
      >
        <Crosshair className="w-8 h-8 mx-auto mb-3 opacity-60" />
        <h4 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
          No Landmark Stream Available
        </h4>
        <p className="text-xs mt-1 max-w-sm mx-auto">
          Start the camera and show your hand to inspect raw 3D landmark coordinates, surface normals, and spatial vectors.
        </p>
      </div>
    );
  }

  const activeDetection = detections[selectedHandIndex] || detections[0];
  const { landmarks, handedness, palmNormal, confidence } = activeDetection;

  return (
    <div
      className={`rounded-2xl p-6 border space-y-6 transition-colors ${
        isDark
          ? 'bg-[#0f0f10] border-neutral-800 text-white shadow-xl'
          : 'bg-white border-slate-200 text-slate-900 shadow-sm'
      }`}
    >
      {/* Title & Multi-Hand Selector */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b ${isDark ? 'border-neutral-800' : 'border-slate-200'}`}>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Layers className={`w-5 h-5 ${isDark ? 'text-white' : 'text-slate-900'}`} />
            <h3 className="text-lg font-bold">21 Landmark Coordinate Inspector</h3>
          </div>
          <p className={`text-xs ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
            Real-time normalized 3D joint telemetry from MediaPipe HandLandmarker
          </p>
        </div>

        {detections.length > 1 && (
          <div className={`flex items-center gap-1.5 p-1 rounded-lg border ${isDark ? 'bg-black border-neutral-800' : 'bg-slate-100 border-slate-200'}`}>
            {detections.map((d, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedHandIndex(idx)}
                className={`px-3 py-1 text-xs font-mono font-medium rounded-md transition-colors cursor-pointer ${
                  selectedHandIndex === idx
                    ? isDark
                      ? 'bg-neutral-800 text-white shadow-xs'
                      : 'bg-white text-slate-900 shadow-xs'
                    : isDark
                    ? 'text-neutral-400 hover:text-white'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {d.handedness} Hand
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Surface Normal & Pose Telemetry Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className={`p-3 rounded-xl border ${isDark ? 'bg-black border-neutral-800' : 'bg-slate-50 border-slate-200'}`}>
          <div className={`text-[11px] font-mono uppercase ${isDark ? 'text-neutral-500' : 'text-slate-500'}`}>Handedness</div>
          <div className="text-sm font-mono font-bold mt-1">
            {handedness.toUpperCase()}
          </div>
          <div className={`text-[10px] font-mono mt-0.5 ${isDark ? 'text-neutral-500' : 'text-slate-400'}`}>
            Match: {Math.round(confidence * 100)}%
          </div>
        </div>

        <div className={`p-3 rounded-xl border ${isDark ? 'bg-black border-neutral-800' : 'bg-slate-50 border-slate-200'}`}>
          <div className={`text-[11px] font-mono uppercase ${isDark ? 'text-neutral-500' : 'text-slate-500'}`}>Normal Nx</div>
          <div className="text-sm font-mono font-bold mt-1 tabular-nums">
            {palmNormal.x.toFixed(4)}
          </div>
          <div className={`text-[10px] font-mono mt-0.5 ${isDark ? 'text-neutral-500' : 'text-slate-400'}`}>Lateral tilt</div>
        </div>

        <div className={`p-3 rounded-xl border ${isDark ? 'bg-black border-neutral-800' : 'bg-slate-50 border-slate-200'}`}>
          <div className={`text-[11px] font-mono uppercase ${isDark ? 'text-neutral-500' : 'text-slate-500'}`}>Normal Ny</div>
          <div className="text-sm font-mono font-bold mt-1 tabular-nums">
            {palmNormal.y.toFixed(4)}
          </div>
          <div className={`text-[10px] font-mono mt-0.5 ${isDark ? 'text-neutral-500' : 'text-slate-400'}`}>Vertical pitch</div>
        </div>

        <div className={`p-3 rounded-xl border ${isDark ? 'bg-black border-neutral-800' : 'bg-slate-50 border-slate-200'}`}>
          <div className={`text-[11px] font-mono uppercase ${isDark ? 'text-neutral-500' : 'text-slate-500'}`}>Normal Nz (Facing)</div>
          <div className="text-sm font-mono font-bold mt-1 tabular-nums text-emerald-500">
            {palmNormal.z.toFixed(4)}
          </div>
          <div className={`text-[10px] font-mono mt-0.5 ${isDark ? 'text-neutral-500' : 'text-slate-400'}`}>
            {palmNormal.z < 0 ? 'Toward camera' : 'Away from camera'}
          </div>
        </div>
      </div>

      {/* 21 Landmark Table */}
      <div className={`border rounded-xl overflow-hidden ${isDark ? 'border-neutral-800' : 'border-slate-200'}`}>
        <div className="max-h-72 overflow-y-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className={`border-b sticky top-0 ${isDark ? 'bg-black border-neutral-800 text-neutral-400' : 'bg-slate-100 border-slate-200 text-slate-600'}`}>
              <tr>
                <th className="py-2.5 px-3 font-semibold">Landmark Node</th>
                <th className="py-2.5 px-3 font-semibold text-right">X (Norm)</th>
                <th className="py-2.5 px-3 font-semibold text-right">Y (Norm)</th>
                <th className="py-2.5 px-3 font-semibold text-right">Z (Depth)</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-neutral-800/80 text-neutral-200' : 'divide-slate-200 text-slate-800'}`}>
              {landmarks.map((pt, idx) => {
                const isTip = [4, 8, 12, 16, 20].includes(idx);
                return (
                  <tr
                    key={idx}
                    className={`transition-colors ${
                      isDark ? 'hover:bg-neutral-900/60' : 'hover:bg-slate-50'
                    } ${isTip ? isDark ? 'bg-neutral-900/30 font-semibold' : 'bg-slate-50 font-semibold' : ''}`}
                  >
                    <td className="py-2 px-3 flex items-center gap-2">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isTip ? isDark ? 'bg-white' : 'bg-slate-900' : isDark ? 'bg-neutral-600' : 'bg-slate-400'
                        }`}
                      />
                      <span>{LANDMARK_NAMES[idx] || `Node ${idx}`}</span>
                    </td>
                    <td className="py-2 px-3 text-right tabular-nums opacity-80">
                      {pt.x.toFixed(4)}
                    </td>
                    <td className="py-2 px-3 text-right tabular-nums opacity-80">
                      {pt.y.toFixed(4)}
                    </td>
                    <td className="py-2 px-3 text-right tabular-nums font-semibold">
                      {pt.z.toFixed(4)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
