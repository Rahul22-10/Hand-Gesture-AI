/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { UserProfile } from '../types/user';
import { Camera, Upload, User, Mail, AtSign, Briefcase, Sparkles, CheckCircle2 } from 'lucide-react';
import { AppTheme } from '../types/theme';

interface AuthOnboardingModalProps {
  isOpen: boolean;
  onComplete: (profile: UserProfile) => void;
  theme?: AppTheme;
}

export const AuthOnboardingModal: React.FC<AuthOnboardingModalProps> = ({
  isOpen,
  onComplete,
  theme = 'black',
}) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('Computer Vision Specialist');
  const [preferredHand, setPreferredHand] = useState<'Right' | 'Left' | 'Both'>('Right');
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const isDark = theme === 'black';

  if (!isOpen) return null;

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFullName(val);
    const slug = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]/g, '');
    if (slug) {
      setUsername(slug);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (JPEG, PNG, WebP).');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setError('Image file must be under 8MB.');
      return;
    }

    setError(null);
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

  const setAvatarPreview = (dataUrl: string) => {
    setAvatarUrl(dataUrl);
  };

  const generateDefaultAvatar = (name: string) => {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = isDark ? '#262626' : '#e2e8f0';
      ctx.fillRect(0, 0, 128, 128);

      const initials = name
        .split(' ')
        .map((p) => p[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || 'HG';

      ctx.fillStyle = isDark ? '#ffffff' : '#0f172a';
      ctx.font = 'bold 50px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(initials, 64, 66);
      return canvas.toDataURL('image/png');
    }
    return '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }
    if (!avatarUrl) {
      setError('Please upload your profile photo from your file.');
      return;
    }

    const finalAvatar = avatarUrl || generateDefaultAvatar(fullName);
    const date = new Date();
    const monthYear = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    const randomHex = Math.random().toString(16).substring(2, 6).toUpperCase();
    const generatedId = `HGAI-${date.getFullYear()}-${randomHex}`;
    const autoBio = `${role} analyzing hand gestures with real-time MediaPipe computer vision.`;

    const newProfile: UserProfile = {
      id: generatedId,
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      username: username.trim().toLowerCase() || fullName.trim().toLowerCase().replace(/\s+/g, '_'),
      role,
      bio: autoBio,
      avatarUrl: finalAvatar,
      createdAt: monthYear,
      createdAtTimestamp: Date.now(),
      preferredHand,
      skillLevel: 'Practitioner',
      accountStatus: 'Active',
    };

    onComplete(newProfile);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md overflow-y-auto ${
        isDark ? 'bg-black/90' : 'bg-slate-900/60'
      }`}
    >
      <div
        className={`relative w-full max-w-lg my-8 rounded-2xl border p-6 sm:p-8 overflow-hidden transition-colors ${
          isDark
            ? 'bg-[#0f0f10] border-neutral-800 text-white shadow-2xl'
            : 'bg-white border-slate-200 text-slate-900 shadow-2xl'
        }`}
      >
        {/* Header */}
        <div className="text-center mb-6">
          <div
            className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-3 shadow-md ${
              isDark ? 'bg-white text-black' : 'bg-slate-900 text-white'
            }`}
          >
            <Sparkles className="w-6 h-6 stroke-[2.5]" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight">
            Welcome to Hand Gesture AI
          </h2>
          <p className={`text-xs mt-1 max-w-sm mx-auto leading-relaxed ${isDark ? 'text-neutral-400' : 'text-slate-500'}`}>
            First-time registration is required. Enter your details and upload your photo to automatically generate your gesture intelligence profile.
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium dark:bg-rose-500/10 dark:border-rose-500/25 dark:text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Profile Photo File Upload */}
          <div className="flex flex-col items-center justify-center pb-2">
            <div className="relative group">
              <div
                className={`w-24 h-24 rounded-full overflow-hidden border-2 flex items-center justify-center shadow-lg ${
                  isDark ? 'bg-black border-neutral-700' : 'bg-slate-100 border-slate-300'
                }`}
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Uploaded Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center opacity-50 text-center p-2">
                    <User className="w-8 h-8 mb-1" />
                    <span className="text-[10px]">No Photo</span>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`absolute bottom-0 right-0 w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all cursor-pointer ${
                  isDark ? 'bg-white text-black hover:bg-neutral-200' : 'bg-slate-900 text-white hover:bg-slate-800'
                }`}
                title="Upload Photo From File"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={`mt-2.5 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                isDark ? 'text-white hover:underline' : 'text-slate-900 hover:underline'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              {avatarUrl ? 'Change Photo from File' : 'Upload Profile Photo *'}
            </button>
            <span className={`text-[11px] mt-0.5 ${isDark ? 'text-neutral-500' : 'text-slate-400'}`}>JPG, PNG, or WebP</span>
          </div>

          {/* Full Name */}
          <div>
            <label className={`block text-xs font-medium mb-1.5 ${isDark ? 'text-neutral-300' : 'text-slate-700'}`}>
              Full Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={fullName}
                onChange={handleNameChange}
                placeholder="e.g. Rahul Sharma"
                className={`w-full rounded-xl px-3.5 py-2.5 pl-10 text-xs border focus:outline-none transition-colors ${
                  isDark ? 'bg-black border-neutral-800 text-white focus:border-white' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-slate-900'
                }`}
              />
              <User className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${isDark ? 'text-neutral-500' : 'text-slate-400'}`} />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className={`block text-xs font-medium mb-1.5 ${isDark ? 'text-neutral-300' : 'text-slate-700'}`}>
              Email Address <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. rahul@example.com"
                className={`w-full rounded-xl px-3.5 py-2.5 pl-10 text-xs border focus:outline-none transition-colors ${
                  isDark ? 'bg-black border-neutral-800 text-white focus:border-white' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-slate-900'
                }`}
              />
              <Mail className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${isDark ? 'text-neutral-500' : 'text-slate-400'}`} />
            </div>
          </div>

          {/* Username & Role Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className={`block text-xs font-medium mb-1.5 ${isDark ? 'text-neutral-300' : 'text-slate-700'}`}>
                Username Handle
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="username"
                  className={`w-full rounded-xl px-3.5 py-2.5 pl-10 text-xs border focus:outline-none transition-colors ${
                    isDark ? 'bg-black border-neutral-800 text-white focus:border-white' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-slate-900'
                  }`}
                />
                <AtSign className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${isDark ? 'text-neutral-500' : 'text-slate-400'}`} />
              </div>
            </div>

            <div>
              <label className={`block text-xs font-medium mb-1.5 ${isDark ? 'text-neutral-300' : 'text-slate-700'}`}>
                Role / Field
              </label>
              <div className="relative">
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className={`w-full rounded-xl px-3.5 py-2.5 pl-10 text-xs border focus:outline-none transition-colors appearance-none cursor-pointer ${
                    isDark ? 'bg-black border-neutral-800 text-white focus:border-white' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-slate-900'
                  }`}
                >
                  <option value="Computer Vision Specialist">Computer Vision Specialist</option>
                  <option value="AI / ML Engineer">AI / ML Engineer</option>
                  <option value="Software Developer">Software Developer</option>
                  <option value="Student / Researcher">Student / Researcher</option>
                  <option value="Interactive Creator">Interactive Creator</option>
                  <option value="Gesture Enthusiast">Gesture Enthusiast</option>
                </select>
                <Briefcase className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${isDark ? 'text-neutral-500' : 'text-slate-400'}`} />
              </div>
            </div>
          </div>

          {/* Preferred Hand */}
          <div>
            <label className={`block text-xs font-medium mb-1.5 ${isDark ? 'text-neutral-300' : 'text-slate-700'}`}>
              Primary Hand Preference
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Right', 'Left', 'Both'] as const).map((hand) => (
                <button
                  type="button"
                  key={hand}
                  onClick={() => setPreferredHand(hand)}
                  className={`py-2 px-3 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                    preferredHand === hand
                      ? isDark
                        ? 'bg-white text-black font-bold border-white'
                        : 'bg-slate-900 text-white font-bold border-slate-900'
                      : isDark
                      ? 'bg-black border-neutral-800 text-neutral-400 hover:text-white'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {hand} Hand
                </button>
              ))}
            </div>
          </div>

          {/* Auto-Creation Notice */}
          <div
            className={`p-3 rounded-xl border text-[11px] flex items-start gap-2 ${
              isDark ? 'bg-black border-neutral-800 text-neutral-400' : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <span>
              Your personal profile, telemetry metrics, and recognition history will be generated and linked to your session.
            </span>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className={`w-full py-3 px-4 text-xs font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer mt-2 ${
              isDark
                ? 'bg-white text-black hover:bg-neutral-200'
                : 'bg-slate-900 text-white hover:bg-slate-800'
            }`}
          >
            Create Profile & Start Application
          </button>
        </form>
      </div>
    </div>
  );
};
