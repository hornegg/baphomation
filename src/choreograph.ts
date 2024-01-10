import * as THREE from 'three';

import { getPointOnPentagon, pentagramCentre } from './components/pentagram';
import { linearMap, segmentedLinearMap3, segmentedMap } from './common/maps';
import settings, { watchTowerLength } from './settings';
import { HALF_PI } from './common/constants';
import { MainState } from './components/main';

export const pentagramLength = (2 * watchTowerLength) / 3;

export const choreographBody = (frame: number): MainState => {
  const midStepLength = linearMap(0.5, 0, 1, pentagramLength, watchTowerLength);

  const cycleFrame = frame % settings.cycleLength;
  const watchTower = 3 - Math.floor(cycleFrame / watchTowerLength);
  const watchTowerFrame = cycleFrame % watchTowerLength;

  const bodyAngle = segmentedMap(
    watchTowerFrame,
    [pentagramLength, watchTowerLength],
    [watchTower * HALF_PI, (watchTower - 1) * HALF_PI],
  );

  const leftFootAngle = segmentedMap(
    watchTowerFrame,
    [pentagramLength, midStepLength],
    [watchTower * HALF_PI, (watchTower - 1) * HALF_PI],
  );

  const rightFootAngle = segmentedMap(
    watchTowerFrame,
    [midStepLength, watchTowerLength],
    [watchTower * HALF_PI, (watchTower - 1) * HALF_PI],
  );

  const layer = Math.floor(frame / settings.cycleLength) % 3;

  const layerInfo = settings.frameCapture
    ? {
        topFlames: layer === 0,
        baphomet: layer === 1,
        bottomFlames: layer === 2,
      }
    : { topFlames: true, baphomet: true, bottomFlames: true };

  return {
    frame,
    bodyAngle,
    leftFootAngle,
    rightFootAngle,
    layerInfo,
  };
};

const neutralLeft = new THREE.Vector3(1, -4, 0);
const neutralRight = new THREE.Vector3(-1, -4, 0);

export const stillArm = neutralLeft;

export const choreographArm = (watchTowerFrame: number): THREE.Vector3 => {
  const changeCoords = (pt: THREE.Vector3) => {
    return new THREE.Vector3(pt.z, pt.y, -pt.x);
  };

  const pentagramStart = 0.05 * watchTowerLength;
  const pentagramEnd = 0.4 * watchTowerLength;
  const centreStart = 0.45 * watchTowerLength;
  const centreEnd = 0.65 * watchTowerLength;
  const finish = 0.75 * watchTowerLength;

  const frameSegments = [
    0,
    ...[0, 1, 2, 3, 4, 5].map((v) =>
      linearMap(v, 0, 5, pentagramStart, pentagramEnd),
    ),
    centreStart,
    centreEnd,
    finish,
  ];

  const positionSegments = [
    neutralRight,
    ...[0, 1, 2, 3, 4, 5].map((v) => changeCoords(getPointOnPentagon(v))),
    changeCoords(pentagramCentre),
    changeCoords(pentagramCentre),
    neutralRight,
  ];

  const pointAt = segmentedLinearMap3(
    watchTowerFrame,
    frameSegments,
    positionSegments,
  );

  return pointAt;
};
