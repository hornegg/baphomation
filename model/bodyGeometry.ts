import * as bspConstructor from 'three-js-csg';
import * as fs from 'fs';
import * as THREE from 'three';

import { createCylinder, createEllipsoid } from './commonGeometry';
import { QUARTER_PI } from '../src/common';

import settings from '../src/settings';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ThreeBSP: any = bspConstructor(THREE);

const outfilename = process.argv[2];
const outline = process.argv[3] === 'true';

const scalar = outline ? 0.07 : 0;

const createWing = (sign: 1 | -1) => {
  const quadParams = (
    p1: [number, number],
    p2: [number, number]
  ): [number, number, number, number] => {
    const perp = [p1[1] - p2[1], p2[0] - p1[0]].map((n) => 0.7 * n);
    const mid = [0.5 * (p1[0] + p2[0]), 0.5 * (p1[1] + p2[1])];
    const c: [number, number] = [mid[0] + perp[0], mid[1] + perp[1]];

    return [sign * c[0], c[1], sign * p2[0], p2[1]];
  };

  const bladeStartX = 0.83 - scalar;
  const bladeStartY = -1.2 + scalar;
  const bladeEndX = 1.94;
  const bladeEndY = -0.28 + scalar;
  const drop = 0.5 + scalar + scalar;

  // Define the four points along the bottom of the wing (outside to inside: a, b, c, d)
  const a: [number, number] = [bladeEndX, bladeEndY];
  const b: [number, number] = [bladeEndX, -0.9 - scalar];
  const c: [number, number] = [1.4, -1.4 - scalar];
  const d: [number, number] = [bladeStartX, bladeStartY - drop];

  const shape = new THREE.Shape()
    .moveTo(sign * bladeStartX, bladeStartY - drop)
    .lineTo(sign * bladeStartX, bladeStartY)
    .bezierCurveTo(
      sign * bladeStartX,
      bladeStartY + 0.4,
      sign * bladeEndX,
      bladeEndY - 0.4,
      sign * bladeEndX,
      bladeEndY
    )
    .quadraticCurveTo(...quadParams(a, b))
    .quadraticCurveTo(...quadParams(b, c))
    .quadraticCurveTo(...quadParams(c, d));

  const extrudeSettings = {
    steps: 1,
    depth: 0.05,
    bevelEnabled: false,
  };

  const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  return new ThreeBSP(new THREE.BufferGeometry().fromGeometry(geom));
};

// Head

const loader = new THREE.BufferGeometryLoader();

const head = loader.parse(
    JSON.parse(
      fs.readFileSync(`${__dirname}/../dist/outlineHeadGeometry.json`, {
        encoding: 'utf8',
      })
    )
);

const headBox = new THREE.BoxGeometry(2, 2, 2).translate(0, 1.5, 0);

// Body

const bodyEllipsoid = createEllipsoid(0.75, 1.8, 0.5, scalar).translate(
  0,
  -1.3,
  0
);

const nsfw = (bsp) => {
  const params: [number, number, number] = [0.35, -1.4, 0.5];

  const leftBreast = createEllipsoid(0.25, 0.25, 0.25, scalar).translate(
    -params[0],
    params[1],
    params[2]
  );

  const rightBreast = createEllipsoid(0.25, 0.25, 0.25, scalar).translate(
    params[0],
    params[1],
    params[2]
  );

  const height = 1;
  const rotation = QUARTER_PI;
  const translation: [number, number, number] = [0, -1.9, 1.05];

  const cylinder = createCylinder(0.1, height, scalar)
    .translate(0, -height / 2, 0)
    .rotateX(rotation)
    .translate(...translation);

  const sphere = createEllipsoid(0.13, 0.13, 0.13, scalar)
    .rotateX(rotation)
    .translate(...translation);

  return bsp
    .union(new ThreeBSP(new THREE.BufferGeometry().fromGeometry(leftBreast)))
    .union(new ThreeBSP(new THREE.BufferGeometry().fromGeometry(rightBreast)))
    .union(new ThreeBSP(new THREE.BufferGeometry().fromGeometry(cylinder)))
    .union(new ThreeBSP(new THREE.BufferGeometry().fromGeometry(sphere)));
};

const bodyEllipsoidRegularBsp = new ThreeBSP(
  new THREE.BufferGeometry().fromGeometry(bodyEllipsoid)
);

const bodyEllipsoidBsp = settings.nsfw
  ? nsfw(bodyEllipsoidRegularBsp)
  : bodyEllipsoidRegularBsp;

// Combine

const headBsp = new ThreeBSP(head);
const headBoxBsp = new ThreeBSP(
  new THREE.BufferGeometry().fromGeometry(headBox)
);

const body: THREE.BufferGeometry = bodyEllipsoidBsp
  .subtract(headBoxBsp)
  .subtract(headBsp)
  .union(createWing(1))
  .union(createWing(-1))
  .toBufferGeometry();

// eslint-disable-next-line functional/no-expression-statement
fs.writeFileSync(
  outfilename,
  JSON.stringify(
    body.toJSON(),
    null,
    2
  )
);
