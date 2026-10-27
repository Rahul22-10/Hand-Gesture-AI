/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Landmark3D {
  x: number;
  y: number;
  z: number;
}

export type GestureType =
  | 'Open Palm'
  | 'Closed Fist'
  | 'Thumbs Up'
  | 'Thumbs Down'
  | 'Peace Sign'
  | 'One Finger'
  | 'Two Fingers'
  | 'Three Fingers'
  | 'Four Fingers'
  | 'Five Fingers'
  | 'Unknown';

export interface FingerState {
  name: 'Thumb' | 'Index' | 'Middle' | 'Ring' | 'Pinky';
  isExtended: boolean;
  curlScore: number; // 0 = straight, 1 = fully curled
  tipDistanceToWrist: number;
}

export interface HandDetectionResult {
  handIndex: number;
  handedness: 'Left' | 'Right';
  handednessScore: number;
  landmarks: Landmark3D[];
  worldLandmarks?: Landmark3D[];
  gesture: GestureType;
  confidence: number;
  fingerStates: FingerState[];
  extendedCount: number;
  criteriaMet: string[];
  limitationNote?: string;
  palmNormal: { x: number; y: number; z: number };
  boundingBox: {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
  };
}

export interface GestureHistoryItem {
  id: string;
  timestamp: string;
  timeMs: number;
  gesture: GestureType;
  handedness: 'Left' | 'Right';
  confidence: number;
  extendedFingers: string;
}

export interface GestureDefinition {
  id: GestureType;
  name: string;
  icon: string;
  badge: string;
  summary: string;
  fingerConfig: {
    thumb: 'Extended' | 'Folded' | 'Upward' | 'Downward' | 'Any';
    index: 'Extended' | 'Folded' | 'Any';
    middle: 'Extended' | 'Folded' | 'Any';
    ring: 'Extended' | 'Folded' | 'Any';
    pinky: 'Extended' | 'Folded' | 'Any';
  };
  classificationLogic: string;
  naturalLimitations: string;
}
