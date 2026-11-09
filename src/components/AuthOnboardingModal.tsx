/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { UserProfile } from '../types/user';
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  ArrowLeft,
  Camera,
  Upload,
} from 'lucide-react';
import { AppTheme } from '../types/theme';

interface AuthOnboardingModalProps {
  isOpen: boolean;
  onComplete: (profile: UserProfile) => void;
  theme?: AppTheme;
}

type AuthMode = 'login' | 'register' | 'forgot_password';

// ─── Module-Level Subcomponents (STABLE REFERENCES, PREVENTS FOCUS LOSS) ──────

interface InputFieldProps {
  icon: React.ElementType;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  rightElement?: React.ReactNode;
  isDark: boolean;
  autoComplete?: string;
}

const InputField: React.FC<InputFieldProps> = ({
  icon: Icon,
  type,
  value,
  onChange,
  placeholder,
  rightElement,
  isDark,
  autoComplete,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputBg = isDark ? '#262626' : '#f3f4f6';
  const inputBorder = isFocused
    ? '1px solid #22c55e'
    : isDark ? '1px solid #333' : '1px solid transparent';
  const inputColor = isDark ? '#ffffff' : '#111827';
  const subtitleColor = isDark ? '#9ca3af' : '#6b7280';

  return (
    <div style={{ position: 'relative' }}>
      <Icon
        size={17}
        style={{
          position: 'absolute',
          left: '14px',
          top: '50%',
          transform: 'translateY(-50%)',
          color: subtitleColor,
          pointerEvents: 'none',
        }}
      />
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        style={{
          width: '100%',
          backgroundColor: inputBg,
          border: inputBorder,
          borderRadius: '14px',
          padding: '14px 16px 14px 44px',
          paddingRight: rightElement ? '44px' : '16px',
          fontSize: '14px',
          color: inputColor,
          outline: 'none',
          boxShadow: isFocused ? '0 0 0 2.5px rgba(34,197,94,0.35)' : 'none',
          transition: 'box-shadow 0.2s, border-color 0.2s',
        }}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
      {rightElement && (
        <div style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)' }}>
          {rightElement}
        </div>
      )}
    </div>
  );
};

const EyeToggle: React.FC<{ show: boolean; toggle: () => void; isDark?: boolean }> = ({
  show,
  toggle,
  isDark,
}) => (
  <button
    type="button"
    onClick={toggle}
    tabIndex={-1}
    style={{
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: isDark ? '#9ca3af' : '#6b7280',
      padding: 0,
      display: 'flex',
    }}
  >
    {show ? <EyeOff size={17} /> : <Eye size={17} />}
  </button>
);

const BackButton: React.FC<{ onClick: () => void; isDark: boolean }> = ({ onClick, isDark }) => (
  <button
    type="button"
    onClick={onClick}
    style={{
      width: '36px',
      height: '36px',
      borderRadius: '50%',
      backgroundColor: isDark ? '#262626' : '#f3f4f6',
      border: isDark ? '1px solid #333' : '1px solid transparent',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      color: isDark ? '#9ca3af' : '#6b7280',
      marginBottom: '20px',
      transition: 'background-color 0.2s',
    }}
  >
    <ArrowLeft size={16} />
  </button>
);

const PillButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
}> = ({ children, onClick, type = 'button' }) => (
  <button
    type={type}
    onClick={onClick}
    style={{
      width: '100%',
      backgroundColor: '#22c55e',
      color: '#ffffff',
      border: 'none',
      borderRadius: '50px',
      padding: '15px 24px',
      fontSize: '15px',
      fontWeight: '700',
      cursor: 'pointer',
      letterSpacing: '0.01em',
      transition: 'background-color 0.2s, transform 0.1s',
      marginTop: '4px',
    }}
    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#16a34a'; }}
    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#22c55e'; }}
  >
    {children}
  </button>
);

const SocialSection: React.FC<{ isDark: boolean }> = ({ isDark }) => {
  const dividerColor = isDark ? '#2a2a2a' : '#e5e7eb';
  const subtitleColor = isDark ? '#9ca3af' : '#6b7280';
  const socialBtnBg = isDark ? '#262626' : '#ffffff';
  const socialBtnBorder = isDark ? '1px solid #333' : '1px solid #e5e7eb';
  const socialBtnShadow = isDark ? 'none' : '0 2px 8px rgba(0,0,0,0.08)';

  return (
    <div style={{ marginTop: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <div style={{ flex: 1, height: '1px', backgroundColor: dividerColor }} />
        <span style={{ fontSize: '12px', color: subtitleColor, whiteSpace: 'nowrap' }}>
          Or Continue With Account
        </span>
        <div style={{ flex: 1, height: '1px', backgroundColor: dividerColor }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
        <button
          type="button"
          title="Continue with Facebook"
          style={{
            width: '52px',
            height: '52px',
            borderRadius: '50%',
            backgroundColor: socialBtnBg,
            border: socialBtnBorder,
            boxShadow: socialBtnShadow,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            fontWeight: '900',
            color: '#1877F2',
            transition: 'transform 0.15s',
          }}
        >
          f
        </button>
        <button
          type="button"
          title="Continue with Google"
          style={{
            width: '52px',
            height: '52px',
            borderRadius: '50%',
            backgroundColor: socialBtnBg,
            border: socialBtnBorder,
            boxShadow: socialBtnShadow,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.15s',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
        </button>
        <button
          type="button"
          title="Continue with Apple"
          style={{
            width: '52px',
            height: '52px',
            borderRadius: '50%',
            backgroundColor: socialBtnBg,
            border: socialBtnBorder,
            boxShadow: socialBtnShadow,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.15s',
          }}
        >
          <svg width="18" height="20" viewBox="0 0 814 1000" fill={isDark ? '#ffffff' : '#000000'}>
            <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-37.3-152.8-91.3c-57.6-65.1-109-170-109-269.8 0-174.6 112.3-266.6 222.5-266.6 73.4 0 134.4 48.4 170.3 48.4 34.5 0 102.8-51.4 183.9-51.4zm-93.6-200.9c35.9-45.3 61.6-110 61.6-174.6 0-8.3-.6-16.6-2-23.5-57.6 2.6-135.4 39.5-180.1 103.1-32.5 42.1-64.5 108.2-64.5 172.9 0 9.6 1.3 19.2 1.9 22.4 4.5.7 11.5 1.3 18.5 1.3 51.4 0 125.7-35.3 164.6-101.6z"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

// ─── Main AuthOnboardingModal Component ──────────────────────────────────────

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
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [role, setRole] = useState('Computer Vision Specialist');
  const [preferredHand, setPreferredHand] = useState<'Right' | 'Left' | 'Both'>('Right');
  const [avatarUrl, setAvatarUrl] = useState<string>('');

  // Forgot Password state
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  // General feedback
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const isDark = theme === 'black';

  useEffect(() => {
    setError(null);
    setNotification(null);
    setForgotSuccess(false);
  }, [authMode]);

  if (!isOpen) return null;

  // ─── Helpers ────────────────────────────────────────────────────────────────

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFullName(val);
    const slug = val.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
    if (slug && !username) setUsername(slug);
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
          if (w > maxDim) { h = Math.round((h * maxDim) / w); w = maxDim; }
        } else {
          if (h > maxDim) { w = Math.round((w * maxDim) / h); h = maxDim; }
        }
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (ctx) { ctx.drawImage(img, 0, 0, w, h); setAvatarUrl(canvas.toDataURL('image/jpeg', 0.85)); }
        else setAvatarUrl(src);
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  const generateDefaultAvatar = (name: string) => {
    const canvas = document.createElement('canvas');
    canvas.width = 128; canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createLinearGradient(0, 0, 128, 128);
      grad.addColorStop(0, '#22c55e');
      grad.addColorStop(1, '#16a34a');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(64, 64, 64, 0, Math.PI * 2);
      ctx.fill();
      const initials = name.split(' ').map((p) => p[0]).join('').toUpperCase().slice(0, 2) || 'HG';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 48px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(initials, 64, 65);
      return canvas.toDataURL('image/png');
    }
    return '';
  };

  // ─── Form Handlers ──────────────────────────────────────────────────────────

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const identifier = loginIdentifier.trim();
    const pwd = loginPassword.trim();
    if (!identifier) { setError('Please enter your username or email.'); return; }
    if (!pwd) { setError('Please enter your password.'); return; }

    try {
      const stored = localStorage.getItem('hand_gesture_registered_users');
      const registeredUsers: UserProfile[] = stored ? JSON.parse(stored) : [];
      const match = registeredUsers.find(
        (u) =>
          (u.email.toLowerCase() === identifier.toLowerCase() ||
           u.username.toLowerCase() === identifier.toLowerCase()) &&
          u.password === pwd
      );

      if (match) {
        onComplete(match);
        return;
      }
    } catch { /* ignore */ }

    // Fallback: If no match found in stored list, log in with demo/entered credentials
    const cleanName = identifier.includes('@')
      ? identifier.split('@')[0].replace(/[._-]/g, ' ')
      : identifier;
    const displayName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
    const fallbackProfile: UserProfile = {
      id: `USR-${Math.floor(1000 + Math.random() * 9000)}`,
      fullName: displayName || 'Authenticated User',
      email: identifier.includes('@') ? identifier.toLowerCase() : `${identifier.toLowerCase()}@gesturedemo.ai`,
      username: identifier.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase() || 'user',
      password: pwd,
      role: 'Computer Vision Specialist',
      bio: 'Ready to perform real-time hand gesture recognition with local client-side biometric inference.',
      avatarUrl: generateDefaultAvatar(displayName || 'User'),
      createdAt: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      createdAtTimestamp: Date.now(),
      preferredHand: 'Right',
      skillLevel: 'Practitioner',
      accountStatus: 'Active',
    };

    onComplete(fallbackProfile);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) { setError('Full Name is required.'); return; }
    if (!email.trim() || !email.includes('@')) { setError('Please enter a valid email address.'); return; }
    if (!username.trim() || username.length < 3) { setError('Username must be at least 3 characters.'); return; }
    if (!registerPassword) { setError('Password is required.'); return; }
    if (registerPassword.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (registerPassword !== confirmPassword) { setError('Passwords do not match.'); return; }

    const now = new Date();
    const monthYear = now.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    const finalAvatar = avatarUrl || generateDefaultAvatar(fullName.trim());
    const generatedId = `USR-${Math.floor(1000 + Math.random() * 9000)}`;

    const autoBio =
      role === 'Computer Vision Specialist'
        ? `Computer Vision Specialist specializing in hand landmark geometry and real-time gesture pipelines.`
        : `Active member utilizing client-side MediaPipe gesture tracking and biometric control.`;

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
    } catch { /* ignore */ }

    onComplete(newProfile);
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) { setError('Please enter your email or username to recover password.'); return; }
    setError(null);
    setForgotSuccess(true);
    setNotification(`Password reset instructions have been sent to ${forgotEmail}. Please check your inbox.`);
  };

  // ─── Theme tokens ────────────────────────────────────────────────────────────
  const cardBg = isDark ? '#1a1a1a' : '#ffffff';
  const inputBg = isDark ? '#262626' : '#f3f4f6';
  const inputBorder = isDark ? '1px solid #333' : '1px solid transparent';
  const labelColor = isDark ? '#d1d5db' : '#374151';
  const subtitleColor = isDark ? '#9ca3af' : '#6b7280';
  const headingColor = isDark ? '#ffffff' : '#111827';
  const cardShadow = isDark
    ? '0 25px 60px rgba(0,0,0,0.8)'
    : '0 25px 60px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.06)';
  const secondaryTextColor = isDark ? '#6b7280' : '#6b7280';
  const green = '#22c55e';
  const greenLight = isDark ? 'rgba(34,197,94,0.15)' : '#dcfce7';

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
        backgroundColor: isDark ? 'rgba(0,0,0,0.85)' : 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(8px)',
        overflowY: 'auto',
      }}
    >
      {/* Card */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '400px',
          backgroundColor: cardBg,
          borderRadius: '28px',
          padding: '32px 28px',
          boxShadow: cardShadow,
          margin: '24px auto',
        }}
      >
        {/* Error Banner */}
        {error && (
          <div
            style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fca5a5',
              borderRadius: '12px',
              padding: '12px 14px',
              marginBottom: '16px',
              fontSize: '13px',
              color: '#dc2626',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
            }}
          >
            <span style={{ fontWeight: 700, flexShrink: 0 }}>!</span>
            <span>{error}</span>
          </div>
        )}

        {/* Success Banner */}
        {notification && (
          <div
            style={{
              backgroundColor: greenLight,
              border: `1px solid ${green}66`,
              borderRadius: '12px',
              padding: '12px 14px',
              marginBottom: '16px',
              fontSize: '13px',
              color: isDark ? '#86efac' : '#15803d',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
            }}
          >
            <CheckCircle2 size={16} style={{ flexShrink: 0, marginTop: '1px' }} />
            <span>{notification}</span>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* LOGIN */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {authMode === 'login' && (
          <form onSubmit={handleLoginSubmit}>
            {/* Heading */}
            <h2
              style={{
                fontSize: '30px', fontWeight: '800', color: headingColor,
                textAlign: 'center', marginBottom: '8px', letterSpacing: '-0.5px',
              }}
            >
              Log in
            </h2>
            <p style={{ textAlign: 'center', color: subtitleColor, fontSize: '13px', marginBottom: '28px', lineHeight: '1.5' }}>
              Enter your email and password to securely access<br />your account and manage your services.
            </p>

            {/* Email */}
            <div style={{ marginBottom: '12px' }}>
              <InputField
                icon={Mail}
                type="text"
                value={loginIdentifier}
                onChange={(e) => setLoginIdentifier(e.target.value)}
                placeholder="Email address"
                isDark={isDark}
                autoComplete="username"
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: '14px' }}>
              <InputField
                icon={Lock}
                type={showLoginPassword ? 'text' : 'password'}
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Password"
                isDark={isDark}
                autoComplete="current-password"
                rightElement={
                  <EyeToggle
                    show={showLoginPassword}
                    toggle={() => setShowLoginPassword((p) => !p)}
                    isDark={isDark}
                  />
                }
              />
            </div>

            {/* Remember me + Forgot */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '7px', cursor: 'pointer', fontSize: '13px', color: labelColor }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ width: '15px', height: '15px', accentColor: green, cursor: 'pointer' }}
                />
                Remember me
              </label>
              <button
                type="button"
                onClick={() => setAuthMode('forgot_password')}
                style={{ background: 'none', border: 'none', color: labelColor, fontSize: '13px', fontWeight: '600', cursor: 'pointer', padding: 0 }}
              >
                Forgot Password
              </button>
            </div>

            {/* Login Button */}
            <PillButton type="submit">Login</PillButton>

            {/* Sign up link */}
            <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '13px', color: secondaryTextColor }}>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setAuthMode('register')}
                style={{ background: 'none', border: 'none', color: green, fontWeight: '700', cursor: 'pointer', fontSize: '13px', padding: 0 }}
              >
                Sign Up here
              </button>
            </p>

            {/* Social */}
            <SocialSection isDark={isDark} />
          </form>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* REGISTER */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {authMode === 'register' && (
          <form onSubmit={handleRegisterSubmit}>
            {/* Back */}
            <BackButton onClick={() => setAuthMode('login')} isDark={isDark} />

            {/* Heading */}
            <h2
              style={{
                fontSize: '28px', fontWeight: '800', color: headingColor,
                textAlign: 'center', marginBottom: '8px', letterSpacing: '-0.5px',
              }}
            >
              Create Account
            </h2>
            <p style={{ textAlign: 'center', color: subtitleColor, fontSize: '13px', marginBottom: '24px', lineHeight: '1.5' }}>
              Create a new account to get started and enjoy<br />seamless access to our features.
            </p>

            {/* Avatar Upload (optional) */}
            <div
              style={{
                display: 'flex', alignItems: 'center', gap: '14px',
                backgroundColor: inputBg,
                borderRadius: '14px', padding: '12px 14px',
                marginBottom: '12px',
              }}
            >
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div
                  style={{
                    width: '50px', height: '50px', borderRadius: '50%',
                    overflow: 'hidden',
                    backgroundColor: isDark ? '#333' : '#e5e7eb',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: `2px solid ${green}44`,
                  }}
                >
                  {avatarUrl
                    ? <img src={avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <User size={22} style={{ color: subtitleColor }} />}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    position: 'absolute', bottom: '-2px', right: '-2px',
                    width: '20px', height: '20px', borderRadius: '50%',
                    backgroundColor: green, border: '2px solid ' + cardBg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                  title="Upload photo"
                >
                  <Camera size={10} color="#fff" />
                </button>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '12px', fontWeight: '700', color: headingColor, marginBottom: '2px' }}>
                  Profile Photo
                  <span style={{ fontSize: '10px', fontWeight: '500', color: subtitleColor, marginLeft: '6px' }}>
                    Optional
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    style={{ background: 'none', border: 'none', color: green, fontSize: '12px', fontWeight: '600', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: '3px' }}
                  >
                    <Upload size={11} />
                    {avatarUrl ? 'Change' : 'Upload'}
                  </button>
                  {avatarUrl && (
                    <button
                      type="button"
                      onClick={() => setAvatarUrl('')}
                      style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '12px', fontWeight: '600', cursor: 'pointer', padding: 0 }}
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
            </div>

            {/* Name */}
            <div style={{ marginBottom: '12px' }}>
              <InputField
                icon={User}
                type="text"
                value={fullName}
                onChange={handleNameChange}
                placeholder="Name"
                isDark={isDark}
                autoComplete="name"
              />
            </div>

            {/* Email */}
            <div style={{ marginBottom: '12px' }}>
              <InputField
                icon={Mail}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                isDark={isDark}
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: '12px' }}>
              <InputField
                icon={Lock}
                type={showRegisterPassword ? 'text' : 'password'}
                value={registerPassword}
                onChange={(e) => setRegisterPassword(e.target.value)}
                placeholder="Password"
                isDark={isDark}
                autoComplete="new-password"
                rightElement={
                  <EyeToggle
                    show={showRegisterPassword}
                    toggle={() => setShowRegisterPassword((p) => !p)}
                    isDark={isDark}
                  />
                }
              />
            </div>

            {/* Confirm Password */}
            <div style={{ marginBottom: '12px' }}>
              <InputField
                icon={Lock}
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm Password"
                isDark={isDark}
                autoComplete="new-password"
                rightElement={
                  <EyeToggle
                    show={showConfirmPassword}
                    toggle={() => setShowConfirmPassword((p) => !p)}
                    isDark={isDark}
                  />
                }
              />
            </div>

            {/* Role + Hand (compact row) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '8px' }}>
              <div style={{ position: 'relative' }}>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: inputBg,
                    border: inputBorder,
                    borderRadius: '14px',
                    padding: '14px 12px',
                    fontSize: '12px',
                    color: isDark ? '#ffffff' : '#111827',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <option value="Computer Vision Specialist">CV Specialist</option>
                  <option value="AI / ML Engineer">AI/ML Engineer</option>
                  <option value="Software Developer">Developer</option>
                  <option value="Student / Researcher">Researcher</option>
                  <option value="Gesture Enthusiast">Enthusiast</option>
                </select>
              </div>

              {/* Primary hand toggle */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px', alignItems: 'center' }}>
                {(['Right', 'Left', 'Both'] as const).map((hand) => (
                  <button
                    key={hand}
                    type="button"
                    onClick={() => setPreferredHand(hand)}
                    style={{
                      padding: '8px 4px',
                      borderRadius: '10px',
                      fontSize: '11px',
                      fontWeight: preferredHand === hand ? '700' : '500',
                      cursor: 'pointer',
                      border: 'none',
                      backgroundColor: preferredHand === hand ? green : inputBg,
                      color: preferredHand === hand ? '#fff' : subtitleColor,
                      transition: 'all 0.15s',
                    }}
                  >
                    {hand}
                  </button>
                ))}
              </div>
            </div>

            {/* Create Account Button */}
            <PillButton type="submit">Create Account</PillButton>

            {/* Sign In link */}
            <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '13px', color: secondaryTextColor }}>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setAuthMode('login')}
                style={{ background: 'none', border: 'none', color: green, fontWeight: '700', cursor: 'pointer', fontSize: '13px', padding: 0 }}
              >
                Sign In here
              </button>
            </p>

            {/* Social */}
            <SocialSection isDark={isDark} />
          </form>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* FORGOT PASSWORD */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {authMode === 'forgot_password' && (
          <div>
            {/* Back */}
            <BackButton onClick={() => setAuthMode('login')} isDark={isDark} />

            {/* Heading */}
            <h2
              style={{
                fontSize: '28px', fontWeight: '800', color: headingColor,
                textAlign: 'center', marginBottom: '8px', letterSpacing: '-0.5px',
              }}
            >
              Forgot Password
            </h2>
            <p style={{ textAlign: 'center', color: subtitleColor, fontSize: '13px', marginBottom: '28px', lineHeight: '1.5' }}>
              Enter your email address to receive a reset link and<br />regain access to your account.
            </p>

            {!forgotSuccess ? (
              <form onSubmit={handleForgotSubmit}>
                <div style={{ marginBottom: '20px' }}>
                  <InputField
                    icon={Mail}
                    type="text"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="Email address"
                    isDark={isDark}
                    autoComplete="email"
                  />
                </div>
                <PillButton type="submit">Continue</PillButton>
              </form>
            ) : (
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    backgroundColor: greenLight,
                    border: `1px solid ${green}66`,
                    borderRadius: '14px',
                    padding: '20px',
                    marginBottom: '20px',
                  }}
                >
                  <CheckCircle2 size={32} style={{ color: green, margin: '0 auto 8px' }} />
                  <p style={{ fontWeight: '700', color: headingColor, fontSize: '14px', marginBottom: '4px' }}>Reset Instructions Sent</p>
                  <p style={{ color: subtitleColor, fontSize: '12px' }}>
                    Please check your email inbox for password recovery instructions.
                  </p>
                </div>
                <PillButton onClick={() => setAuthMode('login')}>Return to Login</PillButton>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
