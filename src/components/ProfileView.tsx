/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { UserProfile } from '../types/user';
import { GestureHistoryItem } from '../types/gestures';
import {
  User,
  Mail,
  Calendar,
  Shield,
  Edit3,
  Camera,
  Check,
  X,
  LogOut,
  Award,
  Sparkles,
  Zap,
  Layers,
  Activity,
  Download,
} from 'lucide-react';
import { AppTheme } from '../types/theme';

interface ProfileViewProps {
  profile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  onLogout: () => void;
  history: GestureHistoryItem[];
  onNavigateToCamera: () => void;
  theme?: AppTheme;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  profile,
  onUpdateProfile,
  onLogout,
  history,
  onNavigateToCamera,
  theme = 'black',
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(profile.fullName);
  const [editRole, setEditRole] = useState(profile.role);
  const [editBio, setEditBio] = useState(profile.bio);
  const [editHand, setEditHand] = useState(profile.preferredHand);
  const [avatarPreview, setAvatarPreview] = useState(profile.avatarUrl);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const isDark = theme === 'black';

  // Real statistics from session history
  const totalGestures = history.length;
  const avgConfidence = totalGestures > 0
    ? Math.round(
        (history.reduce((acc, item) => acc + item.confidence, 0) / totalGestures) * 100
      )
    : 92;

  const gestureCounts: Record<string, number> = {};
  history.forEach((item) => {
    gestureCounts[item.gesture] = (gestureCounts[item.gesture] || 0) + 1;
  });
  let topGesture = 'Open Palm';
  let topCount = 0;
  Object.entries(gestureCounts).forEach(([g, count]) => {
    if (count > topCount) {
      topCount = count;
      topGesture = g;
    }
  });

  const rightHandCount = history.filter((h) => h.handedness === 'Right').length;
  const leftHandCount = history.filter((h) => h.handedness === 'Left').length;

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const src = loadEvent.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 256;
        let w = img.width;
        let h = img.height;
        if (w > h) {
          if (w > maxDim) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          }
        } else {
          if (h > maxDim) {
            h = Math.round((h * maxDim) / h);
            h = maxDim;
          }
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, w, h);
          setAvatarPreview(canvas.toDataURL('image/jpeg', 0.85));
        } else {
          setAvatarPreview(src);
        }
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    const updated: UserProfile = {
      ...profile,
      fullName: editName.trim() || profile.fullName,
      role: editRole.trim() || profile.role,
      bio: editBio.trim() || profile.bio,
      preferredHand: editHand,
      avatarUrl: avatarPreview || profile.avatarUrl,
    };
    onUpdateProfile(updated);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditName(profile.fullName);
    setEditRole(profile.role);
    setEditBio(profile.bio);
    setEditHand(profile.preferredHand);
    setAvatarPreview(profile.avatarUrl);
    setIsEditing(false);
  };

  const exportProfileJSON = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify({ profile, historyCount: history.length }, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `profile-${profile.username}-${Date.now()}.json`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Profile Header Card */}
      <div
        className={`rounded-2xl p-6 sm:p-8 border transition-colors ${
          isDark
            ? 'bg-[#0f0f10] border-neutral-800 text-white shadow-xl'
            : 'bg-white border-slate-200 text-slate-900 shadow-sm'
        }`}
      >
        <div className={`flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b ${isDark ? 'border-neutral-800' : 'border-slate-200'}`}>
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
            {/* Avatar with photo or editor */}
            <div className="relative group shrink-0">
              <div
                className={`w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 shadow-lg flex items-center justify-center ${
                  isDark ? 'bg-black border-neutral-700' : 'bg-slate-100 border-slate-300'
                }`}
              >
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt={profile.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-12 h-12 opacity-50" />
                )}
              </div>

              {isEditing && (
                <>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className={`absolute -bottom-2 -right-2 p-2 rounded-xl transition-colors shadow-lg cursor-pointer ${
                      isDark ? 'bg-white text-black hover:bg-neutral-200' : 'bg-slate-900 text-white hover:bg-slate-800'
                    }`}
                    title="Change Profile Photo"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </>
              )}
            </div>

            {/* Profile Identity */}
            <div className="space-y-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                <h2 className="text-2xl font-bold tracking-tight">
                  {profile.fullName}
                </h2>
                <span
                  className={`text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full border ${
                    isDark
                      ? 'bg-neutral-900 border-neutral-700 text-white'
                      : 'bg-slate-100 border-slate-300 text-slate-800'
                  }`}
                >
                  {profile.id}
                </span>
              </div>

              <p className={`text-sm font-medium ${isDark ? 'text-neutral-400' : 'text-slate-600'}`}>
                @{profile.username}
              </p>
              <p className={`text-xs ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
                {profile.role}
              </p>

              <div className={`flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs pt-2 font-mono ${isDark ? 'text-neutral-500' : 'text-slate-400'}`}>
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" />
                  {profile.email}
                </span>
                <span aria-hidden="true">·</span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Joined {profile.createdAt}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 self-center md:self-start">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                    isDark
                      ? 'bg-white text-black hover:bg-neutral-200'
                      : 'bg-slate-900 text-white hover:bg-slate-800'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  Save Changes
                </button>
                <button
                  onClick={handleCancel}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium border rounded-xl transition-all cursor-pointer ${
                    isDark
                      ? 'bg-neutral-900 text-neutral-300 border-neutral-800 hover:text-white'
                      : 'bg-slate-100 text-slate-600 border-slate-200 hover:text-slate-900'
                  }`}
                >
                  <X className="w-3.5 h-3.5" />
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                    isDark
                      ? 'bg-neutral-900 text-white hover:bg-neutral-800 border-neutral-700'
                      : 'bg-slate-100 text-slate-900 hover:bg-slate-200 border-slate-300'
                  }`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Edit Profile
                </button>
                <button
                  onClick={exportProfileJSON}
                  className={`p-2 rounded-xl border transition-all cursor-pointer ${
                    isDark
                      ? 'bg-neutral-900 text-neutral-300 hover:text-white border-neutral-700'
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900 border-slate-300'
                  }`}
                  title="Export profile JSON"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  onClick={onLogout}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-all cursor-pointer dark:bg-rose-500/10 dark:hover:bg-rose-500/20 dark:border-rose-500/30 dark:text-rose-300"
                  title="Log out and reset session"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Log Out</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Edit Form Drawer if active */}
        {isEditing ? (
          <div className="pt-6 space-y-4">
            <h4 className="text-sm font-semibold">Edit Profile Details</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-neutral-400' : 'text-slate-600'}`}>Full Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className={`w-full rounded-xl px-3 py-2 text-xs border focus:outline-none ${
                    isDark ? 'bg-black border-neutral-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-neutral-400' : 'text-slate-600'}`}>Role / Title</label>
                <input
                  type="text"
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  className={`w-full rounded-xl px-3 py-2 text-xs border focus:outline-none ${
                    isDark ? 'bg-black border-neutral-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div className="sm:col-span-2">
                <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-neutral-400' : 'text-slate-600'}`}>About & Bio</label>
                <textarea
                  rows={2}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className={`w-full rounded-xl px-3 py-2 text-xs border focus:outline-none ${
                    isDark ? 'bg-black border-neutral-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-neutral-400' : 'text-slate-600'}`}>
                  Primary Hand Preference
                </label>
                <select
                  value={editHand}
                  onChange={(e) => setEditHand(e.target.value as 'Right' | 'Left' | 'Both')}
                  className={`w-full rounded-xl px-3 py-2 text-xs border focus:outline-none cursor-pointer ${
                    isDark ? 'bg-black border-neutral-700 text-white' : 'bg-white border-slate-300 text-slate-900'
                  }`}
                >
                  <option value="Right">Right Hand</option>
                  <option value="Left">Left Hand</option>
                  <option value="Both">Both Hands</option>
                </select>
              </div>
            </div>
          </div>
        ) : (
          <div className="pt-6">
            <div className={`text-xs uppercase font-mono tracking-wider mb-2 ${isDark ? 'text-neutral-500' : 'text-slate-400'}`}>
              Personal Bio
            </div>
            <p className={`text-sm leading-relaxed max-w-3xl ${isDark ? 'text-neutral-300' : 'text-slate-700'}`}>
              {profile.bio}
            </p>
          </div>
        )}
      </div>

      {/* Profile Metrics & Recognition Activity */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`rounded-2xl p-5 border ${isDark ? 'bg-[#0f0f10] border-neutral-800' : 'bg-white border-slate-200 shadow-xs'}`}>
          <div className={`flex items-center justify-between text-xs font-mono mb-2 ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
            <span>TOTAL GESTURES</span>
            <Activity className="w-4 h-4 opacity-70" />
          </div>
          <div className="text-3xl font-extrabold font-mono tabular-nums">
            {totalGestures}
          </div>
          <div className={`text-xs mt-1 ${isDark ? 'text-neutral-500' : 'text-slate-400'}`}>Recorded in this session</div>
        </div>

        <div className={`rounded-2xl p-5 border ${isDark ? 'bg-[#0f0f10] border-neutral-800' : 'bg-white border-slate-200 shadow-xs'}`}>
          <div className={`flex items-center justify-between text-xs font-mono mb-2 ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
            <span>AVG CONFIDENCE</span>
            <Zap className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-3xl font-extrabold font-mono tabular-nums text-emerald-500">
            {avgConfidence}%
          </div>
          <div className={`text-xs mt-1 ${isDark ? 'text-neutral-500' : 'text-slate-400'}`}>Classification stability</div>
        </div>

        <div className={`rounded-2xl p-5 border ${isDark ? 'bg-[#0f0f10] border-neutral-800' : 'bg-white border-slate-200 shadow-xs'}`}>
          <div className={`flex items-center justify-between text-xs font-mono mb-2 ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
            <span>FAVORITE GESTURE</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-bold truncate">
            {totalGestures > 0 ? topGesture : 'Open Palm'}
          </div>
          <div className={`text-xs mt-1 ${isDark ? 'text-neutral-500' : 'text-slate-400'}`}>
            {totalGestures > 0 ? `${topCount} detections logged` : 'Awaiting camera session'}
          </div>
        </div>

        <div className={`rounded-2xl p-5 border ${isDark ? 'bg-[#0f0f10] border-neutral-800' : 'bg-white border-slate-200 shadow-xs'}`}>
          <div className={`flex items-center justify-between text-xs font-mono mb-2 ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
            <span>HAND PREFERENCE</span>
            <Sparkles className="w-4 h-4 opacity-70" />
          </div>
          <div className="text-xl font-bold">
            {profile.preferredHand} Hand
          </div>
          <div className={`text-xs mt-1 font-mono ${isDark ? 'text-neutral-500' : 'text-slate-400'}`}>
            R: {rightHandCount} · L: {leftHandCount}
          </div>
        </div>
      </div>

      {/* System Credentials & Session Jump */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={`rounded-2xl p-6 border space-y-4 ${isDark ? 'bg-[#0f0f10] border-neutral-800' : 'bg-white border-slate-200 shadow-xs'}`}>
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Shield className="w-4 h-4" />
            <span>Profile Credentials & Verification</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className={`flex items-center justify-between py-2 border-b ${isDark ? 'border-neutral-800' : 'border-slate-200'}`}>
              <span className={isDark ? 'text-neutral-400' : 'text-slate-500'}>Account ID</span>
              <span className="font-mono font-semibold">{profile.id}</span>
            </div>
            <div className={`flex items-center justify-between py-2 border-b ${isDark ? 'border-neutral-800' : 'border-slate-200'}`}>
              <span className={isDark ? 'text-neutral-400' : 'text-slate-500'}>Proficiency Tier</span>
              <span className="font-mono text-emerald-500 font-bold">{profile.skillLevel}</span>
            </div>
            <div className={`flex items-center justify-between py-2 border-b ${isDark ? 'border-neutral-800' : 'border-slate-200'}`}>
              <span className={isDark ? 'text-neutral-400' : 'text-slate-500'}>Storage Persistence</span>
              <span className="font-mono">Local Browser Encrypted Storage</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className={isDark ? 'text-neutral-400' : 'text-slate-500'}>Account Status</span>
              <span className="font-mono text-emerald-500 font-semibold">● ACTIVE</span>
            </div>
          </div>
        </div>

        <div className={`rounded-2xl p-6 border space-y-4 flex flex-col justify-between ${isDark ? 'bg-[#0f0f10] border-neutral-800' : 'bg-white border-slate-200 shadow-xs'}`}>
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold mb-3">
              <Layers className="w-4 h-4" />
              <span>Quick Gesture Session Jump</span>
            </div>
            <p className={`text-xs leading-relaxed mb-4 ${isDark ? 'text-neutral-400' : 'text-slate-600'}`}>
              Your profile is active and ready to test hand gestures. Open the camera module to perform the 10 real-time gestures.
            </p>
          </div>

          <button
            onClick={onNavigateToCamera}
            className={`w-full py-3 px-4 text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2 ${
              isDark ? 'bg-white text-black hover:bg-neutral-200' : 'bg-slate-900 text-white hover:bg-slate-800'
            }`}
          >
            Launch Camera & Gesture Recognition
          </button>
        </div>
      </div>
    </div>
  );
};
