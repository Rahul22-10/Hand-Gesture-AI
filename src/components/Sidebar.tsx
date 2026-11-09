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
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Sparkles,
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

// Unique color accent per nav item
const NAV_COLORS: Record<string, { active: string; icon: string; glow: string; badge: string }> = {
  camera:    { active: '#22c55e', icon: '#22c55e', glow: '#22c55e33', badge: '#16a34a' },
  guide:     { active: '#a855f7', icon: '#a855f7', glow: '#a855f733', badge: '#7c3aed' },
  landmarks: { active: '#38bdf8', icon: '#38bdf8', glow: '#38bdf833', badge: '#0284c7' },
  history:   { active: '#f97316', icon: '#f97316', glow: '#f9731633', badge: '#ea580c' },
  profile:   { active: '#f43f5e', icon: '#f43f5e', glow: '#f43f5e33', badge: '#e11d48' },
};

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isCollapsed,
  setIsCollapsed,
  profile,
  isStreaming,
  theme,
}) => {
  const isDark = theme === 'black';

  const navItems = [
    { id: 'camera' as const,    label: 'Camera & Detection', icon: Camera,   badge: isStreaming ? 'LIVE' : undefined },
    { id: 'guide' as const,     label: 'Gesture Guide',      icon: BookOpen,  badge: '10' },
    { id: 'landmarks' as const, label: '3D Landmarks',       icon: Layers,    badge: '21' },
    { id: 'history' as const,   label: 'History Log',        icon: History,   badge: undefined },
    { id: 'profile' as const,   label: 'My Profile',         icon: User,      badge: profile ? '✓' : undefined },
  ];

  const bg        = isDark ? '#0a0a0a' : '#ffffff';
  const border    = isDark ? '#1f1f1f' : '#e5e7eb';
  const textMuted = isDark ? '#555' : '#9ca3af';

  return (
    <aside
      style={{
        position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 40,
        width: isCollapsed ? '72px' : '240px',
        backgroundColor: bg,
        borderRight: `1px solid ${border}`,
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
        transition: 'width 0.22s cubic-bezier(0.4,0,0.2,1)',
        overflow: 'hidden',
      }}
    >
      {/* ── Top ─────────────────────────────────────────────────────────── */}
      <div>
        {/* Brand bar */}
        <div
          style={{
            height: '64px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 12px',
            borderBottom: `1px solid ${border}`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
            {/* Logo — hand emoji badge */}
            <button
              type="button"
              onClick={() => setActiveTab('camera')}
              title="Hand Gesture AI"
              style={{
                width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 2px 10px #22c55e44',
                fontSize: '18px', lineHeight: 1,
                transition: 'transform 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.08)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
            >
              ✋
            </button>

            {!isCollapsed && (
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '13px', fontWeight: 800, color: isDark ? '#fff' : '#111', whiteSpace: 'nowrap', letterSpacing: '-0.3px' }}>
                  Hand Gesture AI
                </div>
                <div style={{ fontSize: '10px', color: textMuted, fontFamily: 'monospace', whiteSpace: 'nowrap' }}>
                  MediaPipe Vision
                </div>
              </div>
            )}
          </div>

          {/* Collapse toggle */}
          <button
            type="button"
            onClick={() => setIsCollapsed((p) => !p)}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            style={{
              width: '28px', height: '28px', borderRadius: '8px', flexShrink: 0,
              backgroundColor: isDark ? '#1a1a1a' : '#f3f4f6',
              border: `1px solid ${border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: isDark ? '#666' : '#9ca3af',
              transition: 'background-color 0.15s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = isDark ? '#2a2a2a' : '#e5e7eb'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = isDark ? '#1a1a1a' : '#f3f4f6'; }}
          >
            {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        {/* Profile mini-card */}
        {profile && (
          <div style={{ padding: '10px 10px 6px' }}>
            <button
              onClick={() => setActiveTab('profile')}
              style={{
                width: '100%',
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: isCollapsed ? '8px' : '10px 10px',
                borderRadius: '14px',
                border: `1.5px solid ${activeTab === 'profile' ? NAV_COLORS.profile.active : border}`,
                backgroundColor: activeTab === 'profile'
                  ? isDark ? '#1a0a0e' : '#fff1f2'
                  : isDark ? '#111' : '#fafafa',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s',
                boxShadow: activeTab === 'profile' ? `0 0 12px ${NAV_COLORS.profile.glow}` : 'none',
              }}
              title="View My Profile"
            >
              {/* Avatar */}
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div
                  style={{
                    width: '36px', height: '36px', borderRadius: '10px',
                    overflow: 'hidden',
                    border: `2px solid ${NAV_COLORS.profile.active}44`,
                    backgroundColor: isDark ? '#1a1a1a' : '#f0f0f0',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  {profile.avatarUrl
                    ? <img src={profile.avatarUrl} alt={profile.fullName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <User size={16} color={isDark ? '#666' : '#aaa'} />}
                </div>
                {/* Online dot */}
                <span style={{
                  position: 'absolute', bottom: '-2px', right: '-2px',
                  width: '10px', height: '10px', borderRadius: '50%',
                  backgroundColor: '#22c55e',
                  border: `2px solid ${bg}`,
                }} />
              </div>

              {!isCollapsed && (
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: isDark ? '#fff' : '#111', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{profile.fullName}</span>
                    <ShieldCheck size={12} color="#22c55e" style={{ flexShrink: 0 }} />
                  </div>
                  <div style={{ fontSize: '10px', fontFamily: 'monospace', color: textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    @{profile.username}
                  </div>
                </div>
              )}
            </button>
          </div>
        )}

        {/* Section label */}
        <div style={{
          padding: isCollapsed ? '12px 0 4px' : '12px 20px 4px',
          fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
          color: textMuted, textAlign: isCollapsed ? 'center' : 'left',
          fontFamily: 'monospace',
        }}>
          {isCollapsed ? '•••' : 'Main Menu'}
        </div>

        {/* Nav items */}
        <nav style={{ padding: '4px 10px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const color = NAV_COLORS[item.id];

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                title={item.label}
                style={{
                  width: '100%',
                  display: 'flex', alignItems: 'center',
                  gap: isCollapsed ? '0' : '10px',
                  justifyContent: isCollapsed ? 'center' : 'flex-start',
                  padding: isCollapsed ? '10px 0' : '10px 12px',
                  borderRadius: '12px',
                  border: `1.5px solid ${isActive ? color.active + '66' : 'transparent'}`,
                  backgroundColor: isActive
                    ? isDark ? color.glow : color.glow
                    : 'transparent',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  boxShadow: isActive ? `0 0 10px ${color.glow}` : 'none',
                  position: 'relative',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = isDark ? '#161616' : '#f9fafb';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                {/* Active left accent bar */}
                {isActive && !isCollapsed && (
                  <span style={{
                    position: 'absolute', left: 0, top: '20%', bottom: '20%',
                    width: '3px', borderRadius: '0 3px 3px 0',
                    backgroundColor: color.active,
                    boxShadow: `0 0 6px ${color.active}`,
                  }} />
                )}

                <Icon
                  size={18}
                  style={{
                    flexShrink: 0,
                    color: isActive ? color.icon : isDark ? '#555' : '#9ca3af',
                    filter: isActive ? `drop-shadow(0 0 4px ${color.active}88)` : 'none',
                    transition: 'color 0.15s',
                  }}
                />

                {!isCollapsed && (
                  <span style={{
                    flex: 1, textAlign: 'left', fontSize: '13px',
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? (isDark ? '#fff' : '#111') : (isDark ? '#777' : '#6b7280'),
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {item.label}
                  </span>
                )}

                {/* Badge */}
                {!isCollapsed && item.badge && (
                  <span style={{
                    fontSize: '9px', fontWeight: 800, letterSpacing: '0.04em',
                    padding: '2px 6px', borderRadius: '999px',
                    backgroundColor: item.badge === 'LIVE'
                      ? '#22c55e'
                      : isActive ? color.active : (isDark ? '#222' : '#e5e7eb'),
                    color: item.badge === 'LIVE' || isActive ? '#fff' : (isDark ? '#666' : '#888'),
                    flexShrink: 0,
                  }}>
                    {item.badge}
                  </span>
                )}

                {/* Collapsed tooltip dot for active */}
                {isCollapsed && isActive && (
                  <span style={{
                    position: 'absolute', bottom: '6px',
                    width: '4px', height: '4px', borderRadius: '50%',
                    backgroundColor: color.active,
                    boxShadow: `0 0 4px ${color.active}`,
                  }} />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <div style={{
        padding: '12px 10px',
        borderTop: `1px solid ${border}`,
      }}>
        {!isCollapsed ? (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '8px 10px', borderRadius: '10px',
            backgroundColor: isDark ? '#111' : '#f9fafb',
            border: `1px solid ${border}`,
          }}>
            <Sparkles size={12} color="#a855f7" />
            <span style={{ fontSize: '10px', fontFamily: 'monospace', color: textMuted }}>
              Client-Side AI · v1.0
            </span>
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <Sparkles size={14} color="#a855f7" />
          </div>
        )}
      </div>
    </aside>
  );
};
