import * as THREE from 'three';
import { createFire, Fire } from '../meshes/fire';
import { HALF_PI, PI } from '../common/constants';
import { linearMap, linearMap3, powerMap, segmentedMap } from '../common/maps';
import { AnimationLoopComponent } from './AnimationLoopComponent';

import settings from '../settings';

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
    radius * Math.cos(angle),
  );
};

export const getPointOnPentagram = (v: number): THREE.Vector3 => {
  const sideStart = Math.floor(v);
  const sideEnd = sideStart + 1;
  const start = getPointOnPentagon(sideStart);
  const end = getPointOnPentagon(sideEnd);

  return linearMap3(v, sideStart, sideEnd, start, end);
};

interface PentagramState {
  frame: number;
  fires: Fire[];
}

export interface PentagramProps {
  angle: number;
  startFrame: number;
  endFrame: number;
}

export const createPentagram = (): AnimationLoopComponent<PentagramProps> => {
  const flameCount = settings.frameCapture ? 99 : 31;

  // eslint-disable-next-line immutable/no-let
  let state: PentagramState = {
    frame: 0,
    fires: Array.from(Array(flameCount)).map(() => createFire()),
  };

  return (props: PentagramProps): THREE.Object3D => {
    state.fires.forEach((fire, index) => {
      const allFlamesCompleteFrame = linearMap(
        0.5,
        0,
        1,
        props.startFrame,
        props.endFrame,
      );

      const flameStartFrame = linearMap(
        index,
        0,
        state.fires.length,
        props.startFrame,
        allFlamesCompleteFrame,
      );

      const flameCompleteFrame =
        flameStartFrame + ((props.endFrame - props.startFrame) / 10);

      const flareStartFrame = linearMap(
        0.8,
        0,
        1,
        props.startFrame,
        props.endFrame,
      );

      const flareEndFrame = linearMap(
        0.9,
        0,
        1,
        props.startFrame,
        props.endFrame,
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
        maps,
      );

      fire.material.uniforms.gain.value = segmentedMap(
        state.frame,
        frameSegments,
        [flameOffGain, flameOnGain, flameOnGain, flareGain, flameOffGain],
        maps,
      );

      if (state.frame >= props.startFrame && state.frame <= props.endFrame) {
        fire.update(state.frame / 25);
      }
    });

    state = { ...state, frame: (state.frame + 1) % settings.cycleLength };

    const group = new THREE.Group();

    if (props.startFrame <= state.frame && state.frame <= props.endFrame) {
      const scale = 0.4;

      group.setRotationFromEuler(new THREE.Euler(0, props.angle, 0));

      state.fires.forEach((fire, index) => {
        const subGroup = new THREE.Group();
        subGroup.add(fire);
        subGroup.position.set(
          ...getPointOnPentagram((5 * index) / state.fires.length).toArray(),
        );
        subGroup.scale.set(scale, scale, scale);
        group.add(subGroup);
      });
    }
    return group;
  };
};
