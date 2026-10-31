/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { UserProfile } from '../types/user';
import {
  Camera,
  Upload,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  KeyRound,
} from 'lucide-react';
import { AppTheme } from '../types/theme';

interface AuthOnboardingModalProps {
  isOpen: boolean;
  onComplete: (profile: UserProfile) => void;
  theme?: AppTheme;
}

type AuthMode = 'login' | 'register' | 'forgot_password';

export const AuthOnboardingModal: React.FC<AuthOnboardingModalProps> = ({
  isOpen,
  onComplete,
  theme = 'black',
}) => {
  const [authMode, setAuthMode] = useState<AuthMode>('login');

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [role, setRole] = useState('Computer Vision Specialist');
  const [preferredHand, setPreferredHand] = useState<'Right' | 'Left' | 'Both'>('Right');
  const [avatarUrl, setAvatarUrl] = useState<string>(''); // Photo is NOT compulsory

  // Forgot Password state
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  // General feedback
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const isDark = theme === 'black';

  // Clear errors when switching modes
  useEffect(() => {
    setError(null);
    setNotification(null);
    setForgotSuccess(false);
  }, [authMode]);

  if (!isOpen) return null;

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFullName(val);
    const slug = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]/g, '');
    if (slug && !username) {
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
          setAvatarUrl(canvas.toDataURL('image/jpeg', 0.85));
        } else {
          setAvatarUrl(src);
        }
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  // Generate fallback SVG/Canvas avatar when photo is omitted (photo is NOT compulsory)
  const generateDefaultAvatar = (name: string) => {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#1c1c1c';
      ctx.fillRect(0, 0, 128, 128);

      ctx.strokeStyle = '#555555';
      ctx.lineWidth = 4;
      ctx.strokeRect(2, 2, 124, 124);

      const initials =
        name
          .split(' ')
          .map((p) => p[0])
          .join('')
          .toUpperCase()
          .slice(0, 2) || 'HG';

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 44px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(initials, 64, 65);
      return canvas.toDataURL('image/png');
    }
    return '';
  };

  // Handle Login Submission
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const identifier = loginIdentifier.trim();
    const pwd = loginPassword.trim();

    if (!identifier) {
      setError('Please enter your username or email.');
      return;
    }
    if (!pwd) {
      setError('Please enter your password.');
      return;
    }

    // Check stored registered users list
    let registeredUsers: UserProfile[] = [];
    try {
      const stored = localStorage.getItem('hand_gesture_registered_users');
      if (stored) {
        registeredUsers = JSON.parse(stored) as UserProfile[];
      }
    } catch {
      registeredUsers = [];
    }

    const matched = registeredUsers.find(
      (u) =>
        u.email.toLowerCase() === identifier.toLowerCase() ||
        u.username.toLowerCase() === identifier.toLowerCase()
    );

    if (matched) {
      if (matched.password && matched.password !== pwd) {
        setError('Incorrect password. Click "Forgot password?" to reset.');
        return;
      }
      onComplete(matched);
      return;
    }

    // Generate dynamic authenticated profile for entered credentials
    const date = new Date();
    const cleanName = identifier.includes('@')
      ? identifier.split('@')[0].replace(/[._-]/g, ' ')
      : identifier;
    const formattedName =
      cleanName.charAt(0).toUpperCase() + cleanName.slice(1);

    const dynamicProfile: UserProfile = {
      id: `HGAI-${date.getFullYear()}-${Math.random().toString(16).substring(2, 6).toUpperCase()}`,
      fullName: formattedName,
      email: identifier.includes('@') ? identifier.toLowerCase() : `${identifier.toLowerCase()}@gesture.ai`,
      username: identifier.toLowerCase().replace(/[^a-z0-9_]/g, ''),
      password: pwd,
      role: 'Computer Vision Specialist',
      bio: 'Practitioner using real-time hand gesture recognition AI.',
      avatarUrl: generateDefaultAvatar(formattedName),
      createdAt: date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      createdAtTimestamp: Date.now(),
      preferredHand: 'Right',
      skillLevel: 'Practitioner',
      accountStatus: 'Active',
    };

    try {
      registeredUsers.push(dynamicProfile);
      localStorage.setItem('hand_gesture_registered_users', JSON.stringify(registeredUsers));
    } catch {
      // ignore
    }

    onComplete(dynamicProfile);
  };

  // Handle Registration Submission (Photo NOT compulsory, all others required)
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Required fields check: "All required ..but photo not compulsory"
    if (!fullName.trim()) {
      setError('Full Name is required.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('A valid Email address is required.');
      return;
    }
    if (!username.trim()) {
      setError('Username handle is required.');
      return;
    }
    if (!registerPassword) {
      setError('Password is required.');
      return;
    }
    if (registerPassword.length < 4) {
      setError('Password must be at least 4 characters long.');
      return;
    }
    if (confirmPassword && registerPassword !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    // Photo is NOT compulsory: use uploaded photo or auto-generate
    const finalAvatar = avatarUrl || generateDefaultAvatar(fullName);

    const date = new Date();
    const monthYear = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const randomHex = Math.random().toString(16).substring(2, 6).toUpperCase();
    const generatedId = `HGAI-${date.getFullYear()}-${randomHex}`;
    const autoBio = `${role} analyzing hand gestures with client-side MediaPipe vision.`;

    const newProfile: UserProfile = {
      id: generatedId,
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      username: username.trim().toLowerCase(),
      password: registerPassword,
      role,
      bio: autoBio,
      avatarUrl: finalAvatar,
      createdAt: monthYear,
      createdAtTimestamp: Date.now(),
      preferredHand,
      skillLevel: 'Practitioner',
      accountStatus: 'Active',
    };

    try {
      const stored = localStorage.getItem('hand_gesture_registered_users');
      const registeredUsers: UserProfile[] = stored ? JSON.parse(stored) : [];
      registeredUsers.push(newProfile);
      localStorage.setItem('hand_gesture_registered_users', JSON.stringify(registeredUsers));
    } catch {
      // ignore
    }

    onComplete(newProfile);
  };

  // Handle Forgot Password
  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      setError('Please enter your email or username to recover password.');
      return;
    }

    setError(null);
    setForgotSuccess(true);
    setNotification(
      `Password reset instructions have been sent to ${forgotEmail}. Please check your inbox.`
    );
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md overflow-y-auto ${
        isDark ? 'bg-black/90' : 'bg-black/75'
      }`}
      style={{ fontFamily: 'var(--font-sans)' }}
    >
      <div
        className="relative w-full max-w-md my-8 rounded-2xl border overflow-hidden transition-all duration-200 shadow-2xl"
        style={{
          backgroundColor: '#0a0a0a',
          borderColor: '#555555',
          color: '#ffffff',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.9), 0 0 0 1px #555555',
        }}
      >
        {/* Top Accent Line in simple black #555555 */}
        <div
          className="h-1 w-full"
          style={{ backgroundColor: '#555555' }}
        />

        {/* Modal Header */}
        <div className="p-6 sm:p-7 pb-4">
          <div className="flex items-center justify-between mb-4">
            {/* Logo / Title */}
            <div className="flex items-center gap-2.5">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center border shadow-inner"
                style={{
                  backgroundColor: '#161616',
                  borderColor: '#555555',
                  color: '#ffffff',
                }}
              >
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold tracking-tight text-white">
                  Hand Gesture AI
                </h2>
                <p className="text-xs" style={{ color: '#888888' }}>
                  Client-Side Vision System
                </p>
              </div>
            </div>
          </div>

          {/* Mode Switcher Tabs (Login vs Register) */}
          <div
            className="grid grid-cols-2 p-1 rounded-xl border mb-2"
            style={{
              backgroundColor: '#121212',
              borderColor: '#555555',
            }}
          >
            <button
              type="button"
              onClick={() => setAuthMode('login')}
              className="py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
              style={
                authMode === 'login'
                  ? {
                      backgroundColor: '#555555',
                      color: '#ffffff',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
                    }
                  : {
                      backgroundColor: 'transparent',
                      color: '#888888',
                    }
              }
            >
              <User className="w-3.5 h-3.5" />
              <span>Login</span>
            </button>

            <button
              type="button"
              onClick={() => setAuthMode('register')}
              className="py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
              style={
                authMode === 'register'
                  ? {
                      backgroundColor: '#555555',
                      color: '#ffffff',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
                    }
                  : {
                      backgroundColor: 'transparent',
                      color: '#888888',
                    }
              }
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Register</span>
            </button>
          </div>
        </div>

        {/* Feedback / Alert Banners */}
        <div className="px-6 sm:px-7">
          {error && (
            <div
              className="mb-4 p-3 rounded-xl border text-xs font-medium flex items-start gap-2"
              style={{
                backgroundColor: '#2a0e0e',
                borderColor: '#882222',
                color: '#ff9999',
              }}
            >
              <span className="shrink-0 font-bold">!</span>
              <span>{error}</span>
            </div>
          )}

          {notification && (
            <div
              className="mb-4 p-3 rounded-xl border text-xs font-medium flex items-start gap-2"
              style={{
                backgroundColor: '#142214',
                borderColor: '#555555',
                color: '#bbf7d0',
              }}
            >
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
              <span>{notification}</span>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="px-6 sm:px-7 pb-6">
          {/* ========================================================================= */}
          {/* 1. LOGIN MODE */}
          {/* ========================================================================= */}
          {authMode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {/* Field 1: Login Box (Username or Email) */}
              <div>
                <label
                  className="block text-xs font-semibold mb-1.5"
                  style={{ color: '#cccccc' }}
                >
                  Username or Email <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="Enter your username or email"
                    className="w-full rounded-xl px-3.5 py-2.5 pl-10 text-xs border focus:outline-none transition-all placeholder:text-neutral-500"
                    style={{
                      backgroundColor: '#121212',
                      borderColor: '#555555',
                      color: '#ffffff',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#ffffff';
                      e.currentTarget.style.boxShadow = '0 0 0 1px #ffffff';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#555555';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                  <User
                    className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: '#555555' }}
                  />
                </div>
              </div>

              {/* Field 2: Password Box */}
              <div>
                <label
                  className="block text-xs font-semibold mb-1.5"
                  style={{ color: '#cccccc' }}
                >
                  Password <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div className="relative">
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full rounded-xl px-3.5 py-2.5 pl-10 pr-10 text-xs border focus:outline-none transition-all placeholder:text-neutral-500"
                    style={{
                      backgroundColor: '#121212',
                      borderColor: '#555555',
                      color: '#ffffff',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#ffffff';
                      e.currentTarget.style.boxShadow = '0 0 0 1px #ffffff';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#555555';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  />
                  <Lock
                    className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: '#555555' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword((prev) => !prev)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                    title={showLoginPassword ? 'Hide password' : 'Show password'}
                  >
                    {showLoginPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Field 3: SIMPLE BOX UNDER LOGIN BOX AND PASSWORD BOX */}
              <div
                className="p-3.5 rounded-xl border transition-colors"
                style={{
                  backgroundColor: '#141414',
                  borderColor: '#555555',
                }}
              >
                <div className="flex items-center justify-between text-xs">
                  {/* Remember Me Checkbox */}
                  <label className="inline-flex items-center gap-2 cursor-pointer select-none text-neutral-300 hover:text-white">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded cursor-pointer accent-[#555555]"
                    />
                    <span className="text-[12px]">Remember login</span>
                  </label>

                  {/* Forgot Password Button */}
                  <button
                    type="button"
                    onClick={() => setAuthMode('forgot_password')}
                    className="text-[12px] font-semibold transition-all cursor-pointer hover:underline flex items-center gap-1"
                    style={{ color: '#ffffff' }}
                  >
                    <KeyRound className="w-3.5 h-3.5" style={{ color: '#555555' }} />
                    <span>Forgot password?</span>
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3 px-4 text-xs font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer mt-1"
                style={{
                  backgroundColor: '#555555',
                  color: '#ffffff',
                  border: '1px solid #777777',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#666666';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#555555';
                }}
              >
                <span>Login to Hand Gesture AI</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Switch to Register link */}
              <div className="text-center pt-2">
                <span className="text-xs" style={{ color: '#888888' }}>
                  Don't have an account?{' '}
                </span>
                <button
                  type="button"
                  onClick={() => setAuthMode('register')}
                  className="text-xs font-bold hover:underline cursor-pointer"
                  style={{ color: '#ffffff' }}
                >
                  Register here
                </button>
              </div>
            </form>
          )}

          {/* ========================================================================= */}
          {/* 2. REGISTER MODE (All required, but photo NOT compulsory) */}
          {/* ========================================================================= */}
          {authMode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              {/* Photo Box: Clearly marked NOT COMPULSORY */}
              <div
                className="p-3 rounded-xl border flex items-center gap-3.5"
                style={{
                  backgroundColor: '#121212',
                  borderColor: '#555555',
                }}
              >
                <div className="relative shrink-0">
                  <div
                    className="w-14 h-14 rounded-full overflow-hidden border-2 flex items-center justify-center shadow-md"
                    style={{
                      backgroundColor: '#181818',
                      borderColor: '#555555',
                    }}
                  >
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="Profile preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-6 h-6 text-neutral-400" />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center shadow transition-all cursor-pointer border"
                    style={{
                      backgroundColor: '#555555',
                      borderColor: '#777777',
                      color: '#ffffff',
                    }}
                    title="Upload profile photo"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-bold text-white">
                      Profile Photo
                    </span>
                    <span
                      className="text-[10px] font-mono px-1.5 py-0.2 rounded border font-medium"
                      style={{
                        backgroundColor: '#1a1a1a',
                        borderColor: '#555555',
                        color: '#aaaaaa',
                      }}
                    >
                      Photo not compulsory
                    </span>
                  </div>
                  <p className="text-[11px] mt-0.5" style={{ color: '#888888' }}>
                    Optional — if skipped, a personalized avatar is generated automatically.
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-[11px] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                      style={{ color: '#ffffff' }}
                    >
                      <Upload className="w-3 h-3" />
                      {avatarUrl ? 'Change image' : 'Choose file'}
                    </button>
                    {avatarUrl && (
                      <button
                        type="button"
                        onClick={() => setAvatarUrl('')}
                        className="text-[11px] text-rose-400 hover:underline cursor-pointer"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </div>

              {/* Full Name (Required) */}
              <div>
                <label
                  className="block text-xs font-semibold mb-1"
                  style={{ color: '#cccccc' }}
                >
                  Full Name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={handleNameChange}
                    placeholder="Enter your full name"
                    className="w-full rounded-xl px-3.5 py-2 pl-9 text-xs border focus:outline-none transition-all"
                    style={{
                      backgroundColor: '#121212',
                      borderColor: '#555555',
                      color: '#ffffff',
                    }}
                  />
                  <User
                    className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: '#555555' }}
                  />
                </div>
              </div>

              {/* Email Address (Required) */}
              <div>
                <label
                  className="block text-xs font-semibold mb-1"
                  style={{ color: '#cccccc' }}
                >
                  Email Address <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full rounded-xl px-3.5 py-2 pl-9 text-xs border focus:outline-none transition-all"
                    style={{
                      backgroundColor: '#121212',
                      borderColor: '#555555',
                      color: '#ffffff',
                    }}
                  />
                  <Mail
                    className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                    style={{ color: '#555555' }}
                  />
                </div>
              </div>

              {/* Username & Password Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Username Box */}
                <div>
                  <label
                    className="block text-xs font-semibold mb-1"
                    style={{ color: '#cccccc' }}
                  >
                    Username <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Choose a username"
                    className="w-full rounded-xl px-3 py-2 text-xs border focus:outline-none transition-all"
                    style={{
                      backgroundColor: '#121212',
                      borderColor: '#555555',
                      color: '#ffffff',
                    }}
                  />
                </div>

                {/* Password Box */}
                <div>
                  <label
                    className="block text-xs font-semibold mb-1"
                    style={{ color: '#cccccc' }}
                  >
                    Password <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showRegisterPassword ? 'text' : 'password'}
                      required
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      placeholder="Create a password"
                      className="w-full rounded-xl px-3 py-2 pr-8 text-xs border focus:outline-none transition-all"
                      style={{
                        backgroundColor: '#121212',
                        borderColor: '#555555',
                        color: '#ffffff',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegisterPassword((prev) => !prev)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                    >
                      {showRegisterPassword ? (
                        <EyeOff className="w-3.5 h-3.5" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Role & Hand Preference (Required) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    className="block text-xs font-semibold mb-1"
                    style={{ color: '#cccccc' }}
                  >
                    Role / Domain <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    required
                    className="w-full rounded-xl px-3 py-2 text-xs border focus:outline-none transition-all cursor-pointer"
                    style={{
                      backgroundColor: '#121212',
                      borderColor: '#555555',
                      color: '#ffffff',
                    }}
                  >
                    <option value="Computer Vision Specialist">CV Specialist</option>
                    <option value="AI / ML Engineer">AI/ML Engineer</option>
                    <option value="Software Developer">Software Developer</option>
                    <option value="Student / Researcher">Researcher</option>
                    <option value="Gesture Enthusiast">Gesture Enthusiast</option>
                  </select>
                </div>

                <div>
                  <label
                    className="block text-xs font-semibold mb-1"
                    style={{ color: '#cccccc' }}
                  >
                    Primary Hand <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-1">
                    {(['Right', 'Left', 'Both'] as const).map((hand) => (
                      <button
                        type="button"
                        key={hand}
                        onClick={() => setPreferredHand(hand)}
                        className="py-1.5 px-2 rounded-lg border text-xs font-medium transition-all cursor-pointer"
                        style={
                          preferredHand === hand
                            ? {
                                backgroundColor: '#555555',
                                borderColor: '#777777',
                                color: '#ffffff',
                                fontWeight: 'bold',
                              }
                            : {
                                backgroundColor: '#141414',
                                borderColor: '#333333',
                                color: '#888888',
                              }
                        }
                      >
                        {hand}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Notice that all is required, but photo is optional */}
              <div
                className="p-2.5 rounded-xl border text-[11px] flex items-center gap-2"
                style={{
                  backgroundColor: '#141414',
                  borderColor: '#555555',
                  color: '#aaaaaa',
                }}
              >
                <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>
                  All fields required. Profile photo is completely optional.
                </span>
              </div>

              {/* Submit Registration */}
              <button
                type="submit"
                className="w-full py-3 px-4 text-xs font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer mt-1"
                style={{
                  backgroundColor: '#555555',
                  color: '#ffffff',
                  border: '1px solid #777777',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#666666';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#555555';
                }}
              >
                <span>Complete Registration & Launch</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Switch to Login */}
              <div className="text-center pt-1">
                <span className="text-xs" style={{ color: '#888888' }}>
                  Already have an account?{' '}
                </span>
                <button
                  type="button"
                  onClick={() => setAuthMode('login')}
                  className="text-xs font-bold hover:underline cursor-pointer"
                  style={{ color: '#ffffff' }}
                >
                  Sign In
                </button>
              </div>
            </form>
          )}

          {/* ========================================================================= */}
          {/* 3. FORGOT PASSWORD MODE */}
          {/* ========================================================================= */}
          {authMode === 'forgot_password' && (
            <div className="space-y-4">
              <div className="text-center pb-1">
                <div
                  className="w-12 h-12 mx-auto rounded-xl flex items-center justify-center border mb-2"
                  style={{
                    backgroundColor: '#161616',
                    borderColor: '#555555',
                  }}
                >
                  <KeyRound className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-sm font-bold text-white">Reset Password</h3>
                <p className="text-xs mt-1" style={{ color: '#888888' }}>
                  Enter your email address or username to recover access to your account.
                </p>
              </div>

              {!forgotSuccess ? (
                <form onSubmit={handleForgotSubmit} className="space-y-3.5">
                  <div>
                    <label
                      className="block text-xs font-semibold mb-1.5"
                      style={{ color: '#cccccc' }}
                    >
                      Email or Username <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="Enter your email address or username"
                        className="w-full rounded-xl px-3.5 py-2.5 pl-10 text-xs border focus:outline-none transition-all"
                        style={{
                          backgroundColor: '#121212',
                          borderColor: '#555555',
                          color: '#ffffff',
                        }}
                      />
                      <Mail
                        className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                        style={{ color: '#555555' }}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 text-xs font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                    style={{
                      backgroundColor: '#555555',
                      color: '#ffffff',
                      border: '1px solid #777777',
                    }}
                  >
                    Send Reset Instructions
                  </button>

                  <button
                    type="button"
                    onClick={() => setAuthMode('login')}
                    className="w-full py-2 px-4 text-xs font-semibold rounded-xl transition-all cursor-pointer border"
                    style={{
                      backgroundColor: 'transparent',
                      borderColor: '#555555',
                      color: '#cccccc',
                    }}
                  >
                    Cancel and Return to Login
                  </button>
                </form>
              ) : (
                <div className="space-y-3.5 text-center">
                  <div
                    className="p-3.5 rounded-xl border text-xs"
                    style={{
                      backgroundColor: '#142014',
                      borderColor: '#555555',
                      color: '#bbf7d0',
                    }}
                  >
                    <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                    <p className="font-semibold">Reset Instructions Sent</p>
                    <p className="text-[11px] text-neutral-300 mt-1">
                      Please check your email inbox for password recovery instructions.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setAuthMode('login')}
                    className="w-full py-2.5 px-4 text-xs font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                    style={{
                      backgroundColor: '#555555',
                      color: '#ffffff',
                      border: '1px solid #777777',
                    }}
                  >
                    Return to Login
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
