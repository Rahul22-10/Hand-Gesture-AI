/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Camera, CameraOff, Volume2, VolumeX, Sparkles, User, Menu, Moon, Sun } from 'lucide-react';
import { UserProfile } from '../types/user';
import { AppTheme } from '../types/theme';

interface HeaderProps {
  isStreaming: boolean;
  onStartCamera: () => void;
  onStopCamera: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  activeTab: 'camera' | 'guide' | 'history' | 'landmarks' | 'profile';
  setActiveTab: (tab: 'camera' | 'guide' | 'history' | 'landmarks' | 'profile') => void;
  theme: AppTheme;
  onChangeTheme: (theme: AppTheme) => void;
  profile: UserProfile | null;
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isStreaming,
  onStartCamera,
  onStopCamera,
  soundEnabled,
  onToggleSound,
  activeTab,
  setActiveTab,
  theme,
  onChangeTheme,
  profile,
  onToggleSidebar,
}) => {
  const isDark = theme === 'black';

  return (
    <header
      className={`sticky top-0 z-30 transition-colors duration-200 border-b ${
        isDark
          ? 'bg-black/90 backdrop-blur-md border-neutral-800 text-white'
          : 'bg-white/90 backdrop-blur-md border-slate-200 text-slate-900 shadow-xs'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Brand Wordmark & Mobile Sidebar Toggle */}
        <div className="flex items-center gap-3 shrink-0">
          {onToggleSidebar && (
            <button
              type="button"
              onClick={onToggleSidebar}
              className={`lg:hidden p-2 rounded-lg border transition-colors ${
                isDark
                  ? 'text-neutral-400 hover:text-white hover:bg-neutral-900 border-neutral-800'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border-slate-200'
              }`}
              title="Toggle Menu Sidebar"
            >
              <Menu className="w-4 h-4" />
            </button>
          )}

          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-lg shadow-sm ${
              isDark
                ? 'bg-white text-black'
                : 'bg-slate-900 text-white'
            }`}
          >
            <Sparkles className="w-5 h-5 stroke-[2.5]" />
          </div>
          <button
            onClick={() => setActiveTab('camera')}
            className={`text-lg font-bold tracking-tight whitespace-nowrap shrink-0 transition-colors text-left ${
              isDark ? 'text-white hover:text-neutral-300' : 'text-slate-900 hover:text-slate-700'
            }`}
          >
            Hand Gesture AI
          </button>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav
          className={`hidden xl:flex items-center gap-7 text-sm font-medium ${
            isDark ? 'text-neutral-400' : 'text-slate-600'
          }`}
        >
          <button
            onClick={() => setActiveTab('camera')}
            className={`transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'camera'
                ? isDark
                  ? 'text-white font-semibold'
                  : 'text-slate-900 font-semibold'
                : isDark
                ? 'hover:text-white'
                : 'hover:text-slate-900'
            }`}
          >
            Camera & Detection
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'guide'
                ? isDark
                  ? 'text-white font-semibold'
                  : 'text-slate-900 font-semibold'
                : isDark
                ? 'hover:text-white'
                : 'hover:text-slate-900'
            }`}
          >
            Gesture Guide (10)
          </button>
          <button
            onClick={() => setActiveTab('landmarks')}
            className={`transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'landmarks'
                ? isDark
                  ? 'text-white font-semibold'
                  : 'text-slate-900 font-semibold'
                : isDark
                ? 'hover:text-white'
                : 'hover:text-slate-900'
            }`}
          >
            3D Landmarks
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'history'
                ? isDark
                  ? 'text-white font-semibold'
                  : 'text-slate-900 font-semibold'
                : isDark
                ? 'hover:text-white'
                : 'hover:text-slate-900'
            }`}
          >
            Recognition History
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'profile'
                ? isDark
                  ? 'text-white font-semibold'
                  : 'text-slate-900 font-semibold'
                : isDark
                ? 'hover:text-white'
                : 'hover:text-slate-900'
            }`}
          >
            My Profile
          </button>
        </nav>

        {/* Zone 3: Primary Action & Controls */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* User Profile Quick Button in Header */}
          {profile && (
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-2 p-1 sm:px-2.5 sm:py-1 rounded-xl border transition-all cursor-pointer ${
                activeTab === 'profile'
                  ? isDark
                    ? 'bg-neutral-800 border-neutral-600 text-white'
                    : 'bg-slate-100 border-slate-300 text-slate-900'
                  : isDark
                  ? 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
              }`}
              title="View My Profile"
            >
              <div
                className={`w-6 h-6 rounded-lg overflow-hidden border flex items-center justify-center shrink-0 ${
                  isDark ? 'bg-black border-neutral-700' : 'bg-slate-100 border-slate-300'
                }`}
              >
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={profile.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-3.5 h-3.5" />
                )}
              </div>
              <span className="text-xs font-semibold hidden md:inline truncate max-w-[100px]">
                {profile.fullName.split(' ')[0]}
              </span>
            </button>
          )}

          {/* Simple Black BG / White BG Toggle Button */}
          <div
            className={`flex items-center p-0.5 rounded-lg border text-xs font-medium ${
              isDark
                ? 'bg-neutral-900 border-neutral-800 text-neutral-300'
                : 'bg-slate-100 border-slate-200 text-slate-600'
            }`}
          >
            <button
              type="button"
              onClick={() => onChangeTheme('black')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                isDark
                  ? 'bg-neutral-800 text-white font-semibold shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Switch to Black Background"
            >
              <Moon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Black</span>
            </button>
            <button
              type="button"
              onClick={() => onChangeTheme('white')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                !isDark
                  ? 'bg-white text-slate-900 font-semibold shadow-xs'
                  : 'text-neutral-400 hover:text-white'
              }`}
              title="Switch to White Background"
            >
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden sm:inline">White</span>
            </button>
          </div>

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={onToggleSound}
            aria-label={soundEnabled ? 'Mute audio blip' : 'Enable audio blip'}
            title={soundEnabled ? 'Audio feedback enabled' : 'Audio feedback muted'}
            className={`p-2 rounded-lg transition-colors border ${
              isDark
                ? 'text-neutral-400 hover:text-white hover:bg-neutral-900 border-neutral-800'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border-slate-200'
            }`}
          >
            {soundEnabled ? (
              <Volume2 className={`w-4 h-4 ${isDark ? 'text-white' : 'text-slate-900'}`} />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
          </button>

          {/* Start/Stop Camera */}
          {isStreaming ? (
            <button
              onClick={onStopCamera}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 text-xs font-semibold tracking-wide text-rose-600 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition-all whitespace-nowrap shrink-0 dark:bg-rose-500/15 dark:border-rose-500/30 dark:text-rose-300 dark:hover:bg-rose-500/25 cursor-pointer"
            >
              <CameraOff className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Stop Camera</span>
            </button>
          ) : (
            <button
              onClick={onStartCamera}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 text-xs font-semibold tracking-wide rounded-lg transition-all shadow-xs whitespace-nowrap shrink-0 cursor-pointer ${
                isDark
                  ? 'bg-white text-black hover:bg-neutral-200'
                  : 'bg-slate-900 text-white hover:bg-slate-800'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Start Camera</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
