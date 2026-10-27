/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';

let handLandmarkerInstance: HandLandmarker | null = null;
let isLoading = false;
let initPromise: Promise<HandLandmarker> | null = null;

const LOCAL_WASM_PATH = '/wasm';
const CDN_WASM_PATH = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm';

const LOCAL_MODEL_PATH = '/models/hand_landmarker.task';
const CDN_MODEL_PATH =
  'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';

export async function initializeHandLandmarker(
  onProgress?: (message: string) => void
): Promise<HandLandmarker> {
  if (handLandmarkerInstance) {
    return handLandmarkerInstance;
  }

  if (initPromise) {
    return initPromise;
  }

  isLoading = true;
  initPromise = (async () => {
    try {
      onProgress?.('Loading vision WebAssembly runtime...');

      // Try local wasm first, fallback to CDN
      let vision;
      try {
        vision = await FilesetResolver.forVisionTasks(LOCAL_WASM_PATH);
      } catch (localWasmErr) {
        console.warn('Local WASM load failed, falling back to CDN:', localWasmErr);
        onProgress?.('Connecting to vision runtime CDN...');
        vision = await FilesetResolver.forVisionTasks(CDN_WASM_PATH);
      }

      onProgress?.('Loading hand landmarker neural network model...');

      // Try GPU delegate first, fallback to CPU
      try {
        handLandmarkerInstance = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: LOCAL_MODEL_PATH,
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numHands: 2,
          minHandDetectionConfidence: 0.5,
          minHandPresenceConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });
      } catch (gpuLocalErr) {
        console.warn('Local GPU model initialization failed, trying CDN / CPU fallback:', gpuLocalErr);

        try {
          // Try local CPU
          handLandmarkerInstance = await HandLandmarker.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath: LOCAL_MODEL_PATH,
              delegate: 'CPU',
            },
            runningMode: 'VIDEO',
            numHands: 2,
            minHandDetectionConfidence: 0.5,
            minHandPresenceConfidence: 0.5,
            minTrackingConfidence: 0.5,
          });
        } catch (cpuLocalErr) {
          console.warn('Local CPU model initialization failed, trying CDN asset path:', cpuLocalErr);

          // Fallback to CDN model with CPU/GPU
          handLandmarkerInstance = await HandLandmarker.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath: CDN_MODEL_PATH,
              delegate: 'CPU',
            },
            runningMode: 'VIDEO',
            numHands: 2,
            minHandDetectionConfidence: 0.5,
            minHandPresenceConfidence: 0.5,
            minTrackingConfidence: 0.5,
          });
        }
      }

      onProgress?.('Hand tracking engine ready.');
      return handLandmarkerInstance;
    } catch (err: unknown) {
      console.error('Fatal HandLandmarker initialization error:', err);
      const errMsg = err instanceof Error ? err.message : String(err);
      throw new Error(`Failed to initialize MediaPipe Hand Landmarker: ${errMsg}`);
    } finally {
      isLoading = false;
      initPromise = null;
    }
  })();

  return initPromise;
}

export function disposeHandLandmarker() {
  if (handLandmarkerInstance) {
    try {
      handLandmarkerInstance.close();
    } catch (e) {
      console.warn('Error closing hand landmarker:', e);
    }
    handLandmarkerInstance = null;
    initPromise = null;
    isLoading = false;
  }
}

export function isHandLandmarkerLoading(): boolean {
  return isLoading;
}
