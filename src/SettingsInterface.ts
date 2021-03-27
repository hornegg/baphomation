export interface WatchTowers {
  name: [string, string, string, string];
  color: [string, string, string, string];
}

export interface SettingsInterface {
  width: number;
  height: number;
  cycleLength: number; // The number of frames before the animation repeats itself
  fps: number; // Frames per second
  frameCapture: boolean;
  invertPentagrams: boolean;
  nsfw: boolean;
  watchTowers: WatchTowers;
}
