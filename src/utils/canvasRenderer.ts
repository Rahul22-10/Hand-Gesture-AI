/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { HandDetectionResult, Landmark3D } from '../types/gestures';
import { HAND_CONNECTIONS, LANDMARK } from './gestureClassifier';

export interface RenderOptions {
  showLandmarks?: boolean;
  showSkeleton?: boolean;
  showBoundingBox?: boolean;
  showHandedness?: boolean;
  isMirrored?: boolean;
}

const FINGER_COLORS = {
  THUMB: '#f59e0b',  // amber
  INDEX: '#06b6d4',  // cyan
  MIDDLE: '#3b82f6', // blue
  RING: '#8b5cf6',   // violet
  PINKY: '#ec4899',  // pink
  PALM: '#10b981',   // emerald
};

function getJointColor(index: number): string {
  if (index <= LANDMARK.THUMB_TIP) return FINGER_COLORS.THUMB;
  if (index <= LANDMARK.INDEX_TIP) return FINGER_COLORS.INDEX;
  if (index <= LANDMARK.MIDDLE_TIP) return FINGER_COLORS.MIDDLE;
  if (index <= LANDMARK.RING_TIP) return FINGER_COLORS.RING;
  return FINGER_COLORS.PINKY;
}

export function drawHandOverlay(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  detections: HandDetectionResult[],
  options: RenderOptions = {}
) {
  const {
    showLandmarks = true,
    showSkeleton = true,
    showBoundingBox = true,
    showHandedness = true,
    isMirrored = true,
  } = options;

  ctx.clearRect(0, 0, width, height);

  ctx.save();
  if (isMirrored) {
    // Invert horizontally so overlay matches mirrored video
    ctx.translate(width, 0);
    ctx.scale(-1, 1);
  }

  detections.forEach((detection) => {
    const { landmarks, handedness, gesture, confidence, boundingBox, fingerStates } = detection;
    const isRight = handedness === 'Right';
    const primaryTheme = isRight ? '#06b6d4' : '#a855f7'; // Cyan for Right, Purple for Left

    // 1. Draw Skeleton Connections
    if (showSkeleton) {
      HAND_CONNECTIONS.forEach(([startIdx, endIdx]) => {
        const p1 = landmarks[startIdx];
        const p2 = landmarks[endIdx];

        if (!p1 || !p2) return;

        const x1 = p1.x * width;
        const y1 = p1.y * height;
        const x2 = p2.x * width;
        const y2 = p2.y * height;

        // Subtle outer glow
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.lineWidth = 4;
        ctx.strokeStyle = primaryTheme + '44';
        ctx.lineCap = 'round';
        ctx.stroke();

        // Core laser line
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.lineWidth = 2;
        ctx.strokeStyle = primaryTheme + 'cc';
        ctx.lineCap = 'round';
        ctx.stroke();
      });
    }

    // 2. Draw Landmark Joints
    if (showLandmarks) {
      landmarks.forEach((pt: Landmark3D, idx: number) => {
        const x = pt.x * width;
        const y = pt.y * height;
        const isTip = [
          LANDMARK.THUMB_TIP,
          LANDMARK.INDEX_TIP,
          LANDMARK.MIDDLE_TIP,
          LANDMARK.RING_TIP,
          LANDMARK.PINKY_TIP,
        ].includes(idx);

        const color = getJointColor(idx);

        if (isTip) {
          // Highlighted fingertip node
          const fingerMap = [
            LANDMARK.THUMB_TIP,
            LANDMARK.INDEX_TIP,
            LANDMARK.MIDDLE_TIP,
            LANDMARK.RING_TIP,
            LANDMARK.PINKY_TIP,
          ];
          const fIndex = fingerMap.indexOf(idx);
          const isExtended = fingerStates[fIndex]?.isExtended ?? false;

          // Outer halo
          ctx.beginPath();
          ctx.arc(x, y, 7, 0, Math.PI * 2);
          ctx.fillStyle = isExtended ? '#10b98133' : '#f59e0b33';
          ctx.fill();

          // Inner solid
          ctx.beginPath();
          ctx.arc(x, y, 4.5, 0, Math.PI * 2);
          ctx.fillStyle = isExtended ? '#34d399' : '#fbbf24';
          ctx.fill();
          ctx.lineWidth = 1.5;
          ctx.strokeStyle = '#090d16';
          ctx.stroke();
        } else {
          // Standard knuckle joint
          ctx.beginPath();
          ctx.arc(x, y, idx === 0 ? 5 : 3, 0, Math.PI * 2);
          ctx.fillStyle = idx === 0 ? '#ffffff' : color;
          ctx.fill();
          ctx.lineWidth = 1;
          ctx.strokeStyle = '#090d16';
          ctx.stroke();
        }
      });
    }

    // 3. Draw Bounding Box & HUD
    if (showBoundingBox) {
      const bx = boundingBox.minX * width;
      const by = boundingBox.minY * height;
      const bw = (boundingBox.maxX - boundingBox.minX) * width;
      const bh = (boundingBox.maxY - boundingBox.minY) * height;

      // Subtle rounded rect
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = primaryTheme + '66';
      ctx.setLineDash([6, 6]);
      ctx.strokeRect(bx, by, bw, bh);
      ctx.setLineDash([]);

      // Top corner brackets
      const corner = Math.min(16, bw * 0.2, bh * 0.2);
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = primaryTheme;

      // Top-left corner
      ctx.beginPath();
      ctx.moveTo(bx, by + corner);
      ctx.lineTo(bx, by);
      ctx.lineTo(bx + corner, by);
      ctx.stroke();

      // Top-right corner
      ctx.beginPath();
      ctx.moveTo(bx + bw - corner, by);
      ctx.lineTo(bx + bw, by);
      ctx.lineTo(bx + bw, by + corner);
      ctx.stroke();

      // Bottom-left corner
      ctx.beginPath();
      ctx.moveTo(bx, by + bh - corner);
      ctx.lineTo(bx, by + bh);
      ctx.lineTo(bx + corner, by + bh);
      ctx.stroke();

      // Bottom-right corner
      ctx.beginPath();
      ctx.moveTo(bx + bw - corner, by + bh);
      ctx.lineTo(bx + bw, by + bh);
      ctx.lineTo(bx + bw, by + bh - corner);
      ctx.stroke();
    }
  });

  ctx.restore();

  // Draw floating badges (drawn in normal orientation so text isn't reversed!)
  if (showHandedness) {
    detections.forEach((detection) => {
      const { handedness, gesture, confidence, boundingBox } = detection;
      const isRight = handedness === 'Right';
      const primaryColor = isRight ? '#06b6d4' : '#a855f7';

      // Calculate anchor on screen taking mirroring into account
      let screenX = boundingBox.minX * width;
      if (isMirrored) {
        screenX = (1 - boundingBox.maxX) * width;
      }
      const screenY = Math.max(24, boundingBox.minY * height - 12);
      const boxWidth = (boundingBox.maxX - boundingBox.minX) * width;

      const label = `${handedness.toUpperCase()} · ${gesture} (${Math.round(confidence * 100)}%)`;
      ctx.font = '600 12px "JetBrains Mono", monospace';
      const metrics = ctx.measureText(label);
      const textWidth = metrics.width;
      const padX = 10;
      const padY = 5;
      const pillW = textWidth + padX * 2;
      const pillH = 22;
      const pillX = Math.max(8, Math.min(width - pillW - 8, screenX + (boxWidth - pillW) / 2));
      const pillY = Math.max(8, screenY - pillH);

      // Pill backdrop
      ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
      ctx.beginPath();
      ctx.roundRect(pillX, pillY, pillW, pillH, 6);
      ctx.fill();

      // Border
      ctx.lineWidth = 1;
      ctx.strokeStyle = primaryColor;
      ctx.stroke();

      // Label text
      ctx.fillStyle = '#f8fafc';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, pillX + padX, pillY + pillH / 2);
    });
  }
}
