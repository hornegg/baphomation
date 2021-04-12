/* eslint-disable functional/no-expression-statement */
import * as path from 'path';
import { performance } from 'perf_hooks';

import { times } from 'lodash';
import * as pLimit from 'p-limit';

import { p5, readPng, writePng } from './p5Headless';
import settings from '../src/settings';
import { linearMap, segmentedMap, watchTowerLength } from '../src/common';

const usage = 'usage: ts-node postProcessing.ts [offset] [frameCount]';

if (process.argv.length !== 4) {
  console.error(usage);
  console.error();
  process.exit(1);
}

const offset = parseInt(process.argv[2]);
const frameCount = parseInt(process.argv[3]);

if (isNaN(offset)) {
  console.error(usage);
  console.error('offset is not a number');
  console.error();
  process.exit(1);
}

if (isNaN(frameCount)) {
  console.error(usage);
  console.error('frameCount is not a number');
  console.error();
  process.exit(1);
}

const start = performance.now();

const hueAdjustments = {
  blue: 212,
  green: 60,
  yellow: 20,
  red: -30,
};

const colors = {
  blue: [0, 0, 255],
  green: [0, 255, 0],
  yellow: [255, 255, 0],
  red: [255, 0, 0],
};

const inputDir = path.resolve(path.join(__dirname, '..', 'dist', 'rawFrames'));
const outputDir = path.resolve(path.join(__dirname, '..', 'dist', 'frames'));

const getFrameFilename = (frame: number) => {
  const frameString = frame.toString().padStart(6, '0');
  return `f${frameString}.png`;
};

const getInputFrameFilename = (frame: number) =>
  path.join(inputDir, getFrameFilename(frame));

const getOutputFrameFilename = (frame: number) =>
  path.join(outputDir, getFrameFilename(frame));

const limit = pLimit(8);

new p5((p: p5) => {
  const changeHues = (img: p5.Image, adjustment: number) => {
    times(img.width, (x) => {
      times(img.height, (y) => {
        p.colorMode(p.RGB);
        const oldColor = p.color(img.get(x, y));

        const oldHue = p.hue(oldColor);
        const s = p.saturation(oldColor);
        const b = p.brightness(oldColor);
        const a = p.alpha(oldColor);

        const newHue = oldHue + adjustment;
        p.colorMode(p.HSB);
        const newColor = p.color(newHue, s, b);
        img.set(x, y, [
          p.red(newColor),
          p.green(newColor),
          p.blue(newColor),
          a,
        ]);
      });
    });

    img.updatePixels();
  };

  p.setup = async () => {
    const framePromises = times(frameCount, (index) =>
      limit(() => {
        const frame = offset + index;

        const cycleFrame666 = frame % settings.cycleLength;
        const watchTowerFrame = frame % watchTowerLength;
        const watchTowerIndex = Math.floor(cycleFrame666 / watchTowerLength);
        const watchTowerColor = settings.watchTowers.color[watchTowerIndex];

        return Promise.all([
          readPng(getInputFrameFilename(frame)),
          readPng(getInputFrameFilename(frame + settings.cycleLength)),
          readPng(
            getInputFrameFilename(
              frame + settings.cycleLength + settings.cycleLength
            )
          ),
        ]).then(([topFlames, baphomet, bottomFlames]) => {
          const hueAdjustment = hueAdjustments[watchTowerColor]
            ? hueAdjustments[watchTowerColor]
            : 0;
          changeHues(topFlames, hueAdjustment);
          changeHues(bottomFlames, hueAdjustment);

          const g = p.createGraphics(settings.width, settings.height);

          g.background(255);
          g.image(bottomFlames, 0, 0);
          g.image(baphomet, 0, 0);
          g.image(topFlames, 0, 0);

          const frameSegments = [
            linearMap(0.5, 0, 1, 0, watchTowerLength),
            linearMap(0.6, 0, 1, 0, watchTowerLength),
            linearMap(0.7, 0, 1, 0, watchTowerLength),
            linearMap(0.8, 0, 1, 0, watchTowerLength),
          ];

          const text = settings.watchTowers.name[watchTowerIndex].toUpperCase();
          const textHeight = 120;
          g.textFont('Impact');
          g.textSize(textHeight);
          const textWidthExtra = 50;
          const gText = p.createGraphics(
            g.textWidth(text) + textWidthExtra,
            textHeight
          );

          const alpha = segmentedMap(watchTowerFrame, frameSegments, [
            0,
            255,
            255,
            0,
          ]);

          const color: [number, number, number] = colors[watchTowerColor];
          gText.textFont('Impact', textHeight);
          gText.fill(...color, alpha);

          const textSize = segmentedMap(watchTowerFrame, frameSegments, [
            0,
            1,
            1,
            2,
          ]);

          gText.text(text, 0, gText.height);

          const textWidth = gText.width * textSize;

          const yBase = 25;
          const yAdj = 280;

          const y = segmentedMap(watchTowerFrame, frameSegments, [
            yBase + yAdj,
            yBase,
            yBase,
            yBase - yAdj,
          ]);

          g.image(
            gText,
            0.5 * (g.width - textWidth + textWidthExtra),
            y,
            textWidth,
            gText.height * textSize
          );

          return writePng(g, getOutputFrameFilename(frame));
        });
      })
    );

    await Promise.all(framePromises);

    const end = performance.now();

    console.log(
      `Post-processed frames ${offset} to ${offset + frameCount - 1} in ${(
        (end - start) /
        1000
      ).toFixed(1)} seconds`
    );

   process.exit(0);
  };
});
