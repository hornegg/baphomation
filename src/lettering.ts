/* eslint-disable immutable/no-let */
/* eslint-disable functional/no-expression-statement */
import { linearMap, segmentedMap } from './common/maps';
import settings, { watchTowerLength } from './settings';
import p5 from 'p5';

const colors = {
  blue: [0, 0, 255],
  green: [0, 255, 0],
  yellow: [255, 255, 0],
  red: [255, 0, 0],
};

const frameSegments = [
  linearMap(0.5, 0, 1, 0, watchTowerLength),
  linearMap(0.6, 0, 1, 0, watchTowerLength),
  linearMap(0.7, 0, 1, 0, watchTowerLength),
  linearMap(0.8, 0, 1, 0, watchTowerLength),
];

const createLetteringComponentWithCallbacks = (
  frameRendered: () => void
): Promise<{ render: () => void; domElement: HTMLCanvasElement }> =>
  new Promise((resolve) => {
    new p5((p: p5) => {
      let backgroundPixels: number[] = null;

      const render = () => {
        p.loop();
      };

      p.setup = () => {
        const renderer = p.createCanvas(settings.width, settings.height);
        p.noLoop();
        resolve({ render, domElement: renderer.elt });
      };

      p.draw = () => {
        if (!backgroundPixels) {
          p.loadPixels();
          backgroundPixels = Array(p.pixels.length).fill(0);
        }

        p.pixels = backgroundPixels;
        p.updatePixels();

        const watchTowerIndex =
          Math.floor(p.frameCount / watchTowerLength) %
          settings.watchTowers.color.length;
        const watchTowerFrame = p.frameCount % watchTowerLength;
        const watchTowerColor = settings.watchTowers.color[watchTowerIndex];

        const text = settings.watchTowers.name[watchTowerIndex].toUpperCase();
        const textHeight = 60;
        p.textFont('Impact');
        p.textSize(textHeight);
        const textWidthExtra = 50;
        const gText = p.createGraphics(
          p.textWidth(text) + textWidthExtra,
          textHeight
        );

        const alpha = segmentedMap(
          watchTowerFrame,
          frameSegments,
          [0, 255, 255, 0]
        );

        const color: [number, number, number] = colors[watchTowerColor];
        gText.textFont('Impact', textHeight);
        gText.fill(...color, alpha);

        const textSize = segmentedMap(
          watchTowerFrame,
          frameSegments,
          [0, 1, 1, 2]
        );

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

        p.image(
          gText,
          0.5 * (p.width - textWidth + textWidthExtra),
          y,
          textWidth,
          gText.height * textSize
        );

        p.noLoop();
        frameRendered();
      };
    });
  });

export const createLetteringComponent = async (): Promise<{
  render: () => Promise<void>;
  domElement: HTMLCanvasElement;
}> => {
  let resolveFrame = null;

  const { render, domElement } = await createLetteringComponentWithCallbacks(
    () => {
      resolveFrame();
    }
  );

  return {
    render: () =>
      new Promise((resolve) => {
        resolveFrame = resolve;
        render();
      }),
    domElement,
  };
};
