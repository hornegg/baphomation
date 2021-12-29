/* eslint-disable functional/no-expression-statement */
import * as THREE from 'three';
import { createCylinder, createEllipsoid } from '../common/geometry';
import { QUARTER_PI } from '../common/constants';
import settings from '../settings';
import { skin } from '../materials';

export const createBody = (): THREE.Group => {
  const createWing = (sign: 1 | -1): THREE.ExtrudeGeometry => {
    const quadParams = (
      p1: [number, number],
      p2: [number, number]
    ): [number, number, number, number] => {
      const perp = [p1[1] - p2[1], p2[0] - p1[0]].map((n) => 0.7 * n);
      const mid = [0.5 * (p1[0] + p2[0]), 0.5 * (p1[1] + p2[1])];
      const c: [number, number] = [mid[0] + perp[0], mid[1] + perp[1]];

      return [sign * c[0], c[1], sign * p2[0], p2[1]];
    };

    const bladeStartX = 0.83;
    const bladeStartY = -1.2;
    const bladeEndX = 1.94;
    const bladeEndY = -0.28;
    const drop = 0.5;

    // Define the four points along the bottom of the wing (outside to inside: a, b, c, d)
    const a: [number, number] = [bladeEndX, bladeEndY];
    const b: [number, number] = [bladeEndX, -0.9];
    const c: [number, number] = [1.4, -1.4];
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

    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  };

  // Body

  const bodyEllipsoid = createEllipsoid(0.75, 1.8, 0.5).translate(0, -1.3, 0);

  const nsfw = (group: THREE.Group) => {
    const params: [number, number, number] = [0.35, -1.4, 0.5];

    const leftBreast = createEllipsoid(0.25, 0.25, 0.25).translate(
      -params[0],
      params[1],
      params[2]
    );

    const rightBreast = createEllipsoid(0.25, 0.25, 0.25).translate(
      params[0],
      params[1],
      params[2]
    );

    const height = 1;
    const rotation = QUARTER_PI;
    const translation: [number, number, number] = [0, -1.9, 1.05];

    const cylinder = createCylinder(0.1, height)
      .translate(0, -height / 2, 0)
      .rotateX(rotation)
      .translate(...translation);

    const sphere = createEllipsoid(0.13, 0.13, 0.13)
      .rotateX(rotation)
      .translate(...translation);

    return group
      .add(new THREE.Mesh(leftBreast, skin))
      .add(new THREE.Mesh(rightBreast, skin))
      .add(new THREE.Mesh(cylinder, skin))
      .add(new THREE.Mesh(sphere, skin));
  };

  const bodyGroup = new THREE.Group().add(new THREE.Mesh(bodyEllipsoid, skin));

  if (settings.nsfw) {
    nsfw(bodyGroup);
  }

  // Combine

  return bodyGroup
    .add(new THREE.Mesh(createWing(1), skin))
    .add(new THREE.Mesh(createWing(-1), skin));
};
