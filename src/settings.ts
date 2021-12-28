/* eslint-disable @typescript-eslint/no-unused-vars */
import { SettingsInterface, WatchTowers } from './SettingsInterface';

const watchTowersBlank: WatchTowers = {
  name: ['', '', '', ''],
  color: ['yellow', 'red', 'blue', 'green'],
};

const watchTowersGD: WatchTowers = {
  name: ['Iahveh', 'Adonai', 'Eheieh', 'Alga'],
  color: ['yellow', 'red', 'blue', 'green'],
};

const watchTowersAngels: WatchTowers = {
  name: ['Raphael', 'Michael', 'Gabriel', 'Auriel'],
  color: ['yellow', 'red', 'blue', 'green'],
};

const watchTowersQuillhoth: WatchTowers = {
  name: ['Leviathan', 'Belial', 'Lucifer', 'Satan'],
  color: ['blue', 'green', 'yellow', 'red'],
};

const settings: SettingsInterface = {
  width: 800,
  height: 600,
  cycleLength: 1200, // The number of frames before the animation repeats itself
  fps: 30, // Frames per second
  frameCapture: false,
  invertPentagrams: false,
  nsfw: false,
  watchTowers: watchTowersGD,
};

export const watchTowerLength = settings.cycleLength / 4;

export default settings;
