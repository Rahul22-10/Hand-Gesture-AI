/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Camera, CameraOff, Volume2, VolumeX, User, Menu, Moon, Sun } from 'lucide-react';
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

const NAV_TABS = [
  { id: 'camera' as const, label: 'Camera', dot: '#22c55e' },
  { id: 'guide' as const, label: 'Guide', dot: '#a855f7' },
  { id: 'landmarks' as const, label: '3D Nodes', dot: '#38bdf8' },
  { id: 'history' as const, label: 'History', dot: '#f97316' },
  { id: 'profile' as const, label: 'Profile', dot: '#f43f5e' },
];

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

  const headerBg = isDark ? 'rgba(8,8,8,0.92)' : 'rgba(255,255,255,0.92)';
  const headerBorder = isDark ? '#1f1f1f' : '#e5e7eb';
  const textColor = isDark ? '#ffffff' : '#111827';
  const mutedColor = isDark ? '#555555' : '#9ca3af';
  const btnIdle = isDark ? '#161616' : '#f3f4f6';
  const btnIdleBorder = isDark ? '#2a2a2a' : '#e5e7eb';

  return (
    <header
      style={{
        position: 'sticky', top: 0, zIndex: 30,
        backgroundColor: headerBg,
        backdropFilter: 'blur(14px)',
        borderBottom: `1px solid ${headerBorder}`,
        transition: 'background-color 0.2s',
      }}
    >
      <div
        style={{
          maxWidth: '1280px', margin: '0 auto',
          padding: '0 16px',
          height: '60px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px',
        }}
      >
        {/* ── Zone 1: Brand ─────────────────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
          {/* Mobile sidebar toggle */}
          {onToggleSidebar && (
            <button
              type="button"
              onClick={onToggleSidebar}
              className="lg:hidden"
              style={{
                width: '36px', height: '36px', borderRadius: '10px',
                backgroundColor: btnIdle, border: `1px solid ${btnIdleBorder}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: mutedColor,
              }}
              title="Toggle sidebar"
            >
              <Menu size={16} />
            </button>
          )}

          {/* Logo + wordmark */}
          <button
            onClick={() => setActiveTab('camera')}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: 'none', border: 'none', cursor: 'pointer', padding: 0,
            }}
          >
            <span
              style={{
                fontSize: '22px', lineHeight: 1,
                filter: 'drop-shadow(0 1px 6px #22c55e88)',
              }}
            >
              ✋
            </span>
            <span
              style={{
                fontSize: '15px', fontWeight: 800, letterSpacing: '-0.3px',
                color: textColor, whiteSpace: 'nowrap',
              }}
            >
              Hand Gesture AI
            </span>
          </button>
        </div>

        {/* ── Zone 2: Nav tabs (desktop) ─────────────────────────────────── */}
        <nav
          className="hidden xl:flex"
          style={{ alignItems: 'center', gap: '2px' }}
        >
          {NAV_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '6px 14px', borderRadius: '10px', border: 'none',
                  fontSize: '13px', fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer', whiteSpace: 'nowrap',
                  backgroundColor: isActive ? (isDark ? tab.dot + '20' : tab.dot + '15') : 'transparent',
                  color: isActive ? tab.dot : mutedColor,
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.color = textColor;
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.color = mutedColor;
                }}
              >
                {isActive && (
                  <span style={{
                    width: '6px', height: '6px', borderRadius: '50%',
                    backgroundColor: tab.dot, flexShrink: 0,
                    boxShadow: `0 0 6px ${tab.dot}`,
                    animation: tab.id === 'camera' && isStreaming ? 'pulse 1s infinite' : 'none',
                  }} />
                )}
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* ── Zone 3: Controls ───────────────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>

          {/* Profile avatar button */}
          <button
            onClick={() => setActiveTab('profile')}
            title="My Profile"
            style={{
              display: 'flex', alignItems: 'center', gap: '7px',
              padding: '5px 10px 5px 5px',
              borderRadius: '12px',
              border: `1.5px solid ${activeTab === 'profile' ? '#f43f5e88' : btnIdleBorder}`,
              backgroundColor: activeTab === 'profile' ? '#f43f5e18' : btnIdle,
              cursor: 'pointer', transition: 'all 0.15s',
            }}
          >
            <div style={{
              width: '26px', height: '26px', borderRadius: '8px', overflow: 'hidden',
              border: `1.5px solid ${isDark ? '#333' : '#e5e7eb'}`,
              backgroundColor: isDark ? '#1a1a1a' : '#f0f0f0',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              {profile?.avatarUrl
                ? <img src={profile.avatarUrl} alt={profile.fullName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <User size={13} color={mutedColor} />}
            </div>
            <span
              className="hidden md:inline"
              style={{ fontSize: '12px', fontWeight: 600, color: textColor, maxWidth: '90px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
            >
              {profile ? profile.fullName.split(' ')[0] : 'Profile'}
            </span>
          </button>

          {/* Theme toggle pill */}
          <div style={{
            display: 'flex', alignItems: 'center',
            backgroundColor: isDark ? '#111' : '#f3f4f6',
            border: `1px solid ${btnIdleBorder}`,
            borderRadius: '10px', padding: '3px',
          }}>
            <button
              type="button"
              onClick={() => onChangeTheme('black')}
              title="Dark theme"
              style={{
                display: 'flex', alignItems: 'center', gap: '5px',
                padding: '5px 10px', borderRadius: '8px', border: 'none',
                fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                backgroundColor: isDark ? '#222' : 'transparent',
                color: isDark ? '#fff' : mutedColor,
                boxShadow: isDark ? '0 1px 4px rgba(0,0,0,0.5)' : 'none',
                transition: 'all 0.15s',
              }}
            >
              <Moon size={13} />
              <span className="hidden sm:inline">Dark</span>
            </button>
            <button
              type="button"
              onClick={() => onChangeTheme('white')}
              title="Light theme"
              style={{
                display: 'flex', alignItems: 'center', gap: '5px',
                padding: '5px 10px', borderRadius: '8px', border: 'none',
                fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                backgroundColor: !isDark ? '#fff' : 'transparent',
                color: !isDark ? '#111' : mutedColor,
                boxShadow: !isDark ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s',
              }}
            >
              <Sun size={13} color={!isDark ? '#f59e0b' : mutedColor} />
              <span className="hidden sm:inline">Light</span>
            </button>
          </div>

          {/* Sound toggle */}
          <button
            type="button"
            onClick={onToggleSound}
            title={soundEnabled ? 'Mute sound' : 'Enable sound'}
            style={{
              width: '36px', height: '36px', borderRadius: '10px',
              backgroundColor: btnIdle, border: `1px solid ${btnIdleBorder}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: soundEnabled ? textColor : mutedColor,
              transition: 'all 0.15s',
            }}
          >
            {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
          </button>

          {/* Camera CTA */}
          {isStreaming ? (
            <button
              onClick={onStopCamera}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 14px', borderRadius: '10px',
                fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                backgroundColor: '#dc262618', border: '1px solid #dc262644',
                color: '#f87171', whiteSpace: 'nowrap',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#dc262630'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#dc262618'; }}
            >
              <CameraOff size={14} />
              <span className="hidden sm:inline">Stop Camera</span>
            </button>
          ) : (
            <button
              onClick={onStartCamera}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '8px 14px', borderRadius: '10px', border: 'none',
                fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                color: '#fff', whiteSpace: 'nowrap',
                boxShadow: '0 2px 10px #22c55e44',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 4px 16px #22c55e66'; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 2px 10px #22c55e44'; }}
            >
              <Camera size={14} />
              <span className="hidden sm:inline">Start Camera</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
