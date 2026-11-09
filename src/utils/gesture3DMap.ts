/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GestureType, FingerState } from '../types/gestures';

export interface Gesture3DItem {
  id: string;
  name: string;
  label: string;
  image: string;
  gestureMatch: GestureType[];
  fingersCount?: number;
  description: string;
}

export const GESTURES_3D_CATALOG: Gesture3DItem[] = [
  {
    id: 'one-finger',
    name: 'One Finger',
    label: '1 Finger (Index)',
    image: '/gestures-3d/one-finger.png',
    gestureMatch: ['One Finger'],
    fingersCount: 1,
    description: 'Index finger pointing up',
  },
  {
    id: 'peace',
    name: 'Peace Sign',
    label: '2 Fingers / Peace',
    image: '/gestures-3d/peace.png',
    gestureMatch: ['Peace Sign', 'Two Fingers'],
    fingersCount: 2,
    description: 'V-sign with index and middle',
  },
  {
    id: 'three-fingers',
    name: 'Three Fingers',
    label: '3 Fingers',
    image: '/gestures-3d/three-fingers.png',
    gestureMatch: ['Three Fingers'],
    fingersCount: 3,
    description: 'Index, middle & ring extended',
  },
  {
    id: 'open-palms',
    name: 'Open Palm',
    label: 'Open Palm / 5 Digits',
    image: '/gestures-3d/open-palms.png',
    gestureMatch: ['Open Palm', 'Five Fingers', 'Four Fingers'],
    fingersCount: 5,
    description: 'All fingers open toward camera',
  },
  {
    id: 'fistbump',
    name: 'Closed Fist',
    label: 'Closed Fist',
    image: '/gestures-3d/fistbump.png',
    gestureMatch: ['Closed Fist'],
    fingersCount: 0,
    description: 'All fingers curled in tight',
  },
  {
    id: 'ok',
    name: 'OK / Thumbs',
    label: 'Thumbs Up / OK',
    image: '/gestures-3d/ok.png',
    gestureMatch: ['Thumbs Up'],
    description: 'Thumb or OK finger confirmation',
  },
  {
    id: 'pinky',
    name: 'Pinky Promise',
    label: 'Pinky Finger',
    image: '/gestures-3d/pinky.png',
    gestureMatch: ['Unknown'],
    description: 'Little finger extended',
  },
  {
    id: 'rock',
    name: 'Rock On / Horns',
    label: 'Rock / Horns',
    image: '/gestures-3d/rock.png',
    gestureMatch: ['Unknown'],
    description: 'Index and pinky up (horns)',
  },
  {
    id: 'crossed',
    name: 'Crossed Fingers',
    label: 'Crossed Fingers',
    image: '/gestures-3d/crossed.png',
    gestureMatch: ['Unknown'],
    description: 'Index and middle crossed for luck',
  },
  {
    id: 'namaste',
    name: 'Namaste',
    label: 'Folded Hands',
    image: '/gestures-3d/namaste.png',
    gestureMatch: ['Unknown'],
    description: 'Hands together in prayer / welcome',
  },
  {
    id: 'heart',
    name: 'Heart Hands',
    label: 'Heart Shape',
    image: '/gestures-3d/heart.png',
    gestureMatch: ['Unknown'],
    description: 'Hands joined to form heart',
  },
  {
    id: 'clap',
    name: 'Clapping',
    label: 'Applause / Clap',
    image: '/gestures-3d/clap.png',
    gestureMatch: ['Unknown'],
    description: 'Hands clapping together',
  },
];

/**
 * Returns the matching 3D gesture image for any detected gesture or finger state
 */
export function get3DGestureImage(gesture: GestureType, fingerStates?: FingerState[]): string {
  // Check special finger configurations if available
  if (fingerStates && fingerStates.length === 5) {
    const [thumb, index, middle, ring, pinky] = fingerStates;

    // Pinky only extended
    if (pinky.isExtended && !index.isExtended && !middle.isExtended && !ring.isExtended) {
      return '/gestures-3d/pinky.png';
    }

    // Rock / Horns: index and pinky extended, middle and ring curled
    if (index.isExtended && pinky.isExtended && !middle.isExtended && !ring.isExtended) {
      return '/gestures-3d/rock.png';
    }

    // 1 finger: index extended
    if (index.isExtended && !middle.isExtended && !ring.isExtended && !pinky.isExtended) {
      return '/gestures-3d/one-finger.png';
    }

    // 2 fingers: index and middle
    if (index.isExtended && middle.isExtended && !ring.isExtended && !pinky.isExtended) {
      return '/gestures-3d/peace.png';
    }

    // 3 fingers
    if (index.isExtended && middle.isExtended && ring.isExtended && !pinky.isExtended) {
      return '/gestures-3d/three-fingers.png';
    }
  }

  // Primary gesture lookup
  switch (gesture) {
    case 'One Finger':
      return '/gestures-3d/one-finger.png';
    case 'Peace Sign':
    case 'Two Fingers':
      return '/gestures-3d/peace.png';
    case 'Three Fingers':
      return '/gestures-3d/three-fingers.png';
    case 'Four Fingers':
    case 'Five Fingers':
    case 'Open Palm':
      return '/gestures-3d/open-palms.png';
    case 'Closed Fist':
      return '/gestures-3d/fistbump.png';
    case 'Thumbs Up':
    case 'Thumbs Down':
      return '/gestures-3d/ok.png';
    default:
      return '/gestures-3d/one-finger.png';
  }
}

