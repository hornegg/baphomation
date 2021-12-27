/* eslint-disable immutable/no-let */
/* eslint-disable functional/no-expression-statement */
import p5 from 'p5';

const createLetteringComponentWithCallbacks = (
  domElement: HTMLElement,
  frameRendered: () => void
): Promise<() => void> =>
  new Promise((resolve) => {
    new p5((p: p5) => {
      const render = p.loop;

      p.setup = () => {
        p.noLoop();
        resolve(render);
      };

      p.draw = () => {
          p.background(255, 0);
          p.text(`${p.frameCount}`, 10, 10);
          p.noLoop();
          frameRendered();
      };

    }, domElement);
  });

export const createLetteringComponent = async (
  domElement: HTMLElement
): Promise<() => Promise<void>> => {
  let resolveFrame = null;

  const render = await createLetteringComponentWithCallbacks(domElement, () =>
    resolveFrame()
  );

  return () =>
    new Promise((resolve) => {
      resolveFrame = resolve;
      render();
    });
};
