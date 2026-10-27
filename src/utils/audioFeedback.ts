/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

let audioCtx: AudioContext | null = null;
let lastSpokenGesture = '';
let lastSpokenTime = 0;

/**
 * Synthesizes a subtle pleasant high-tech audio tone for gesture confirmation
 */
export function playGestureSound(gestureName: string) {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine';

    let freq = 587.33; // D5
    if (gestureName === 'Thumbs Up') freq = 880; // A5
    else if (gestureName === 'Thumbs Down') freq = 329.63; // E4
    else if (gestureName === 'Peace Sign') freq = 783.99; // G5
    else if (gestureName === 'Open Palm' || gestureName === 'Five Fingers') freq = 659.25; // E5
    else if (gestureName === 'Closed Fist') freq = 440; // A4

    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.25, audioCtx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.12);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.12);
  } catch {
    // Ignore audio errors on unsupported environments
  }
}

/**
 * Speaks the recognized hand gesture out loud immediately using browser Speech Synthesis (TTS)
 */
export function speakGesture(gestureName: string, force = false) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  if (!gestureName || gestureName === 'Unknown') return;

  const now = performance.now();
  // Don't repeat the exact same gesture speech within 1.5 seconds unless gesture changed
  if (!force && gestureName === lastSpokenGesture && now - lastSpokenTime < 1500) {
    return;
  }

  // Friendly spoken phrase as requested: "palm hand", "closed fist", "thumbs up", etc.
  let spokenText = gestureName;
  if (gestureName === 'Open Palm') {
    spokenText = 'Palm hand';
  } else if (gestureName === 'Closed Fist') {
    spokenText = 'Closed fist';
  } else if (gestureName === 'Thumbs Up') {
    spokenText = 'Thumbs up';
  } else if (gestureName === 'Thumbs Down') {
    spokenText = 'Thumbs down';
  } else if (gestureName === 'Peace Sign') {
    spokenText = 'Peace sign';
  } else if (gestureName === 'One Finger') {
    spokenText = 'One finger';
  } else if (gestureName === 'Two Fingers') {
    spokenText = 'Two fingers';
  } else if (gestureName === 'Three Fingers') {
    spokenText = 'Three fingers';
  } else if (gestureName === 'Four Fingers') {
    spokenText = 'Four fingers';
  } else if (gestureName === 'Five Fingers') {
    spokenText = 'Five fingers';
  }

  try {
    // Cancel any previous speech so new gesture speaks immediately with zero delay
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(spokenText);
    utterance.rate = 1.08; // slightly brisk for instantaneous feedback
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Pick best natural English voice available in browser
    const voices = window.speechSynthesis.getVoices();
    if (voices && voices.length > 0) {
      const preferredVoice =
        voices.find(
          (v) =>
            v.lang.startsWith('en') &&
            (v.name.includes('Natural') ||
              v.name.includes('Google') ||
              v.name.includes('Samantha') ||
              v.name.includes('Daniel') ||
              v.name.includes('Alex'))
        ) || voices.find((v) => v.lang.startsWith('en'));

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
    }

    lastSpokenGesture = gestureName;
    lastSpokenTime = now;
    window.speechSynthesis.speak(utterance);
  } catch (e) {
    console.warn('Speech synthesis error:', e);
  }
}

/**
 * Resets spoken gesture tracker when no hand is in camera frame
 */
export function resetSpokenGesture() {
  lastSpokenGesture = '';
}
