import * as fs from 'fs';
import * as THREE from 'three';
import * as bspConstructor from 'three-js-csg';

import { createEllipsoid } from './commonGeometry';
import { HALF_PI } from '../src/common';

const ThreeBSP = bspConstructor(THREE);

const outfilename = process.argv[2];
const outline = process.argv[3] === 'true';

const scalar = outline ? 0.07 : 0;

interface CylinderParams {
  sign: 1 | -1;
  x: number;
  y: number;
  z: number;
  width: number;
  height: number;
  depth: number;
}

const createCylinder = (params: CylinderParams) => {
  const radialSegments = 16;
  const cylinder = new THREE.CylinderGeometry(
    params.width + scalar,
    params.height + scalar,
    params.depth + scalar,
    radialSegments
  );

  cylinder.rotateX(HALF_PI);
  cylinder.translate(params.sign * params.x, params.y, params.z);

  return new ThreeBSP(cylinder);
};

const createWingBlade = (sign: 1 | -1, xStart: number, yStart: number, xEnd: number, yEnd: number) => {
  const shape = new THREE.Shape();
  shape.moveTo(sign * xStart, yStart);
  shape.lineTo(sign * 0.75, -1);
  shape.lineTo(sign * 2.35, -0.5);
  shape.lineTo(sign * xEnd, yEnd);
  shape.lineTo(sign * xStart, yStart);

  const extrudeSettings = {
    steps: 1,
    depth: 0.05,
    bevelEnabled: false,
  };
  const geom = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  return new ThreeBSP(geom);
};

const createWing = (sign: 1 | -1) => {
  const size = { width: 0.35, height: 0.35, depth: 0.05 };

  const pos1 = { x: 1.1, y: -1.4, z: -0.25/*0*/ };

  const pos2 = {
    x: pos1.x + (1.4 * size.width),
    y: pos1.y + (0.8 * size.height),
    z: pos1.z,
  };

  const pos3 = {
    x: pos2.x + (1.0 * size.width),
    y: pos2.y + (1.4 * size.height),
    z: pos2.z,
  };

  const c1 = createCylinder({
    sign,
    ...pos1,
    ...size,
  });

  const c2 = createCylinder({
    sign,
    ...pos2,
    ...size,
  });

  const c3 = createCylinder({
    sign,
    ...pos3,
    ...size,
  });

  const blade = createWingBlade(sign, 0.75, -2, 2, -2);
  return c1.union(c2).union(c3).union(blade);
};

const bodyEllipsoid = createEllipsoid(0.75, 1.8, 0.5, scalar);
bodyEllipsoid.translate(0, -1.3, 0);
const bodyEllipsoidBsp = new ThreeBSP(bodyEllipsoid);

const headBox = new THREE.BoxGeometry(2, 2, 2);
headBox.translate(0, 1.5, 0);
const headBoxBsp = new ThreeBSP(headBox);

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

const headBsp = new ThreeBSP(head);

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
