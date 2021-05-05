/* eslint-disable functional/no-expression-statement */
import * as bspConstructor from 'three-js-csg';
import * as fs from 'fs';
import * as THREE from 'three';

import { createEllipsoid } from './commonGeometry';
import { floorLevel } from '../src/common';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ThreeBSP: any = bspConstructor(THREE);

const outfilename = process.argv[2];
const outline = process.argv[3] === 'true';
const left = process.argv[4] === 'true';

const scalar = outline ? 0.07 : 0;

const radius = 0.5;

const footRatio = 1.75;
const footCenterX = left ? -0.85 : 0.85;

const footEllipsoid = createEllipsoid(
  radius,
  radius,
  radius * footRatio,
  scalar
).translate(footCenterX, floorLevel, radius);

const footEllipsoidBsp = new ThreeBSP(
  new THREE.BufferGeometry().fromGeometry(footEllipsoid)
);

const floorBox = new THREE.BoxGeometry(2, radius, 3).translate(
  footCenterX,
  floorLevel - (0.5 * radius) - scalar,
  0
);
const floorBoxBsp = new ThreeBSP(
  new THREE.BufferGeometry().fromGeometry(floorBox)
);

const foot: THREE.BufferGeometry = footEllipsoidBsp
  .subtract(floorBoxBsp)
  .toBufferGeometry();

// eslint-disable-next-line functional/no-expression-statement
fs.writeFileSync(outfilename, JSON.stringify(foot.toJSON(), null, 2));
