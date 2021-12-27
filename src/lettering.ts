/* eslint-disable immutable/no-let */
/* eslint-disable functional/no-expression-statement */
import p5 from 'p5';
import settings from './settings';

const createLetteringComponentWithCallbacks = (
  frameRendered: () => void
): Promise<{ render: () => void; domElement: HTMLElement }> =>
  new Promise((resolve) => {
    new p5((p: p5) => {
      const render = () => {
        p.loop();
      };

      p.setup = () => {
        const renderer = p.createCanvas(settings.width, settings.height);
        p.noLoop();
        resolve({ render, domElement: renderer.elt });
      };

      p.draw = () => {
        p.background(255, 0, 0);
        p.text(`${p.frameCount}`, 10, 10);
        p.noLoop();
        frameRendered();
      };
    });
  });

export const createLetteringComponent = async (): Promise<{
  render: () => Promise<void>;
  domElement: HTMLElement;
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
