import * as THREE from 'three';

import {
  HALF_PI,
  QUARTER_PI,
  PI,
  EIGHTH_PI,
  segmentedMap,
  watchTowerLength,
} from './common';
import settings from './settings';

const getCameraPosition = (frame: number): THREE.Vector3 => {
  const baseHeight = HALF_PI;
  const baseAngle = PI + QUARTER_PI;

  const highHeight = EIGHTH_PI;
  const leftAngle = baseAngle - EIGHTH_PI;
  const rightAngle = baseAngle + EIGHTH_PI;

  const frameSegments = [
    0.0 * watchTowerLength,
    0.9 * watchTowerLength,
    1.0 * watchTowerLength,
    1.9 * watchTowerLength,
    2.0 * watchTowerLength,
    2.9 * watchTowerLength,
    3.0 * watchTowerLength,
    3.9 * watchTowerLength,
    4.0 * watchTowerLength,
  ];

  const xSegments = [
    rightAngle,
    rightAngle,
    leftAngle,
    leftAngle,
    rightAngle,
    rightAngle,
    leftAngle,
    leftAngle,
    rightAngle,
  ];

  const ySegments = [
    baseHeight,
    baseHeight,
    baseHeight,
    baseHeight,
    highHeight,
    highHeight,
    highHeight,
    highHeight,
    baseHeight,
  ];

  return new THREE.Vector3().setFromSphericalCoords(
    6,
    segmentedMap(frame % settings.cycleLength, frameSegments, ySegments),
    segmentedMap(frame % settings.cycleLength, frameSegments, xSegments)
  );
};

export default getCameraPosition;
