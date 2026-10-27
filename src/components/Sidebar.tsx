/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Camera,
  BookOpen,
  Layers,
  History,
  User,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Moon,
  Sun,
} from 'lucide-react';
import { UserProfile } from '../types/user';
import { AppTheme } from '../types/theme';

interface SidebarProps {
  activeTab: 'camera' | 'guide' | 'history' | 'landmarks' | 'profile';
  setActiveTab: (tab: 'camera' | 'guide' | 'history' | 'landmarks' | 'profile') => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean | ((prev: boolean) => boolean)) => void;
  profile: UserProfile | null;
  isStreaming: boolean;
  theme: AppTheme;
  onChangeTheme: (theme: AppTheme) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isCollapsed,
  setIsCollapsed,
  profile,
  isStreaming,
  theme,
  onChangeTheme,
}) => {
  const isDark = theme === 'black';

  const navItems = [
    {
      id: 'camera' as const,
      label: 'Camera & Detection',
      icon: Camera,
      badge: isStreaming ? 'ACTIVE' : undefined,
    },
    {
      id: 'guide' as const,
      label: 'Gesture Guide (10)',
      icon: BookOpen,
      badge: '10 Gestures',
    },
    {
      id: 'landmarks' as const,
      label: '3D Landmarks',
      icon: Layers,
      badge: '21 Nodes',
    },
    {
      id: 'history' as const,
      label: 'Recognition History',
      icon: History,
    },
    {
      id: 'profile' as const,
      label: 'My Profile',
      icon: User,
      badge: profile ? 'VERIFIED' : undefined,
    },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 bottom-0 z-40 transition-all duration-200 flex flex-col justify-between border-r ${
        isDark
          ? 'bg-black border-neutral-800 text-white'
          : 'bg-white border-slate-200 text-slate-900 shadow-xs'
      } ${isCollapsed ? 'w-20' : 'w-64'}`}
    >
      {/* Top Brand Section */}
      <div>
        <div
          className={`h-16 flex items-center justify-between px-4 border-b ${
            isDark ? 'border-neutral-800' : 'border-slate-200'
          }`}
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold shrink-0 shadow-xs ${
                isDark ? 'bg-white text-black' : 'bg-slate-900 text-white'
              }`}
            >
              <Sparkles className="w-5 h-5 stroke-[2.5]" />
            </div>
            {!isCollapsed && (
              <span className="text-sm font-bold tracking-tight whitespace-nowrap truncate">
                Hand Gesture AI
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsCollapsed((prev) => !prev)}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className={`p-1.5 rounded-lg border transition-colors ${
              isDark
                ? 'text-neutral-400 hover:text-white hover:bg-neutral-900 border-neutral-800'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100 border-slate-200'
            }`}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* User Quick Profile Card (In Sidebar) */}
        {profile && (
          <div className={`p-3 border-b ${isDark ? 'border-neutral-800' : 'border-slate-200'}`}>
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-3 p-2 rounded-xl transition-all text-left cursor-pointer ${
                activeTab === 'profile'
                  ? isDark
                    ? 'bg-neutral-900 border border-neutral-700 text-white font-semibold'
                    : 'bg-slate-100 border border-slate-300 text-slate-900 font-semibold'
                  : isDark
                  ? 'hover:bg-neutral-900/60 text-neutral-300 border border-transparent'
                  : 'hover:bg-slate-50 text-slate-700 border border-transparent'
              }`}
              title="Click to view My Profile"
            >
              <div className="relative shrink-0">
                <div
                  className={`w-10 h-10 rounded-xl overflow-hidden border flex items-center justify-center ${
                    isDark ? 'bg-neutral-900 border-neutral-700' : 'bg-slate-100 border-slate-300'
                  }`}
                >
                  {profile.avatarUrl ? (
                    <img
                      src={profile.avatarUrl}
                      alt={profile.fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-5 h-5 text-slate-400" />
                  )}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-black" />
              </div>

              {!isCollapsed && (
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold truncate flex items-center gap-1">
                    <span>{profile.fullName}</span>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  </div>
                  <div className={`text-[11px] font-mono truncate ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                    @{profile.username}
                  </div>
                  <div className={`text-[10px] truncate mt-0.5 ${isDark ? 'text-neutral-500' : 'text-slate-400'}`}>
                    {profile.role}
                  </div>
                </div>
              )}
            </button>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="p-3 space-y-1">
          <div
            className={`px-2 py-1 text-[10px] font-mono uppercase tracking-wider ${
              isDark ? 'text-neutral-500' : 'text-slate-400'
            } ${isCollapsed ? 'text-center' : ''}`}
          >
            {isCollapsed ? '•••' : 'Main Menu'}
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? isDark
                      ? 'bg-neutral-800 text-white font-semibold'
                      : 'bg-slate-900 text-white font-semibold shadow-xs'
                    : isDark
                    ? 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
                title={item.label}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {!isCollapsed && (
                  <span className="truncate flex-1 text-left">{item.label}</span>
                )}
                {!isCollapsed && item.badge && (
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                      item.badge === 'ACTIVE'
                        ? 'bg-emerald-500 text-white font-bold'
                        : isDark
                        ? 'bg-neutral-800 text-neutral-400'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Footer: Clean Black / White BG Switcher */}
      <div className={`p-3 border-t ${isDark ? 'border-neutral-800' : 'border-slate-200'} space-y-2.5`}>
        {!isCollapsed && (
          <div>
            <div className={`text-[10px] uppercase font-mono tracking-wider mb-1.5 px-1 ${isDark ? 'text-neutral-500' : 'text-slate-400'}`}>
              Background Theme
            </div>
            <div
              className={`grid grid-cols-2 gap-1 p-1 rounded-xl border text-xs font-medium ${
                isDark ? 'bg-neutral-900 border-neutral-800' : 'bg-slate-100 border-slate-200'
              }`}
            >
              <button
                type="button"
                onClick={() => onChangeTheme('black')}
                className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                  isDark
                    ? 'bg-black text-white font-bold shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                <span>Black</span>
              </button>
              <button
                type="button"
                onClick={() => onChangeTheme('white')}
                className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                  !isDark
                    ? 'bg-white text-slate-900 font-bold shadow-xs'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span>White</span>
              </button>
            </div>
          </div>
        )}

        <div className={`px-2 text-[10px] font-mono text-center truncate ${isDark ? 'text-neutral-500' : 'text-slate-400'}`}>
          {isCollapsed ? (
            <button
              onClick={() => onChangeTheme(isDark ? 'white' : 'black')}
              title={`Switch to ${isDark ? 'White' : 'Black'} BG`}
              className="p-1 rounded hover:bg-neutral-800 cursor-pointer"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
          ) : (
            'MediaPipe Vision · Client AI'
          )}
        </div>
      </div>
    </aside>
  );
};
