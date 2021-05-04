import * as bspConstructor from 'three-js-csg';
import * as fs from 'fs';
import * as THREE from 'three';

import { createEllipsoid } from './commonGeometry';

const ThreeBSP = bspConstructor(THREE);

const outfilename = process.argv[2];
const outline = process.argv[3] === 'true';

const scalar = outline ? 0.07 : 0;
const head = createEllipsoid(1.5, 1.0, 1.0, scalar);

// vector between center of head and center of ear
const x = 1.44;
const y = 0.6;
const z = -0.3;

const earParams: [number, number, number, number] = [0.4, 0.4, 0.25, scalar];
const leftEar = createEllipsoid(...earParams).translate(x, y, z);
const rightEar = createEllipsoid(...earParams).translate(-x, y, z);

const headBsp = new ThreeBSP(new THREE.BufferGeometry().fromGeometry(head));
const leftEarBsp = new ThreeBSP(
  new THREE.BufferGeometry().fromGeometry(leftEar)
);
const rightEarBsp = new ThreeBSP(
  new THREE.BufferGeometry().fromGeometry(rightEar)
);

const leftIntersect = headBsp.intersect(leftEarBsp);
const rightIntersect = headBsp.intersect(rightEarBsp);

const geometry: THREE.Geometry = headBsp
  .union(leftEarBsp)
  .union(rightEarBsp)
  .subtract(leftIntersect)
  .subtract(rightIntersect)
  .toGeometry();

// eslint-disable-next-line functional/no-expression-statement
fs.writeFileSync(
  outfilename,
  JSON.stringify(
    new THREE.BufferGeometry().fromGeometry(geometry).toJSON(),
    null,
    2
  )
);
