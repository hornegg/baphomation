/* eslint-disable functional/no-expression-statement */
import * as React from 'react';
import * as THREE from 'three';
import { CanvasContext, useFrame } from 'react-three-fiber';

interface FrameLimiterProps {
  fps: number;
}

const FrameLimiter = (props: FrameLimiterProps): JSX.Element => {
  const [clock] = React.useState<THREE.Clock>(new THREE.Clock());

  useFrame((canvasContext: CanvasContext) => {
    canvasContext.ready = false;
    const timeUntilNextFrame = (1000 / props.fps) - clock.getDelta();

    setTimeout(() => {
      canvasContext.ready = true;
      canvasContext.invalidate();
    }, Math.max(0, timeUntilNextFrame));
  });

  return <></>;
};

export default FrameLimiter;
