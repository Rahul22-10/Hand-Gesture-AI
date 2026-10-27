/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from 'react';
import {
  Camera,
  CameraOff,
  FlipHorizontal,
  Eye,
  EyeOff,
  Maximize2,
  RefreshCw,
  AlertTriangle,
  Download,
} from 'lucide-react';
import { HandDetectionResult } from '../types/gestures';
import { RenderOptions } from '../utils/canvasRenderer';
import { AppTheme } from '../types/theme';

interface CameraViewProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  isStreaming: boolean;
  isLoadingModel: boolean;
  modelProgressText: string;
  error: string | null;
  onStartCamera: () => void;
  onStopCamera: () => void;
  detections: HandDetectionResult[];
  fps: number;
  inferenceTimeMs: number;
  renderOptions: RenderOptions;
  setRenderOptions: React.Dispatch<React.SetStateAction<RenderOptions>>;
  theme: AppTheme;
  voiceEnabled: boolean;
  onToggleVoice: () => void;
}

export const CameraView: React.FC<CameraViewProps> = ({
  videoRef,
  canvasRef,
  isStreaming,
  isLoadingModel,
  modelProgressText,
  error,
  onStartCamera,
  onStopCamera,
  detections,
  fps,
  inferenceTimeMs,
  renderOptions,
  setRenderOptions,
  theme,
  voiceEnabled,
  onToggleVoice,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isDark = theme === 'black';

  // Take snapshot
  const handleSnapshot = () => {
    if (!videoRef.current || !canvasRef.current || !isStreaming) return;
    const v = videoRef.current;
    const c = canvasRef.current;

    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = v.videoWidth || 1280;
    exportCanvas.height = v.videoHeight || 720;
    const ctx = exportCanvas.getContext('2d');
    if (!ctx) return;

    if (renderOptions.isMirrored) {
      ctx.translate(exportCanvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(v, 0, 0, exportCanvas.width, exportCanvas.height);
    if (renderOptions.isMirrored) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    }

    ctx.drawImage(c, 0, 0);

    const link = document.createElement('a');
    link.download = `hand-gesture-ai-${Date.now()}.png`;
    link.href = exportCanvas.toDataURL('image/png');
    link.click();
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full rounded-2xl overflow-hidden flex flex-col border transition-colors ${
        isDark
          ? 'bg-[#0c0c0e] border-neutral-800 text-white shadow-xl'
          : 'bg-white border-slate-200 text-slate-900 shadow-sm'
      }`}
    >
      {/* Top HUD Controls Bar */}
      <div
        className={`flex items-center justify-between px-4 py-3 border-b text-xs ${
          isDark
            ? 'bg-black border-neutral-800 text-neutral-300'
            : 'bg-slate-50 border-slate-200 text-slate-700'
        }`}
      >
        {/* Left: Status & Telemetry */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                isStreaming ? 'bg-emerald-500 animate-pulse' : isDark ? 'bg-neutral-600' : 'bg-slate-400'
              }`}
            />
            <span className="font-mono font-medium">
              {isStreaming
                ? detections.length > 0
                  ? `TRACKING (${detections.length} HAND${detections.length > 1 ? 'S' : ''})`
                  : 'CAMERA ACTIVE · NO HAND DETECTED'
                : 'CAMERA OFF'}
            </span>
          </div>

          {isStreaming && (
            <div
              className={`hidden sm:flex items-center gap-2 font-mono ${
                isDark ? 'text-neutral-500' : 'text-slate-400'
              }`}
            >
              <span aria-hidden="true">·</span>
              <span className={`tabular-nums ${isDark ? 'text-neutral-200' : 'text-slate-700'}`}>
                {fps} FPS
              </span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">{inferenceTimeMs}ms latency</span>
            </div>
          )}
        </div>

        {/* Right: Quick Action Toggles */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onToggleVoice}
            title={voiceEnabled ? 'Voice Speech (Speaks gesture name out loud): ACTIVE' : 'Voice Speech: MUTED'}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-xs font-mono transition-colors cursor-pointer ${
              voiceEnabled
                ? isDark
                  ? 'bg-neutral-800 text-emerald-400 border-neutral-700'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-300 font-semibold'
                : isDark
                ? 'bg-neutral-900 text-neutral-500 border-neutral-800'
                : 'bg-slate-100 text-slate-400 border-slate-200'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${voiceEnabled ? 'bg-emerald-500 animate-pulse' : 'bg-neutral-500'}`} />
            <span className="hidden sm:inline">{voiceEnabled ? 'Voice: ON' : 'Voice: OFF'}</span>
          </button>

          {isStreaming && (
            <>
              <button
                type="button"
                onClick={() =>
                  setRenderOptions((prev) => ({
                    ...prev,
                    isMirrored: !prev.isMirrored,
                  }))
                }
                title={renderOptions.isMirrored ? 'Disable mirror mode' : 'Enable mirror mode'}
                className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                  renderOptions.isMirrored
                    ? isDark
                      ? 'bg-neutral-800 text-white border-neutral-700'
                      : 'bg-slate-200 text-slate-900 border-slate-300'
                    : isDark
                    ? 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white'
                    : 'bg-white text-slate-500 border-slate-200 hover:text-slate-900'
                }`}
              >
                <FlipHorizontal className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() =>
                  setRenderOptions((prev) => ({
                    ...prev,
                    showSkeleton: !prev.showSkeleton,
                    showLandmarks: !prev.showLandmarks,
                  }))
                }
                title={renderOptions.showSkeleton ? 'Hide hand skeleton' : 'Show hand skeleton'}
                className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                  renderOptions.showSkeleton
                    ? isDark
                      ? 'bg-neutral-800 text-white border-neutral-700'
                      : 'bg-slate-200 text-slate-900 border-slate-300'
                    : isDark
                    ? 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white'
                    : 'bg-white text-slate-500 border-slate-200 hover:text-slate-900'
                }`}
              >
                {renderOptions.showSkeleton ? (
                  <Eye className="w-3.5 h-3.5" />
                ) : (
                  <EyeOff className="w-3.5 h-3.5" />
                )}
              </button>

              <button
                type="button"
                onClick={handleSnapshot}
                title="Save snapshot image"
                className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                  isDark
                    ? 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-800'
                    : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </>
          )}

          <button
            type="button"
            onClick={toggleFullscreen}
            title="Toggle fullscreen preview"
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              isDark
                ? 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-800'
                : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Video & Canvas Viewport */}
      <div
        className={`relative aspect-[16/10] sm:aspect-[16/9] w-full flex items-center justify-center overflow-hidden ${
          isDark ? 'bg-black' : 'bg-slate-900'
        }`}
      >
        {/* Hidden / Underlying Video Feed */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`absolute inset-0 w-full h-full object-contain pointer-events-none transition-opacity duration-300 ${
            isStreaming ? 'opacity-100' : 'opacity-0'
          } ${renderOptions.isMirrored ? 'scale-x-[-1]' : ''}`}
        />

        {/* Live Vector Landmarks Canvas Overlay */}
        <canvas
          ref={canvasRef}
          className={`absolute inset-0 w-full h-full object-contain pointer-events-none z-10 transition-opacity duration-300 ${
            isStreaming ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Standby State: When camera is not active */}
        {!isStreaming && !isLoadingModel && !error && (
          <div className="flex flex-col items-center justify-center p-8 text-center max-w-md z-20">
            <div
              className={`w-16 h-16 rounded-2xl border flex items-center justify-center mb-5 shadow-lg ${
                isDark
                  ? 'bg-neutral-900 border-neutral-800 text-white'
                  : 'bg-white border-slate-200 text-slate-900'
              }`}
            >
              <Camera className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Webcam Hand Tracker Ready</h3>
            <p className="text-sm text-neutral-300 mb-6 leading-relaxed">
              Activate your camera to begin real-time gesture recognition. Detection runs 100% locally on your device via MediaPipe WebAssembly.
            </p>
            <button
              onClick={onStartCamera}
              className={`px-6 py-3 text-sm font-semibold rounded-xl transition-all shadow-lg flex items-center gap-2 cursor-pointer ${
                isDark
                  ? 'bg-white text-black hover:bg-neutral-200'
                  : 'bg-white text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Camera className="w-4 h-4" />
              Enable Camera & Start Tracking
            </button>
          </div>
        )}

        {/* Loading State: Model or stream initializing */}
        {isLoadingModel && (
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm flex flex-col items-center justify-center p-6 z-30">
            <div className="w-12 h-12 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white mb-4 animate-spin">
              <RefreshCw className="w-6 h-6" />
            </div>
            <p className="text-base font-semibold text-white mb-1">Initializing AI Pipeline</p>
            <p className="text-xs text-neutral-400 font-mono text-center max-w-xs">{modelProgressText}</p>
          </div>
        )}

        {/* Error / Permission Denied State */}
        {error && (
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center max-w-lg mx-auto z-30">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-4">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h4 className="text-lg font-bold text-rose-300 mb-2">Camera Access Notice</h4>
            <p className="text-xs text-neutral-200 mb-4 leading-relaxed font-mono bg-neutral-900 p-3 rounded-lg border border-neutral-800 text-left">
              {error}
            </p>
            <div className="text-xs text-neutral-400 text-left space-y-1.5 mb-6 max-w-sm">
              <p>• Verify you allowed camera permissions in your browser address bar.</p>
              <p>• Ensure another program (Zoom, Teams, etc.) is not locking the webcam.</p>
              <p>• For secure context, HTTPS or localhost is required.</p>
            </div>
            <button
              onClick={onStartCamera}
              className="px-5 py-2.5 text-xs font-semibold text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-all border border-neutral-700 flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retry Camera Permission
            </button>
          </div>
        )}

        {/* Real-time Hand Presence Overlay Tip */}
        {isStreaming && detections.length === 0 && (
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md px-4 py-2 rounded-full border border-neutral-800 text-xs text-neutral-200 font-medium shadow-lg z-20 flex items-center gap-2">
            <span>Show your hand clearly within the camera frame</span>
          </div>
        )}
      </div>

      {/* Bottom Bar: Action buttons */}
      <div
        className={`flex flex-wrap items-center justify-between gap-4 px-5 py-3.5 border-t ${
          isDark
            ? 'bg-black border-neutral-800 text-neutral-400'
            : 'bg-slate-50 border-slate-200 text-slate-500'
        }`}
      >
        <div className="flex items-center gap-3 text-xs">
          <span>Engine: MediaPipe HandLandmarker</span>
          <span aria-hidden="true">·</span>
          <span>Max Hands: 2</span>
          <span aria-hidden="true">·</span>
          <span>Landmarks: 21 per hand</span>
        </div>

        <div className="flex items-center gap-3">
          {isStreaming ? (
            <button
              onClick={onStopCamera}
              className="px-4 py-2 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-all flex items-center gap-2 cursor-pointer dark:bg-rose-500/10 dark:hover:bg-rose-500/20 dark:border-rose-500/30 dark:text-rose-300"
            >
              <CameraOff className="w-3.5 h-3.5" />
              Stop Camera
            </button>
          ) : (
            <button
              onClick={onStartCamera}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all shadow-xs flex items-center gap-2 cursor-pointer ${
                isDark
                  ? 'bg-white text-black hover:bg-neutral-200'
                  : 'bg-slate-900 text-white hover:bg-slate-800'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              Start Camera
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
