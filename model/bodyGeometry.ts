import * as fs from 'fs';
import * as THREE from 'three';
import * as bspConstructor from 'three-js-csg';
import settings from '../src/settings';

import { createEllipsoid } from './commonGeometry';

const ThreeBSP = bspConstructor(THREE);

const outfilename = process.argv[2];
const outline = process.argv[3] === 'true';

const scalar = outline ? 0.07 : 0;

const createWing = (sign: 1 | -1) => {
  const quadParams = (
    p1: [number, number],
    p2: [number, number]
  ): [number, number, number, number] => {
    const perp = [p1[1] - p2[1], p2[0] - p1[0]].map(n => 0.7 * n);
    const mid = [0.5 * (p1[0] + p2[0]), 0.5 * (p1[1] + p2[1])];
    const c: [number, number] = [mid[0] + perp[0], mid[1] + perp[1]];

    return [sign * c[0], c[1], sign * p2[0], p2[1]];
  };

  const bladeStartX = 0.83 - scalar;
  const bladeStartY = -1.2 + scalar;
  const bladeEndX = 1.94;
  const bladeEndY = -0.28 + scalar;
  const drop = 0.5 + scalar + scalar;

  const shape = new THREE.Shape();
  shape.moveTo(sign * bladeStartX, bladeStartY - drop);
  shape.lineTo(sign * bladeStartX, bladeStartY);

  shape.bezierCurveTo(
    sign * bladeStartX,
    bladeStartY + 0.4,
    sign * bladeEndX,
    bladeEndY - 0.4,
    sign * bladeEndX,
    bladeEndY
  );

  // Define the four points along the bottom of the wing (outside to inside: a, b, c, d)
  const a: [number, number] = [bladeEndX, bladeEndY];
  const b: [number, number] = [bladeEndX, -0.9 - scalar];
  const c: [number, number] = [1.4, -1.4 - scalar];
  const d: [number, number] = [bladeStartX, bladeStartY - drop];

  shape.quadraticCurveTo(...quadParams(a, b));
  shape.quadraticCurveTo(...quadParams(b, c));
  shape.quadraticCurveTo(...quadParams(c, d));

  const extrudeSettings = {
    steps: 1,
    depth: 0.05,
    bevelEnabled: false,
  };

  const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  return new ThreeBSP(geom);
};

// Head

const loader = new THREE.BufferGeometryLoader();

const head = new THREE.Geometry();

head.fromBufferGeometry(
  loader.parse(
    JSON.parse(
      fs.readFileSync(`${__dirname}/../dist/outlineHeadGeometry.json`, {
        encoding: 'utf8',
      })
    )
  )
);

const headBox = new THREE.BoxGeometry(2, 2, 2);
headBox.translate(0, 1.5, 0);

// Body

const bodyEllipsoid = createEllipsoid(0.75, 1.8, 0.5, scalar);
bodyEllipsoid.translate(0, -1.3, 0);

// eslint-disable-next-line immutable/no-let
let bodyEllipsoidBsp = new ThreeBSP(bodyEllipsoid);

// Breasts

if (settings.nsfw) {
  const left = createEllipsoid(0.25, 0.25, 0.25, scalar);
  const right = createEllipsoid(0.25, 0.25, 0.25, scalar);
  const params: [number, number, number] = [0.35, -1.4, 0.5];
  left.translate(-params[0], params[1], params[2]);
  right.translate(params[0], params[1], params[2]);

  const leftBsp = new ThreeBSP(left);
  const rightBsp = new ThreeBSP(right);
  bodyEllipsoidBsp = bodyEllipsoidBsp.union(leftBsp).union(rightBsp);
}

// Combine

const headBsp = new ThreeBSP(head);
const headBoxBsp = new ThreeBSP(headBox);

const body: THREE.Geometry = bodyEllipsoidBsp
  .subtract(headBoxBsp)
  .subtract(headBsp)
  .union(createWing(1))
  .union(createWing(-1))
  .toGeometry();

fs.writeFileSync(
  outfilename,
  JSON.stringify(
    new THREE.BufferGeometry().fromGeometry(body).toJSON(),
    null,
    2
  )
);
