import './THREE.Fire/Fire';
import './THREE.Fire/FireShader';

import * as React from 'react';
import * as THREE from 'three';

import {
  HALF_PI,
  linearMap,
  linearMap3,
  PI,
  powerMap,
  segmentedMap,
} from './common';

import settings from './settings';
import { useFrame } from 'react-three-fiber';

export const pentagramCentre = new THREE.Vector3(-2, 0, 0);

export const getPointOnPentagon = (pt: number): THREE.Vector3 => {
  // map the point so the drawing starts in the right place
  const n = (pt - 1) % 5;

  const angle =
    ((4 * PI * n) / 5) + (settings.invertPentagrams ? -HALF_PI : HALF_PI);
  const radius = 1.5;

  return new THREE.Vector3(
    -2,
    radius * Math.sin(angle),
    radius * Math.cos(angle)
  );
};

export const getPointOnPentagram = (v: number): THREE.Vector3 => {
  const sideStart = Math.floor(v);
  const sideEnd = sideStart + 1;
  const start = getPointOnPentagon(sideStart);
  const end = getPointOnPentagon(sideEnd);

  return linearMap3(v, sideStart, sideEnd, start, end);
};

const textureLoader = new THREE.TextureLoader();
const tex = textureLoader.load('./THREE.Fire/Fire.png');

interface Fire extends THREE.Object3D {
  update(time: number): void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  material: any;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const createFire = () => new (THREE as any).Fire(tex);

interface PentagramState {
  frame: number;
  fires: Fire[];
}

interface PentagramProps {
  angle: number;
  startFrame: number;
  endFrame: number;
}

export const Pentagram = (props: PentagramProps): JSX.Element => {
  const flameCount = settings.frameCapture ? 99 : 31;

  const [state, setState] = React.useState<PentagramState>({
    frame: 0,
    fires: Array.from(Array(flameCount)).map(() => createFire()),
  });

  // eslint-disable-next-line functional/no-expression-statement
  useFrame(() => {
    // eslint-disable-next-line functional/no-expression-statement
    state.fires.forEach((fire, index) => {
      const allFlamesCompleteFrame = linearMap(
        0.5,
        0,
        1,
        props.startFrame,
        props.endFrame
      );

      const flameStartFrame = linearMap(
        index,
        0,
        state.fires.length,
        props.startFrame,
        allFlamesCompleteFrame
      );

      const flameCompleteFrame =
        flameStartFrame + ((props.endFrame - props.startFrame) / 10);

      const flareStartFrame = linearMap(
        0.8,
        0,
        1,
        props.startFrame,
        props.endFrame
      );

      const flareEndFrame = linearMap(
        0.9,
        0,
        1,
        props.startFrame,
        props.endFrame
      );

      const flareMagnitude = 1;
      const flameOnMagnitude = 1.3;
      const flameOffMagnitude = 30;

      const flareGain = 0.2;
      const flameOnGain = 0.5;
      const flameOffGain = 5;

      const frameSegments = [
        flameStartFrame,
        flameCompleteFrame,
        flareStartFrame,
        flareEndFrame,
        props.endFrame,
      ];

      const maps = [powerMap(2), linearMap, linearMap, powerMap(5)];

      // eslint-disable-next-line functional/no-expression-statement
      fire.material.uniforms.magnitude.value = segmentedMap(
        state.frame,
        frameSegments,
        [
          flameOffMagnitude,
          flameOnMagnitude,
          flameOnMagnitude,
          flareMagnitude,
          flameOffMagnitude,
        ],
        maps
      );

      // eslint-disable-next-line functional/no-expression-statement
      fire.material.uniforms.gain.value = segmentedMap(
        state.frame,
        frameSegments,
        [flameOffGain, flameOnGain, flameOnGain, flareGain, flameOffGain],
        maps
      );

      if (state.frame >= props.startFrame && state.frame <= props.endFrame) {
        // eslint-disable-next-line functional/no-expression-statement
        fire.update(state.frame / 25);
      }
    });

    // eslint-disable-next-line functional/no-expression-statement
    setState({ ...state, frame: (state.frame + 1) % settings.cycleLength });
  });

  if (props.startFrame <= state.frame && state.frame <= props.endFrame) {
    const scale = 0.4;

    return (
      <group rotation={new THREE.Euler(0, props.angle, 0)}>
        {state.fires.map((fire, index) => (
          <group
            key={index}
            position={getPointOnPentagram((5 * index) / state.fires.length)}
            scale={new THREE.Vector3(scale, scale, scale)}
          >
            <primitive object={fire} />
          </group>
        ))}
      </group>
    );
  } else {
    return <></>;
  }
};
