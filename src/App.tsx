/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { CameraView } from './components/CameraView';
import { GestureCard } from './components/GestureCard';
import { GestureHistory } from './components/GestureHistory';
import { GestureGuide } from './components/GestureGuide';
import { LandmarkInspector } from './components/LandmarkInspector';
import { ProfileView } from './components/ProfileView';
import { AuthOnboardingModal } from './components/AuthOnboardingModal';
import { HandDetectionResult, GestureHistoryItem, GestureType } from './types/gestures';
import { UserProfile } from './types/user';
import { AppTheme } from './types/theme';
import { RenderOptions, drawHandOverlay } from './utils/canvasRenderer';
import {
  initializeHandLandmarker,
  disposeHandLandmarker,
} from './utils/handLandmarkerService';
import { classifyHandGesture } from './utils/gestureClassifier';
import { playGestureSound, speakGesture, resetSpokenGesture } from './utils/audioFeedback';
import { HandLandmarker } from '@mediapipe/tasks-vision';

export default function App() {
  // Pure Black BG and Clean White BG Theme Toggle
  const [theme, setTheme] = useState<AppTheme>(() => {
    try {
      const saved = localStorage.getItem('hand_gesture_theme_mode');
      return saved === 'white' ? 'white' : 'black';
    } catch {
      return 'black';
    }
  });

  const handleThemeChange = (newTheme: AppTheme) => {
    setTheme(newTheme);
    try {
      localStorage.setItem('hand_gesture_theme_mode', newTheme);
    } catch {
      // ignore
    }
  };

  const isDark = theme === 'black';

  // User Profile & Compulsory First-Time Login State
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('hand_gesture_user_profile');
      return saved ? (JSON.parse(saved) as UserProfile) : null;
    } catch {
      return null;
    }
  });

  // Navigation tabs (includes 'profile')
  const [activeTab, setActiveTab] = useState<
    'camera' | 'guide' | 'history' | 'landmarks' | 'profile'
  >('camera');

  // Sidebar collapse state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  // Camera & Stream State
  const [isStreaming, setIsStreaming] = useState(false);
  const [isLoadingModel, setIsLoadingModel] = useState(false);
  const [modelProgressText, setModelProgressText] = useState('');
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Performance & Detections
  const [detections, setDetections] = useState<HandDetectionResult[]>([]);
  const [fps, setFps] = useState<number>(0);
  const [inferenceTimeMs, setInferenceTimeMs] = useState<number>(0);

  // Sound & Voice Feedback
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(true);

  // Overlay Rendering Options
  const [renderOptions, setRenderOptions] = useState<RenderOptions>({
    showLandmarks: true,
    showSkeleton: true,
    showBoundingBox: true,
    showHandedness: true,
    isMirrored: true,
  });

  // History State
  const [history, setHistory] = useState<GestureHistoryItem[]>([]);

  // Refs for video, canvas, animation, and handLandmarker
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const landmarkerRef = useRef<HandLandmarker | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const lastVideoTimeRef = useRef<number>(-1);
  const lastDetectionTimestampRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);
  const lastFpsCalcTimeRef = useRef<number>(performance.now());
  const activeGestureRef = useRef<{
    [key: string]: { gesture: GestureType; startTime: number; hasSpoken: boolean };
  }>({});

  // First-time Onboarding Completion Handler
  const handleOnboardingComplete = (profile: UserProfile) => {
    setUserProfile(profile);
    try {
      localStorage.setItem('hand_gesture_user_profile', JSON.stringify(profile));
    } catch {
      // ignore
    }
    setActiveTab('profile');
  };

  // Profile Update Handler
  const handleUpdateProfile = (updated: UserProfile) => {
    setUserProfile(updated);
    try {
      localStorage.setItem('hand_gesture_user_profile', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  // Logout & Reset Session
  const handleLogout = () => {
    try {
      localStorage.removeItem('hand_gesture_user_profile');
    } catch {
      // ignore
    }
    setUserProfile(null);
  };

  // Clean stop camera helper
  const stopCamera = useCallback(() => {
    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }

    setIsStreaming(false);
    setDetections([]);
    setFps(0);
    setInferenceTimeMs(0);
    resetSpokenGesture();
    activeGestureRef.current = {};
  }, []);

  // Frame processing loop
  const processFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const landmarker = landmarkerRef.current;

    if (!video || !canvas || !landmarker || !isStreaming) {
      return;
    }

    if (video.readyState >= 2 && video.currentTime !== lastVideoTimeRef.current) {
      lastVideoTimeRef.current = video.currentTime;

      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
      }

      const startTime = performance.now();
      const timestampMs = Math.max(startTime, lastDetectionTimestampRef.current + 1);
      lastDetectionTimestampRef.current = timestampMs;

      try {
        const results = landmarker.detectForVideo(video, timestampMs);
        const latency = Math.round(performance.now() - startTime);
        setInferenceTimeMs(latency);

        const parsedDetections: HandDetectionResult[] = [];

        if (results.landmarks && results.landmarks.length > 0) {
          results.landmarks.forEach((rawLandmarks, i) => {
            const handednessCategory = results.handednesses?.[i]?.[0];
            let handedness = (handednessCategory?.categoryName || 'Right') as 'Left' | 'Right';
            if (renderOptions.isMirrored) {
              handedness = handedness === 'Right' ? 'Left' : 'Right';
            }
            const score = handednessCategory?.score || 0.9;

            const detection = classifyHandGesture(rawLandmarks, handedness, score, i);
            parsedDetections.push(detection);

            // Trigger immediate voice announcement when gesture is stable for ~140ms
            const handKey = `${handedness}-${i}`;
            const currentRecord = activeGestureRef.current[handKey];
            const now = performance.now();
            const MIN_HOLD_MS = 140;

            if (!currentRecord || currentRecord.gesture !== detection.gesture) {
              activeGestureRef.current[handKey] = {
                gesture: detection.gesture,
                startTime: now,
                hasSpoken: false,
              };
            } else if (now - currentRecord.startTime >= MIN_HOLD_MS && detection.gesture !== 'Unknown') {
              // Immediately speak the gesture name out loud!
              if (!currentRecord.hasSpoken) {
                if (voiceEnabled) {
                  speakGesture(detection.gesture);
                }
                if (soundEnabled) {
                  playGestureSound(detection.gesture);
                }
                currentRecord.hasSpoken = true;
              }

              setHistory((prev) => {
                const latest = prev[0];
                if (
                  latest &&
                  latest.gesture === detection.gesture &&
                  latest.handedness === detection.handedness &&
                  now - latest.timeMs < 2000
                ) {
                  return prev;
                }

                const nowObj = new Date();
                const timeStr =
                  nowObj.toTimeString().split(' ')[0] +
                  '.' +
                  String(nowObj.getMilliseconds()).padStart(3, '0');
                const extendedStr =
                  detection.fingerStates
                    .filter((f) => f.isExtended)
                    .map((f) => f.name)
                    .join(', ') || 'None';

                const newHistoryItem: GestureHistoryItem = {
                  id: `${now}-${Math.random()}`,
                  timestamp: timeStr,
                  timeMs: now,
                  gesture: detection.gesture,
                  handedness: detection.handedness,
                  confidence: detection.confidence,
                  extendedFingers: extendedStr,
                };

                return [newHistoryItem, ...prev.slice(0, 49)];
              });
            }
          });
        } else {
          // No hand in view: reset spoken tracker so returning hand speaks immediately
          resetSpokenGesture();
          activeGestureRef.current = {};
        }

        setDetections(parsedDetections);

        const ctx = canvas.getContext('2d');
        if (ctx) {
          drawHandOverlay(ctx, canvas.width, canvas.height, parsedDetections, renderOptions);
        }

        frameCountRef.current += 1;
        const now = performance.now();
        if (now - lastFpsCalcTimeRef.current >= 500) {
          const calculatedFps = Math.round(
            (frameCountRef.current * 1000) / (now - lastFpsCalcTimeRef.current)
          );
          setFps(calculatedFps);
          frameCountRef.current = 0;
          lastFpsCalcTimeRef.current = now;
        }
      } catch (detectErr) {
        console.warn('Frame detection warning:', detectErr);
      }
    }

    if (isStreaming) {
      animFrameIdRef.current = requestAnimationFrame(processFrame);
    }
  }, [isStreaming, renderOptions, soundEnabled, voiceEnabled]);

  // Animation frame loop
  useEffect(() => {
    if (isStreaming) {
      animFrameIdRef.current = requestAnimationFrame(processFrame);
    } else {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
        animFrameIdRef.current = null;
      }
    }

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
        animFrameIdRef.current = null;
      }
    };
  }, [isStreaming, processFrame]);

  // Start Camera handler
  const startCamera = async () => {
    setCameraError(null);
    setIsLoadingModel(true);
    setModelProgressText('Initializing MediaPipe Vision Engine...');

    try {
      const landmarker = await initializeHandLandmarker((msg) => {
        setModelProgressText(msg);
      });
      landmarkerRef.current = landmarker;

      setModelProgressText('Requesting webcam access...');
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error(
          'Webcam API is not supported in this browser. Please use Chrome, Edge, Safari, or Firefox over HTTPS or localhost.'
        );
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await new Promise<void>((resolve) => {
          if (!videoRef.current) return resolve();
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play().then(() => resolve()).catch(() => resolve());
          };
        });
      }

      setIsStreaming(true);
    } catch (err: unknown) {
      console.error('Camera startup error:', err);
      let errorMsg = 'An unexpected error occurred while starting the camera.';
      if (err instanceof DOMException) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          errorMsg =
            'Camera permission was denied. Please click the lock or camera icon in your browser address bar, set Camera to "Allow", and reload.';
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          errorMsg = 'No video camera device was found on this computer or phone.';
        } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
          errorMsg =
            'The camera is currently locked by another application (e.g. Zoom, Google Meet). Close other video apps and retry.';
        } else {
          errorMsg = `${err.name}: ${err.message}`;
        }
      } else if (err instanceof Error) {
        errorMsg = err.message;
      }
      setCameraError(errorMsg);
      stopCamera();
    } finally {
      setIsLoadingModel(false);
      setModelProgressText('');
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
      disposeHandLandmarker();
    };
  }, [stopCamera]);

  const currentDetectedGestures = detections.map((d) => d.gesture);

  return (
    <div
      className={`min-h-screen flex transition-colors duration-200 relative ${
        isDark ? 'theme-black bg-black text-white' : 'theme-white bg-[#f8fafc] text-slate-900'
      }`}
    >
      {/* Compulsory First-Time Registration & Login Modal */}
      <AuthOnboardingModal
        isOpen={userProfile === null}
        onComplete={handleOnboardingComplete}
        theme={theme}
      />

      {/* Desktop & Collapsible Sidebar */}
      <div className="hidden lg:block">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
          profile={userProfile}
          isStreaming={isStreaming}
          theme={theme}
          onChangeTheme={handleThemeChange}
        />
      </div>

      {/* Mobile Drawer Sidebar */}
      {isMobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          <div className="relative z-50 w-72 h-full">
            <Sidebar
              activeTab={activeTab}
              setActiveTab={(tab) => {
                setActiveTab(tab);
                setIsMobileSidebarOpen(false);
              }}
              isCollapsed={false}
              setIsCollapsed={() => setIsMobileSidebarOpen(false)}
              profile={userProfile}
              isStreaming={isStreaming}
              theme={theme}
              onChangeTheme={handleThemeChange}
            />
          </div>
        </div>
      )}

      {/* Main View Wrapper with dynamic left padding for sidebar */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-200 ${
          isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        {/* Universal Top Bar */}
        <Header
          isStreaming={isStreaming}
          onStartCamera={startCamera}
          onStopCamera={stopCamera}
          soundEnabled={soundEnabled}
          onToggleSound={() => setSoundEnabled((prev) => !prev)}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          theme={theme}
          onChangeTheme={handleThemeChange}
          profile={userProfile}
          onToggleSidebar={() => setIsMobileSidebarOpen((prev) => !prev)}
        />

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* Hero Title & Breadcrumb */}
          <div
            className={`flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b ${
              isDark ? 'border-neutral-800' : 'border-slate-200'
            }`}
          >
            <div>
              <div
                className={`text-xs font-mono uppercase tracking-wider mb-1 flex items-center gap-2 ${
                  isDark ? 'text-neutral-400' : 'text-slate-500'
                }`}
              >
                <span>Computer Vision · 21 Landmark Analysis</span>
                {userProfile && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className={isDark ? 'text-white font-semibold' : 'text-slate-900 font-semibold'}>
                      User: {userProfile.fullName}
                    </span>
                  </>
                )}
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                {activeTab === 'profile'
                  ? 'My User Profile'
                  : activeTab === 'guide'
                  ? 'Gesture Reference Guide'
                  : activeTab === 'landmarks'
                  ? '3D Landmark Telemetry'
                  : activeTab === 'history'
                  ? 'Recognition History Log'
                  : 'Real-Time Hand Gesture Recognition'}
              </h1>
              <p className={`text-sm mt-1 max-w-2xl leading-relaxed ${isDark ? 'text-neutral-400' : 'text-slate-600'}`}>
                {activeTab === 'profile'
                  ? 'Manage your personal profile, review recognition statistics, and verify client-side biometric credentials.'
                  : 'Detects, tracks, and classifies 10 standard hand gestures in real time using client-side MediaPipe machine learning and 3D geometric algorithms.'}
              </p>
            </div>

            {/* Quick tab switcher for mobile (removed in profile) */}
            {activeTab !== 'profile' && (
              <div
                className={`flex lg:hidden items-center gap-1 p-1 rounded-xl border text-xs overflow-x-auto ${
                  isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-slate-100 border-slate-200'
                }`}
              >
                {(['camera', 'guide', 'landmarks', 'history'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors ${
                      activeTab === tab
                        ? isDark
                          ? 'bg-neutral-800 text-white font-semibold'
                          : 'bg-white text-slate-900 font-semibold shadow-xs'
                        : isDark
                        ? 'text-neutral-400'
                        : 'text-slate-600'
                    }`}
                  >
                    {tab === 'landmarks' ? '3D Nodes' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Tab 1: Primary Camera & Detection View */}
          {activeTab === 'camera' && (
            <div className="space-y-8">
              {/* Split Grid: Large Live Camera Preview & Real-Time Gesture Card */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Column: Camera Viewport (7 cols) */}
                <div className="lg:col-span-7 xl:col-span-8 space-y-4">
                  <CameraView
                    videoRef={videoRef}
                    canvasRef={canvasRef}
                    isStreaming={isStreaming}
                    isLoadingModel={isLoadingModel}
                    modelProgressText={modelProgressText}
                    error={cameraError}
                    onStartCamera={startCamera}
                    onStopCamera={stopCamera}
                    detections={detections}
                    fps={fps}
                    inferenceTimeMs={inferenceTimeMs}
                    renderOptions={renderOptions}
                    setRenderOptions={setRenderOptions}
                    theme={theme}
                    voiceEnabled={voiceEnabled}
                    onToggleVoice={() => setVoiceEnabled((prev) => !prev)}
                  />
                </div>

                {/* Right Column: Active Gesture Classification (5 cols) */}
                <div className="lg:col-span-5 xl:col-span-4 space-y-6">
                  <GestureCard detections={detections} isStreaming={isStreaming} theme={theme} />
                </div>
              </div>

              {/* Quick Gesture Guide Grid Strip */}
              <GestureGuide currentDetectedGestures={currentDetectedGestures} theme={theme} />
            </div>
          )}

          {/* Tab 2: Full Gesture Guide */}
          {activeTab === 'guide' && (
            <div className="space-y-6">
              <GestureGuide currentDetectedGestures={currentDetectedGestures} theme={theme} />
            </div>
          )}

          {/* Tab 3: Raw 3D Landmark Inspector */}
          {activeTab === 'landmarks' && (
            <div className="space-y-6">
              <LandmarkInspector detections={detections} isStreaming={isStreaming} theme={theme} />
            </div>
          )}

          {/* Tab 4: History Log */}
          {activeTab === 'history' && (
            <div className="space-y-6">
              <GestureHistory
                history={history}
                onClearHistory={() => setHistory([])}
                onDeleteItem={(id) => setHistory((prev) => prev.filter((item) => item.id !== id))}
                onDeleteItems={(ids) => setHistory((prev) => prev.filter((item) => !ids.includes(item.id)))}
                theme={theme}
              />
            </div>
          )}

          {/* Tab 5: My User Profile Screen */}
          {activeTab === 'profile' && userProfile && (
            <div className="space-y-6">
              <ProfileView
                profile={userProfile}
                onUpdateProfile={handleUpdateProfile}
                onLogout={handleLogout}
                history={history}
                onNavigateToCamera={() => setActiveTab('camera')}
                theme={theme}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
