/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  FingerState,
  GestureType,
  HandDetectionResult,
  Landmark3D,
} from '../types/gestures';

// MediaPipe Hand Landmark indices
export const LANDMARK = {
  WRIST: 0,
  THUMB_CMC: 1,
  THUMB_MCP: 2,
  THUMB_IP: 3,
  THUMB_TIP: 4,
  INDEX_MCP: 5,
  INDEX_PIP: 6,
  INDEX_DIP: 7,
  INDEX_TIP: 8,
  MIDDLE_MCP: 9,
  MIDDLE_PIP: 10,
  MIDDLE_DIP: 11,
  MIDDLE_TIP: 12,
  RING_MCP: 13,
  RING_PIP: 14,
  RING_DIP: 15,
  RING_TIP: 16,
  PINKY_MCP: 17,
  PINKY_PIP: 18,
  PINKY_DIP: 19,
  PINKY_TIP: 20,
};

export const HAND_CONNECTIONS: [number, number][] = [
  // Thumb
  [0, 1], [1, 2], [2, 3], [3, 4],
  // Index
  [0, 5], [5, 6], [6, 7], [7, 8],
  // Middle
  [0, 9], [9, 10], [10, 11], [11, 12],
  // Ring
  [0, 13], [13, 14], [14, 15], [15, 16],
  // Pinky
  [0, 17], [17, 18], [18, 19], [19, 20],
  // Palm base cross connections
  [5, 9], [9, 13], [13, 17],
];

/**
 * 3D Euclidean distance between two landmarks
 */
export function distance3D(a: Landmark3D, b: Landmark3D): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = (a.z - b.z) * 1.1; // slight weight to depth
  return Math.hypot(dx, dy, dz);
}

/**
 * 2D Euclidean distance (screen-space)
 */
export function distance2D(a: Landmark3D, b: Landmark3D): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/**
 * Vector subtraction: a - b
 */
function vectorSub(a: Landmark3D, b: Landmark3D): Landmark3D {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

/**
 * Vector magnitude
 */
function vectorMag(v: Landmark3D): number {
  return Math.hypot(v.x, v.y, v.z) || 0.0001;
}

/**
 * Normalized dot product / cosine similarity
 */
function cosineAngle(v1: Landmark3D, v2: Landmark3D): number {
  const dot = v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
  const mag = vectorMag(v1) * vectorMag(v2);
  return Math.max(-1, Math.min(1, dot / mag));
}

/**
 * Compute palm normal vector via cross product of palm vectors
 */
export function computePalmNormal(
  wrist: Landmark3D,
  indexMcp: Landmark3D,
  pinkyMcp: Landmark3D,
  isRightHand: boolean
): { x: number; y: number; z: number } {
  const v1 = vectorSub(indexMcp, wrist);
  const v2 = vectorSub(pinkyMcp, wrist);

  // Cross product v1 x v2
  let nx = v1.y * v2.z - v1.z * v2.y;
  let ny = v1.z * v2.x - v1.x * v2.z;
  let nz = v1.x * v2.y - v1.y * v2.x;

  if (!isRightHand) {
    nx = -nx;
    ny = -ny;
    nz = -nz;
  }

  const mag = Math.hypot(nx, ny, nz) || 1;
  return { x: nx / mag, y: ny / mag, z: nz / mag };
}

/**
 * Evaluates individual finger states (Extended vs Folded)
 */
export function evaluateFingerStates(
  landmarks: Landmark3D[],
  handScale: number
): FingerState[] {
  const wrist = landmarks[LANDMARK.WRIST];
  const pinkyMcp = landmarks[LANDMARK.PINKY_MCP];
  const indexMcp = landmarks[LANDMARK.INDEX_MCP];

  // 1. THUMB
  const thumbCmc = landmarks[LANDMARK.THUMB_CMC];
  const thumbMcp = landmarks[LANDMARK.THUMB_MCP];
  const thumbIp = landmarks[LANDMARK.THUMB_IP];
  const thumbTip = landmarks[LANDMARK.THUMB_TIP];

  const thumbTipToWrist = distance3D(thumbTip, wrist) / handScale;
  const thumbTipToPinky = distance3D(thumbTip, pinkyMcp) / handScale;
  const thumbTipToIndex = distance3D(thumbTip, indexMcp) / handScale;
  const thumbIpToPinky = distance3D(thumbIp, pinkyMcp) / handScale;

  // Thumb is folded if tucked across palm close to pinky base or index base
  const thumbTucked = thumbTipToPinky < 0.72 || thumbTipToIndex < 0.42;
  const thumbExtendedDist = thumbTipToPinky > 0.85 && thumbTipToWrist > 0.78;
  const thumbCurlScore = thumbTucked
    ? 0.9
    : thumbExtendedDist
    ? 0.1
    : Math.max(0, Math.min(1, 1 - (thumbTipToPinky - 0.65) / 0.3));

  const thumbState: FingerState = {
    name: 'Thumb',
    isExtended: !thumbTucked && thumbExtendedDist,
    curlScore: thumbCurlScore,
    tipDistanceToWrist: thumbTipToWrist,
  };

  // 2. INDEX, MIDDLE, RING, PINKY
  const fingerConfigs = [
    { name: 'Index' as const, mcp: LANDMARK.INDEX_MCP, pip: LANDMARK.INDEX_PIP, dip: LANDMARK.INDEX_DIP, tip: LANDMARK.INDEX_TIP },
    { name: 'Middle' as const, mcp: LANDMARK.MIDDLE_MCP, pip: LANDMARK.MIDDLE_PIP, dip: LANDMARK.MIDDLE_DIP, tip: LANDMARK.MIDDLE_TIP },
    { name: 'Ring' as const, mcp: LANDMARK.RING_MCP, pip: LANDMARK.RING_PIP, dip: LANDMARK.RING_DIP, tip: LANDMARK.RING_TIP },
    { name: 'Pinky' as const, mcp: LANDMARK.PINKY_MCP, pip: LANDMARK.PINKY_PIP, dip: LANDMARK.PINKY_DIP, tip: LANDMARK.PINKY_TIP },
  ];

  const remainingFingers: FingerState[] = fingerConfigs.map((cfg) => {
    const mcp = landmarks[cfg.mcp];
    const pip = landmarks[cfg.pip];
    const tip = landmarks[cfg.tip];

    const dTipWrist = distance3D(tip, wrist) / handScale;
    const dPipWrist = distance3D(pip, wrist) / handScale;
    const dTipMcp = distance3D(tip, mcp) / handScale;
    const dPipMcp = distance3D(pip, mcp) / handScale;

    // Vectors for straightness
    const vMcpPip = vectorSub(pip, mcp);
    const vPipTip = vectorSub(tip, pip);
    const alignment = cosineAngle(vMcpPip, vPipTip); // > 0.5 when straight

    // Tip distance to wrist compared to PIP distance to wrist
    const extensionRatio = dTipWrist / (dPipWrist || 0.001);

    // Finger is considered extended if:
    // 1) tip is substantially farther from wrist than PIP
    // 2) tip-to-MCP distance exceeds PIP-to-MCP distance
    // 3) segment alignment is not folded backward
    const isExtended = extensionRatio > 1.15 && dTipMcp > dPipMcp * 1.18 && alignment > 0.25;

    // Continuous curl score (0 = fully straight, 1 = curled)
    const curlScore = Math.max(0, Math.min(1, (1.35 - extensionRatio) / 0.5));

    return {
      name: cfg.name,
      isExtended,
      curlScore,
      tipDistanceToWrist: dTipWrist,
    };
  });

  return [thumbState, ...remainingFingers];
}

/**
 * Main Classifier: evaluates hand landmarks and identifies which of the 10 gestures matches
 */
export function classifyHandGesture(
  landmarks: Landmark3D[],
  handedness: 'Left' | 'Right',
  handednessScore: number,
  handIndex: number = 0
): HandDetectionResult {
  const wrist = landmarks[LANDMARK.WRIST];
  const middleMcp = landmarks[LANDMARK.MIDDLE_MCP];
  const indexMcp = landmarks[LANDMARK.INDEX_MCP];
  const pinkyMcp = landmarks[LANDMARK.PINKY_MCP];

  // Scale normalization: wrist to middle MCP is anatomically stable
  const handScale = distance3D(wrist, middleMcp) || 0.15;

  // Finger states
  const fingerStates = evaluateFingerStates(landmarks, handScale);
  const [thumb, index, middle, ring, pinky] = fingerStates;

  // Count extended fingers
  const extendedCount = fingerStates.filter((f) => f.isExtended).length;
  const fourFingersExtended = index.isExtended && middle.isExtended && ring.isExtended && pinky.isExtended;
  const fourFingersCurled = !index.isExtended && !middle.isExtended && !ring.isExtended && !pinky.isExtended;

  // Palm normal
  const isRightHand = handedness === 'Right';
  const palmNormal = computePalmNormal(wrist, indexMcp, pinkyMcp, isRightHand);

  // Bounding box for overlay
  let minX = 1, minY = 1, maxX = 0, maxY = 0;
  for (const pt of landmarks) {
    if (pt.x < minX) minX = pt.x;
    if (pt.x > maxX) maxX = pt.x;
    if (pt.y < minY) minY = pt.y;
    if (pt.y > maxY) maxY = pt.y;
  }

  // Thumb verticality & orientation
  const thumbTip = landmarks[LANDMARK.THUMB_TIP];
  const thumbIp = landmarks[LANDMARK.THUMB_IP];
  const thumbMcp = landmarks[LANDMARK.THUMB_MCP];

  // In webcam image coordinates: y = 0 at TOP, y = 1 at BOTTOM
  // Upward: tip.y < ip.y (tip is higher on screen)
  // Downward: tip.y > ip.y (tip is lower on screen)
  const thumbDy = thumbTip.y - thumbIp.y;
  const thumbDyWrist = thumbTip.y - wrist.y;
  const isThumbPointingUp = thumbDy < -0.025 && thumbDyWrist < -0.05;
  const isThumbPointingDown = thumbDy > 0.025 && thumbDyWrist > 0.05;

  // Separation between Index tip & Middle tip for Peace Sign distinction
  const indexTip = landmarks[LANDMARK.INDEX_TIP];
  const middleTip = landmarks[LANDMARK.MIDDLE_TIP];
  const indexMiddleSpread = distance3D(indexTip, middleTip) / handScale;

  let gesture: GestureType = 'Unknown';
  let confidence = 0.5;
  const criteriaMet: string[] = [];
  let limitationNote: string | undefined;

  // -------------------------------------------------------------
  // GESTURE 1 & 2: THUMBS UP / THUMBS DOWN
  // Condition: All 4 long fingers tightly curled, thumb distinctly pointing up/down
  // -------------------------------------------------------------
  if (fourFingersCurled) {
    if (isThumbPointingUp) {
      gesture = 'Thumbs Up';
      confidence = Math.min(0.98, 0.75 + Math.abs(thumbDy) * 2.5);
      criteriaMet.push('All 4 main fingers curled into fist');
      criteriaMet.push('Thumb tip Y is higher than thumb IP & wrist');
      criteriaMet.push(`Thumb ascent margin: ${(-thumbDy).toFixed(3)}`);
    } else if (isThumbPointingDown) {
      gesture = 'Thumbs Down';
      confidence = Math.min(0.98, 0.75 + Math.abs(thumbDy) * 2.5);
      criteriaMet.push('All 4 main fingers curled into fist');
      criteriaMet.push('Thumb tip Y is lower than thumb IP & wrist');
      criteriaMet.push(`Thumb descent margin: ${(thumbDy).toFixed(3)}`);
    } else if (!thumb.isExtended) {
      // -------------------------------------------------------------
      // GESTURE: CLOSED FIST
      // All 5 digits curled/folded
      // -------------------------------------------------------------
      gesture = 'Closed Fist';
      confidence = Math.min(0.97, 0.82 + (thumb.curlScore * 0.15));
      criteriaMet.push('All 4 main fingers curled (Index, Middle, Ring, Pinky)');
      criteriaMet.push('Thumb folded across palm or index base');
      criteriaMet.push(`Average finger curl score: ${(fingerStates.reduce((acc, f) => acc + f.curlScore, 0) / 5).toFixed(2)}`);
    }
  }

  // -------------------------------------------------------------
  // GESTURE: PEACE SIGN vs TWO FINGERS
  // Index & Middle extended, Ring & Pinky curled
  // -------------------------------------------------------------
  if (gesture === 'Unknown' && index.isExtended && middle.isExtended && !ring.isExtended && !pinky.isExtended) {
    // V-shape spread check
    if (indexMiddleSpread >= 0.32) {
      gesture = 'Peace Sign';
      confidence = Math.min(0.98, 0.78 + (indexMiddleSpread - 0.32) * 0.4);
      criteriaMet.push('Index and Middle fingers extended');
      criteriaMet.push('Ring, Pinky, and Thumb folded/curled');
      criteriaMet.push(`V-formation tip spread: ${indexMiddleSpread.toFixed(2)} (>= 0.32)`);
    } else {
      gesture = 'Two Fingers';
      confidence = 0.88;
      criteriaMet.push('Index and Middle fingers extended');
      criteriaMet.push('Ring, Pinky, and Thumb folded/curled');
      criteriaMet.push(`Fingers held close together: ${indexMiddleSpread.toFixed(2)} (< 0.32)`);
      limitationNote = 'Fingers are close together (<14° V-spread). Spread fingers further to register as Peace Sign.';
    }
  }

  // -------------------------------------------------------------
  // GESTURE: ONE FINGER
  // Only Index finger extended, remaining 4 folded
  // -------------------------------------------------------------
  if (gesture === 'Unknown' && index.isExtended && !middle.isExtended && !ring.isExtended && !pinky.isExtended) {
    gesture = 'One Finger';
    confidence = Math.min(0.98, 0.8 + (1 - middle.curlScore * 0.2));
    criteriaMet.push('Index finger fully extended');
    criteriaMet.push('Middle, Ring, Pinky, and Thumb folded');
    criteriaMet.push(`Index tip-to-wrist ratio: ${index.tipDistanceToWrist.toFixed(2)}`);
  }

  // -------------------------------------------------------------
  // GESTURE: THREE FINGERS
  // Index, Middle, Ring extended, Pinky folded, Thumb folded
  // (Or alternatively Thumb, Index, Middle extended)
  // -------------------------------------------------------------
  if (gesture === 'Unknown') {
    if (index.isExtended && middle.isExtended && ring.isExtended && !pinky.isExtended) {
      gesture = 'Three Fingers';
      confidence = 0.91;
      criteriaMet.push('Index, Middle, and Ring fingers extended');
      criteriaMet.push('Pinky curled into palm');
      criteriaMet.push(`Extended digit count: 3`);
    } else if (thumb.isExtended && index.isExtended && middle.isExtended && !ring.isExtended && !pinky.isExtended) {
      gesture = 'Three Fingers';
      confidence = 0.87;
      criteriaMet.push('Thumb, Index, and Middle fingers extended (Continental 3)');
      criteriaMet.push('Ring and Pinky curled into palm');
      criteriaMet.push(`Extended digit count: 3`);
      limitationNote = 'Recognized as 3 digits via Thumb + Index + Middle variation.';
    }
  }

  // -------------------------------------------------------------
  // GESTURE: FOUR FINGERS
  // Index, Middle, Ring, Pinky extended, Thumb folded into palm
  // -------------------------------------------------------------
  if (gesture === 'Unknown' && fourFingersExtended && !thumb.isExtended) {
    gesture = 'Four Fingers';
    confidence = 0.93;
    criteriaMet.push('Index, Middle, Ring, and Pinky extended');
    criteriaMet.push('Thumb folded across palm');
    criteriaMet.push(`Extended digit count: 4`);
  }

  // -------------------------------------------------------------
  // GESTURE: FIVE FINGERS / OPEN PALM
  // All 5 digits extended
  // -------------------------------------------------------------
  if (gesture === 'Unknown' && fourFingersExtended && thumb.isExtended) {
    // Check if palm is facing camera (Open Palm) vs tilted (Five Fingers)
    const isFacingCamera = palmNormal.z < -0.2 || Math.abs(palmNormal.z) > 0.4;

    if (isFacingCamera) {
      gesture = 'Open Palm';
      confidence = Math.min(0.99, 0.88 + extendedCount * 0.02);
      criteriaMet.push('All 5 digits extended (Thumb, Index, Middle, Ring, Pinky)');
      criteriaMet.push('Palm plane oriented towards the camera lens');
      criteriaMet.push(`Hand surface normal Z: ${palmNormal.z.toFixed(2)}`);
    } else {
      gesture = 'Five Fingers';
      confidence = 0.92;
      criteriaMet.push('All 5 digits extended (Thumb, Index, Middle, Ring, Pinky)');
      criteriaMet.push('Hand angled away from pure frontal alignment');
      limitationNote = 'Palm normal is slightly angled. Face palm directly toward camera for Open Palm classification.';
    }
  }

  // Fallback by extended count if near boundary:
  if (gesture === 'Unknown') {
    if (extendedCount === 0) {
      gesture = 'Closed Fist';
      confidence = 0.72;
      criteriaMet.push('0 digits detected as extended (approximate fist)');
    } else if (extendedCount === 1) {
      gesture = 'One Finger';
      confidence = 0.71;
      criteriaMet.push('1 digit detected as extended');
      limitationNote = 'Finger geometry was borderline; classified by extended digit count.';
    } else if (extendedCount === 2) {
      gesture = 'Two Fingers';
      confidence = 0.72;
      criteriaMet.push('2 digits detected as extended');
    } else if (extendedCount === 3) {
      gesture = 'Three Fingers';
      confidence = 0.74;
      criteriaMet.push('3 digits detected as extended');
    } else if (extendedCount === 4) {
      gesture = 'Four Fingers';
      confidence = 0.76;
      criteriaMet.push('4 digits detected as extended');
    } else if (extendedCount === 5) {
      gesture = 'Five Fingers';
      confidence = 0.82;
      criteriaMet.push('5 digits detected as extended');
    } else {
      gesture = 'Unknown';
      confidence = 0.3;
      criteriaMet.push('Unrecognized geometric configuration');
      limitationNote = 'Hand position does not match the 10 target gesture profiles. Keep hand steady in camera view.';
    }
  }

  return {
    handIndex,
    handedness,
    handednessScore,
    landmarks,
    gesture,
    confidence: Math.round(confidence * 100) / 100,
    fingerStates,
    extendedCount,
    criteriaMet,
    limitationNote,
    palmNormal,
    boundingBox: {
      minX: Math.max(0, minX - 0.04),
      minY: Math.max(0, minY - 0.04),
      maxX: Math.min(1, maxX + 0.04),
      maxY: Math.min(1, maxY + 0.04),
    },
  };
}
