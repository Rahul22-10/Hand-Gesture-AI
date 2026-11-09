/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { UserProfile } from '../types/user';
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
  Download,
  Briefcase,
  AtSign,
  IdCard,
  CheckCircle2,
} from 'lucide-react';
import { AppTheme } from '../types/theme';

interface ProfileViewProps {
  profile: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  onLogout: () => void;
  theme?: AppTheme;
  history?: unknown;
  onNavigateToCamera?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  profile,
  onUpdateProfile,
  onLogout,
  theme = 'black',
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(profile.fullName);
  const [editUsername, setEditUsername] = useState(profile.username);
  const [editEmail, setEditEmail] = useState(profile.email);
  const [editRole, setEditRole] = useState(profile.role);
  const [editBio, setEditBio] = useState(profile.bio);
  const [avatarPreview, setAvatarPreview] = useState(profile.avatarUrl);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const isDark = theme === 'black';

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
            maxDim;
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
      username: editUsername.trim() || profile.username,
      email: editEmail.trim() || profile.email,
      role: editRole.trim() || profile.role,
      bio: editBio.trim() || profile.bio,
      avatarUrl: avatarPreview || profile.avatarUrl,
    };
    onUpdateProfile(updated);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditName(profile.fullName);
    setEditUsername(profile.username);
    setEditEmail(profile.email);
    setEditRole(profile.role);
    setEditBio(profile.bio);
    setAvatarPreview(profile.avatarUrl);
    setIsEditing(false);
  };

  const exportProfileJSON = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(profile, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `user-profile-${profile.username}-${Date.now()}.json`;
    a.click();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* ── Main Profile Card ─────────────────────────────────────────── */}
      <div
        className={`rounded-3xl border overflow-hidden transition-colors ${
          isDark
            ? 'bg-[#0f0f12] border-neutral-800 text-white shadow-xl'
            : 'bg-white border-slate-200 text-slate-900 shadow-sm'
        }`}
      >
        {/* Cover banner - clean neutral without rainbow */}
        <div
          className={`h-28 sm:h-36 w-full relative border-b ${
            isDark
              ? 'bg-gradient-to-b from-neutral-800/60 to-neutral-900 border-neutral-800'
              : 'bg-gradient-to-b from-slate-100 to-slate-200 border-slate-200'
          }`}
        />

        {/* Profile Content Container */}
        <div className="px-6 sm:px-8 pb-8 pt-0 relative">
          {/* Avatar and Action Buttons Row */}
          <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between -mt-16 sm:-mt-20 mb-6 gap-4">
            {/* Avatar */}
            <div className="relative group">
              <div
                className={`w-28 h-28 sm:w-32 sm:h-32 rounded-3xl overflow-hidden border-4 shadow-2xl flex items-center justify-center ${
                  isDark ? 'bg-black border-[#0f0f12]' : 'bg-white border-white'
                }`}
              >
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt={profile.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-16 h-16 opacity-40 text-neutral-400" />
                )}
              </div>

              {isEditing && (
                <>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-1 -right-1 p-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg cursor-pointer transition-transform hover:scale-105"
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

            {/* Action Buttons */}
            <div className="flex items-center gap-2.5">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm cursor-pointer transition-all"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Save Changes
                  </button>
                  <button
                    onClick={handleCancel}
                    className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                      isDark
                        ? 'bg-neutral-900 text-neutral-300 border-neutral-700 hover:text-white'
                        : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
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
                    className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      isDark
                        ? 'bg-neutral-900 text-white border-neutral-700 hover:bg-neutral-800'
                        : 'bg-slate-100 text-slate-900 border-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Edit Profile
                  </button>
                  <button
                    onClick={exportProfileJSON}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                      isDark
                        ? 'bg-neutral-900 text-neutral-300 border-neutral-700 hover:text-white'
                        : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
                    }`}
                    title="Export Profile JSON"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={onLogout}
                    className="flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold text-rose-500 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-xl transition-all cursor-pointer"
                    title="Log out"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log Out</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* User Name & Core Info */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {profile.fullName}
              </h1>
              <span className="flex items-center gap-1 text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-500">
                <CheckCircle2 className="w-3 h-3" />
                Active Account
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
              <span className={`flex items-center gap-1.5 font-medium ${isDark ? 'text-neutral-400' : 'text-slate-600'}`}>
                <AtSign className="w-3.5 h-3.5 text-indigo-400" />
                {profile.username}
              </span>
              <span className={`flex items-center gap-1.5 font-medium ${isDark ? 'text-neutral-400' : 'text-slate-600'}`}>
                <Briefcase className="w-3.5 h-3.5 text-purple-400" />
                {profile.role || 'Member'}
              </span>
              <span className={`flex items-center gap-1.5 font-medium ${isDark ? 'text-neutral-400' : 'text-slate-600'}`}>
                <Mail className="w-3.5 h-3.5 text-blue-400" />
                {profile.email}
              </span>
              <span className={`flex items-center gap-1.5 font-medium ${isDark ? 'text-neutral-400' : 'text-slate-600'}`}>
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                Joined {profile.createdAt}
              </span>
            </div>

            {/* Bio */}
            {!isEditing && profile.bio && (
              <p className={`text-sm leading-relaxed pt-2 max-w-2xl ${isDark ? 'text-neutral-300' : 'text-slate-700'}`}>
                {profile.bio}
              </p>
            )}
          </div>

          {/* Edit Form */}
          {isEditing && (
            <div className={`mt-8 pt-6 border-t ${isDark ? 'border-neutral-800' : 'border-slate-200'}`}>
              <h3 className="text-sm font-bold mb-4">Edit Profile Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-neutral-400' : 'text-slate-600'}`}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className={`w-full rounded-xl px-3.5 py-2.5 text-xs border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                      isDark ? 'bg-black border-neutral-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-neutral-400' : 'text-slate-600'}`}>
                    Username
                  </label>
                  <input
                    type="text"
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    className={`w-full rounded-xl px-3.5 py-2.5 text-xs border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                      isDark ? 'bg-black border-neutral-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-neutral-400' : 'text-slate-600'}`}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className={`w-full rounded-xl px-3.5 py-2.5 text-xs border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                      isDark ? 'bg-black border-neutral-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-neutral-400' : 'text-slate-600'}`}>
                    Role / Title
                  </label>
                  <input
                    type="text"
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value)}
                    className={`w-full rounded-xl px-3.5 py-2.5 text-xs border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                      isDark ? 'bg-black border-neutral-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-neutral-400' : 'text-slate-600'}`}>
                    About & Bio
                  </label>
                  <textarea
                    rows={3}
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    className={`w-full rounded-xl px-3.5 py-2.5 text-xs border focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                      isDark ? 'bg-black border-neutral-700 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── User Information Cards ────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Account Details Card */}
        <div
          className={`rounded-2xl p-6 border space-y-4 ${
            isDark ? 'bg-[#0f0f12] border-neutral-800' : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <div className="flex items-center gap-2 text-sm font-bold">
            <IdCard className="w-4 h-4 text-indigo-400" />
            <span>Account Details</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className={`flex items-center justify-between py-2 border-b ${isDark ? 'border-neutral-800/80' : 'border-slate-100'}`}>
              <span className={isDark ? 'text-neutral-400' : 'text-slate-500'}>Full Name</span>
              <span className="font-semibold">{profile.fullName}</span>
            </div>
            <div className={`flex items-center justify-between py-2 border-b ${isDark ? 'border-neutral-800/80' : 'border-slate-100'}`}>
              <span className={isDark ? 'text-neutral-400' : 'text-slate-500'}>Username</span>
              <span className="font-mono font-semibold">@{profile.username}</span>
            </div>
            <div className={`flex items-center justify-between py-2 border-b ${isDark ? 'border-neutral-800/80' : 'border-slate-100'}`}>
              <span className={isDark ? 'text-neutral-400' : 'text-slate-500'}>Email Address</span>
              <span className="font-semibold">{profile.email}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className={isDark ? 'text-neutral-400' : 'text-slate-500'}>User Role</span>
              <span className="font-semibold">{profile.role || 'Standard Member'}</span>
            </div>
          </div>
        </div>

        {/* Security & Membership Card */}
        <div
          className={`rounded-2xl p-6 border space-y-4 ${
            isDark ? 'bg-[#0f0f12] border-neutral-800' : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <div className="flex items-center gap-2 text-sm font-bold">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>Security & Membership</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className={`flex items-center justify-between py-2 border-b ${isDark ? 'border-neutral-800/80' : 'border-slate-100'}`}>
              <span className={isDark ? 'text-neutral-400' : 'text-slate-500'}>Account ID</span>
              <span className="font-mono font-semibold">{profile.id}</span>
            </div>
            <div className={`flex items-center justify-between py-2 border-b ${isDark ? 'border-neutral-800/80' : 'border-slate-100'}`}>
              <span className={isDark ? 'text-neutral-400' : 'text-slate-500'}>Account Status</span>
              <span className="font-semibold text-emerald-500 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Active
              </span>
            </div>
            <div className={`flex items-center justify-between py-2 border-b ${isDark ? 'border-neutral-800/80' : 'border-slate-100'}`}>
              <span className={isDark ? 'text-neutral-400' : 'text-slate-500'}>Member Since</span>
              <span className="font-semibold">{profile.createdAt}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className={isDark ? 'text-neutral-400' : 'text-slate-500'}>Session Security</span>
              <span className="font-mono text-emerald-500 font-semibold">Protected</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
