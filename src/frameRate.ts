/* eslint-disable functional/no-expression-statement */
import * as THREE from 'three';
import { AnimationLoopComponent } from './common';

interface FrameRateProps {
  logger?: (s: string) => void;
}

export const createFrameRateComponent = (
  props: FrameRateProps
): AnimationLoopComponent<void> => {
  // eslint-disable-next-line immutable/no-let
  let frameCount = 0;

  setInterval(() => {
    props.logger(`${frameCount} fps`);
    frameCount = 0;
  }, 1000);

  return () => {
    ++frameCount;
    return new THREE.Group();
  };
};
