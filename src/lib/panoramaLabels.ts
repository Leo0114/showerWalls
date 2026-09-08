import type { Dictionary } from "@/i18n/i18n";
import type { PanoramaLabels } from "@/components/shared/PanoramaViewer";

/**
 * Bridges the snake_case dictionary to the viewer's prop shape, so every surface
 * that mounts a `<PanoramaViewer />` island is localized the same way.
 */
export const panoramaLabels = (i18n: Dictionary): PanoramaLabels => ({
  enter: i18n.common.panorama.enter,
  loading: i18n.common.panorama.loading,
  drag: i18n.common.panorama.drag,
  play: i18n.common.panorama.play,
  pause: i18n.common.panorama.pause,
  reset: i18n.common.panorama.reset,
  fullscreen: i18n.common.panorama.fullscreen,
  exitFullscreen: i18n.common.panorama.exit_fullscreen,
});
