import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import type { Viewer } from "@photo-sphere-viewer/core";
import {
  FiCrosshair,
  FiMaximize,
  FiMinimize,
  FiMove,
  FiPause,
  FiPlay,
} from "react-icons/fi";

/**
 * Photo Sphere Viewer pulls in three.js (~600 kB). It is code-split and only
 * requested once the panorama is actually entered, so a project page that is
 * never scrolled to the bottom never pays for it.
 */
const PhotoSphere = lazy(() =>
  import("react-photo-sphere-viewer").then((mod) => ({
    default: mod.ReactPhotoSphereViewer,
  })),
);

export interface PanoramaLabels {
  enter: string;
  loading: string;
  drag: string;
  play: string;
  pause: string;
  reset: string;
  fullscreen: string;
  exitFullscreen: string;
}

export const DEFAULT_PANORAMA_LABELS: PanoramaLabels = {
  enter: "Enter the 360° view",
  loading: "Loading the panorama…",
  drag: "Drag to look around",
  play: "Resume the tour",
  pause: "Pause the tour",
  reset: "Recenter the view",
  fullscreen: "Fullscreen",
  exitFullscreen: "Exit fullscreen",
};

export interface PanoramaViewerProps {
  /** Full-resolution equirectangular image. */
  src: string;
  /** Lightweight still shown before the viewer is entered. */
  poster: string;
  /** Short line rendered over the panorama, e.g. the room name. */
  caption?: string;
  labels?: Partial<PanoramaLabels>;
  /** Tailwind aspect ratio for the inline (non-fullscreen) frame. */
  aspect?: string;
  /** Load the viewer as soon as the frame scrolls into view, skipping the tap. */
  autoLoad?: boolean;
  /** Slow orbit while nobody is touching it. Ignored under reduced motion. */
  autorotate?: boolean;
  className?: string;
}

/** Degrees per second — slow enough to read as ambient, not as a carousel. */
const ORBIT_SPEED = 0.045;
/** How long after the last touch before the ambient orbit picks back up. */
const ORBIT_RESUME_MS = 3200;

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function PanoramaViewer({
  src,
  poster,
  caption,
  labels: labelOverrides,
  aspect = "aspect-16/10",
  autoLoad = false,
  autorotate = true,
  className = "",
}: PanoramaViewerProps) {
  const labels = { ...DEFAULT_PANORAMA_LABELS, ...labelOverrides };

  const frameRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Viewer | null>(null);
  const rafRef = useRef(0);
  const idleUntilRef = useRef(0);

  const [active, setActive] = useState(false);
  const [ready, setReady] = useState(false);
  const [orbiting, setOrbiting] = useState(autorotate);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showHint, setShowHint] = useState(false);

  /* --- entering ---------------------------------------------------------- */

  const enter = useCallback(() => setActive(true), []);

  useEffect(() => {
    if (!autoLoad || active) return;
    const el = frameRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [autoLoad, active]);

  /* --- ambient orbit ----------------------------------------------------- */

  // The orbit is a plain rAF loop rather than a scripted animation so a drag can
  // interrupt it on any frame: the user's position always wins, and the orbit
  // simply resumes from wherever they left it.
  useEffect(() => {
    if (!ready || !orbiting || prefersReducedMotion()) return;

    let last = performance.now();

    const step = (now: number) => {
      const viewer = viewerRef.current;
      const delta = (now - last) / 1000;
      last = now;

      if (viewer && now >= idleUntilRef.current) {
        const { yaw, pitch } = viewer.getPosition();
        viewer.rotate({ yaw: yaw + ORBIT_SPEED * delta, pitch });
      }
      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [ready, orbiting]);

  // Any touch hands control straight back to the user; the orbit waits its turn.
  useEffect(() => {
    const el = frameRef.current;
    if (!el || !ready) return;

    const yieldToUser = () => {
      idleUntilRef.current = performance.now() + ORBIT_RESUME_MS;
      setShowHint(false);
    };

    el.addEventListener("pointerdown", yieldToUser, { passive: true });
    el.addEventListener("wheel", yieldToUser, { passive: true });
    return () => {
      el.removeEventListener("pointerdown", yieldToUser);
      el.removeEventListener("wheel", yieldToUser);
    };
  }, [ready]);

  /* --- fullscreen -------------------------------------------------------- */

  // Native fullscreen where it exists, a fixed overlay where it does not (iOS
  // Safari). Either way our own chrome stays on top of the panorama, which the
  // library's built-in fullscreen would hide.
  const toggleFullscreen = useCallback(() => {
    const el = frameRef.current;
    if (!el) return;

    if (document.fullscreenElement === el) {
      document.exitFullscreen?.();
      return;
    }
    if (typeof el.requestFullscreen === "function") {
      el.requestFullscreen().catch(() => setIsFullscreen((value) => !value));
      return;
    }
    setIsFullscreen((value) => !value);
  }, []);

  useEffect(() => {
    const onChange = () => setIsFullscreen(document.fullscreenElement === frameRef.current);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  // Inline, a bare wheel belongs to the page. Once the panorama owns the screen,
  // it owns the wheel too.
  useEffect(() => {
    viewerRef.current?.setOption("mousewheelCtrlKey", !isFullscreen);
  }, [isFullscreen]);

  const recenter = useCallback(() => {
    idleUntilRef.current = performance.now() + ORBIT_RESUME_MS;
    viewerRef.current?.animate({ yaw: 0, pitch: 0, zoom: 35, speed: "3rpm" });
  }, []);

  const onReady = useCallback((instance: Viewer) => {
    viewerRef.current = instance;
    setReady(true);
    if (!prefersReducedMotion()) setShowHint(true);
    window.setTimeout(() => setShowHint(false), 4200);
  }, []);

  const control =
    "inline-flex h-9 w-9 items-center justify-center rounded-full text-white/85 transition-[transform,background-color,color] duration-150 ease-out hover:bg-white/15 hover:text-white active:scale-90";

  return (
    <div
      ref={frameRef}
      className={`group/pano relative overflow-hidden rounded-3xl border border-line bg-baseBlack ${
        isFullscreen ? "fixed inset-0 z-100 rounded-none border-0" : aspect
      } ${className}`}
    >
      {/* Poster. Stays underneath and dissolves once the sphere is textured, so
          entering reads as the still resolving into depth rather than a swap. */}
      <div
        data-motion
        aria-hidden={ready ? "true" : undefined}
        style={{
          backgroundImage: `url(${poster})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        className={`absolute inset-0 transition-[opacity,filter,transform] duration-700 ease-out ${
          ready ? "scale-105 opacity-0 blur-md" : "scale-100 opacity-100 blur-0"
        }`}
      />

      {active && (
        <Suspense fallback={null}>
          <PhotoSphere
            src={src}
            height="100%"
            width="100%"
            containerClass="absolute inset-0 h-full w-full"
            navbar={false}
            loadingTxt={labels.loading}
            defaultZoomLvl={35}
            minFov={35}
            maxFov={95}
            moveInertia={0.85}
            mousewheelCtrlKey
            canvasBackground="#0a0d11"
            touchmoveTwoFingers={false}
            keyboard="fullscreen"
            onReady={onReady}
          />
        </Suspense>
      )}

      {/* Idle state: one clear way in, anchored to the frame it opens into. */}
      {!active && (
        <button
          type="button"
          onClick={enter}
          className="absolute inset-0 flex cursor-pointer flex-col items-center justify-center gap-4 bg-baseBlack/25 transition-colors duration-300 ease-out hover:bg-baseBlack/10"
        >
          <span
            data-motion
            className="btn-glass btn press inline-flex text-white shadow-e3"
          >
            <FiMove className="h-4 w-4" aria-hidden="true" />
            {labels.enter}
          </span>
        </button>
      )}

      {/* Loading: the poster is already on screen, so this is a whisper. */}
      {active && !ready && (
        <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center">
          <span className="glass-chip type-label rounded-full px-4 py-2 text-white/90">
            {labels.loading}
          </span>
        </div>
      )}

      {caption && (
        <p className="pointer-events-none absolute left-4 top-4 max-w-[60%] truncate rounded-full bg-baseBlack/45 px-3.5 py-1.5 text-xs font-medium text-white/90 backdrop-blur-sm">
          {caption}
        </p>
      )}

      <span className="pointer-events-none absolute right-4 top-4 rounded-full bg-baseBlack/45 px-3 py-1 text-[0.65rem] font-semibold tracking-[0.16em] text-white/90 backdrop-blur-sm">
        360°
      </span>

      {/* Drag affordance — it says what to do, then gets out of the way. */}
      <p
        data-motion
        aria-hidden="true"
        className={`pointer-events-none absolute inset-x-0 bottom-20 flex justify-center transition-[opacity,transform] duration-500 ease-out ${
          ready && showHint ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
        }`}
      >
        <span className="inline-flex items-center gap-2 rounded-full bg-baseBlack/55 px-4 py-2 text-xs font-medium text-white/90 backdrop-blur-sm">
          <FiMove className="h-3.5 w-3.5" aria-hidden="true" />
          {labels.drag}
        </span>
      </p>

      {/* Controls: translucent, floating, and only once there is something to
          control. Never stacked on another translucent layer. */}
      <div
        data-motion
        className={`absolute inset-x-0 bottom-4 flex justify-center transition-[opacity,transform] duration-500 ease-out ${
          ready ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"
        }`}
      >
        <div className="flex items-center gap-1 rounded-full border border-white/15 bg-baseBlack/55 p-1 backdrop-blur-xl">
          <button
            type="button"
            onClick={() => setOrbiting((value) => !value)}
            aria-pressed={orbiting}
            aria-label={orbiting ? labels.pause : labels.play}
            title={orbiting ? labels.pause : labels.play}
            className={control}
          >
            {orbiting ? (
              <FiPause className="h-4 w-4" aria-hidden="true" />
            ) : (
              <FiPlay className="h-4 w-4" aria-hidden="true" />
            )}
          </button>

          <button
            type="button"
            onClick={recenter}
            aria-label={labels.reset}
            title={labels.reset}
            className={control}
          >
            <FiCrosshair className="h-4 w-4" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={toggleFullscreen}
            aria-pressed={isFullscreen}
            aria-label={isFullscreen ? labels.exitFullscreen : labels.fullscreen}
            title={isFullscreen ? labels.exitFullscreen : labels.fullscreen}
            className={control}
          >
            {isFullscreen ? (
              <FiMinimize className="h-4 w-4" aria-hidden="true" />
            ) : (
              <FiMaximize className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
