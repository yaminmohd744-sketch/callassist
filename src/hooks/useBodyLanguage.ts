import { useEffect, useRef, useState } from 'react';
import type { AISuggestion } from '../types';
import { buildBodyCard, type BodySignalKey } from '../lib/bodyLanguageSignals';

interface UseBodyLanguageProps {
  isActive: boolean;
  elapsedSeconds: number;
  currentScript?: string;
  onSuggestion: (s: AISuggestion) => void;
}

const WASM_PATH = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm';
const FACE_MODEL = 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task';
const POSE_MODEL = 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task';

type NL = { x: number; y: number; z: number };

export function useBodyLanguage({ isActive, elapsedSeconds, currentScript, onSuggestion }: UseBodyLanguageProps) {
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const elapsedRef = useRef(elapsedSeconds);
  const currentScriptRef = useRef(currentScript);
  const onSuggestionRef = useRef(onSuggestion);
  useEffect(() => { elapsedRef.current = elapsedSeconds; }, [elapsedSeconds]);
  useEffect(() => { currentScriptRef.current = currentScript; }, [currentScript]);
  useEffect(() => { onSuggestionRef.current = onSuggestion; }, [onSuggestion]);

  const stateRef = useRef({
    noseYHistory: [] as number[],
    cooldowns: new Map<BodySignalKey, number>(),
    poseFrame: 0,
  });

  useEffect(() => {
    if (!isActive) {
      setCameraReady(false);
      return;
    }

    let cancelled = false;
    let animFrame: number | null = null;
    let stream: MediaStream | null = null;
    let video: HTMLVideoElement | null = null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let faceLandmarker: any = null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let poseLandmarker: any = null;

    const st = stateRef.current;
    st.noseYHistory = [];
    st.cooldowns.clear();
    st.poseFrame = 0;

    function canFire(key: BodySignalKey, cooldownSec: number): boolean {
      const last = st.cooldowns.get(key) ?? -cooldownSec;
      return elapsedRef.current - last >= cooldownSec;
    }

    function fire(key: BodySignalKey) {
      st.cooldowns.set(key, elapsedRef.current);
      onSuggestionRef.current(buildBodyCard(key, elapsedRef.current, currentScriptRef.current));
    }

    function detect(face: NL[] | null, pose: NL[] | null) {
      if (face && face.length > 454) {
        const nose = face[1];
        const lCheek = face[234];
        const rCheek = face[454];
        const forehead = face[10];
        const chin = face[152];

        // Yaw — eye contact
        const faceW = Math.max(rCheek.x - lCheek.x, 0.01);
        const yaw = (nose.x - (lCheek.x + rCheek.x) / 2) / faceW;
        if (Math.abs(yaw) > 0.15 && canFire('eye-contact-lost', 20)) {
          fire('eye-contact-lost');
        }

        // Pitch ratio — chin down
        const upper = nose.y - forehead.y;
        const lower = chin.y - nose.y;
        if (upper > 0.01 && lower / upper < 0.7 && canFire('chin-down', 60)) {
          fire('chin-down');
        }

        // Nodding — oscillation in nose Y
        st.noseYHistory.push(nose.y);
        if (st.noseYHistory.length > 90) st.noseYHistory.shift();
        if (st.noseYHistory.length >= 90) {
          let crossings = 0;
          for (let i = 1; i < st.noseYHistory.length - 1; i++) {
            const d1 = st.noseYHistory[i] - st.noseYHistory[i - 1];
            const d2 = st.noseYHistory[i + 1] - st.noseYHistory[i];
            if (d1 * d2 < 0 && Math.abs(d1) > 0.002) crossings++;
          }
          if (crossings < 2 && canFire('not-nodding', 30)) {
            fire('not-nodding');
          }
        }
      }

      // Lean — pose Z depth
      if (pose && pose.length > 24) {
        st.poseFrame++;
        if (st.poseFrame % 5 === 0) {
          const noseZ = pose[0].z;
          const shoulderZ = (pose[11].z + pose[12].z) / 2;
          if (noseZ > shoulderZ + 0.08 && canFire('leaning-back', 45)) {
            fire('leaning-back');
          }
        }
      }
    }

    async function init() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }

        video = document.createElement('video');
        video.srcObject = stream;
        video.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;pointer-events:none;';
        document.body.appendChild(video);
        await video.play();
        if (cancelled) return;

        const mp = await import('@mediapipe/tasks-vision');
        if (cancelled) return;

        const vision = await mp.FilesetResolver.forVisionTasks(WASM_PATH);
        if (cancelled) return;

        [faceLandmarker, poseLandmarker] = await Promise.all([
          mp.FaceLandmarker.createFromOptions(vision, {
            baseOptions: { modelAssetPath: FACE_MODEL, delegate: 'GPU' },
            runningMode: 'VIDEO',
            numFaces: 1,
          }),
          mp.PoseLandmarker.createFromOptions(vision, {
            baseOptions: { modelAssetPath: POSE_MODEL, delegate: 'GPU' },
            runningMode: 'VIDEO',
            numPoses: 1,
          }),
        ]);
        if (cancelled) return;

        setCameraReady(true);

        let lastMs = -1;
        function loop() {
          if (cancelled || !video) return;
          const nowMs = performance.now();
          if (nowMs !== lastMs && video.readyState >= 2) {
            lastMs = nowMs;
            try {
              const fr = faceLandmarker?.detectForVideo(video, nowMs);
              const pr = poseLandmarker?.detectForVideo(video, nowMs);
              detect(fr?.faceLandmarks?.[0] ?? null, pr?.landmarks?.[0] ?? null);
            } catch { /* silent — frame errors are non-fatal */ }
          }
          animFrame = requestAnimationFrame(loop);
        }
        animFrame = requestAnimationFrame(loop);
      } catch (err) {
        if (!cancelled) {
          setCameraError(err instanceof Error ? err.message : 'Camera unavailable');
        }
      }
    }

    init();

    return () => {
      cancelled = true;
      if (animFrame !== null) cancelAnimationFrame(animFrame);
      stream?.getTracks().forEach(t => t.stop());
      video?.remove();
      try { faceLandmarker?.close(); } catch { /* ignore */ }
      try { poseLandmarker?.close(); } catch { /* ignore */ }
      setCameraReady(false);
    };
  }, [isActive]);

  return { cameraReady, cameraError };
}
