/* eslint-disable functional/no-expression-statement */
import * as THREE from 'three';

import {
  blackMaterial,
  createArc,
  createTube,
  Layer,
  linearMap,
  redMaterial,
  setLayerRecursive,
} from './common';
import settings from './settings';

const PI = Math.PI;
const TWO_PI = 2 * PI;
const HALF_PI = 0.5 * PI;
const FIFTH_TAU = TWO_PI / 5;

export const createFace = (): THREE.Group => {
  //
  // Forehead pentagram
  //

  const vertices = settings.invertPentagrams
    ? [0, 1, 2, 3, 4]
    : [0.5, 1.5, 2.5, 3.4, 4.5];

  const foreheadGroup = new THREE.Group().add(
    ...vertices
      .map((_v) => {
        const theta = 0.75;
        const phi = HALF_PI;
        const r = 0.3;
        const v = _v + 0.5;
        const u = v + 2;

        return createTube({
          thetaStart: theta + (r * Math.cos(v * FIFTH_TAU)),
          phiStart: phi + (r * Math.sin(v * FIFTH_TAU)),
          thetaEnd: theta + (r * Math.cos(u * FIFTH_TAU)),
          phiEnd: phi + (r * Math.sin(u * FIFTH_TAU)),
          radius: 0.02,
        });
      })
      .map((geom) => new THREE.Mesh(geom, blackMaterial))
  );

  //
  // Eyes
  //

  const lid = {
    thetaStart: 0.8,
    phiStart: 0.9,
    thetaEnd: 0.3,
    phiEnd: 0.9,
    radius: 0.04,
  };

  const centerTheta = linearMap(1, 0, 2, lid.thetaStart, lid.thetaEnd);
  const centerPhi = linearMap(1, 0, 2, lid.phiStart, lid.phiEnd);

  const topLidRight = createTube(lid);

  const bottomLidRight = createArc({
    centerTheta,
    centerPhi,
    thetaRadius: 0.22,
    phiRadius: 0.33,
    tubeRadius: lid.radius,
    startAngle: PI,
    finishAngle: TWO_PI,
  });

  const eyeballRight = createTube({
    thetaStart: centerTheta - 0.05,
    phiStart: centerPhi - 0.05,
    thetaEnd: centerTheta + 0.05,
    phiEnd: centerPhi - 0.2,
    radius: lid.radius * 0.8,
  });

  const topLidLeft = topLidRight.clone().scale(-1, 1, 1);
  const bottomLidLeft = bottomLidRight.clone().scale(-1, 1, 1);
  const eyeballLeft = eyeballRight.clone().scale(-1, 1, 1);

  const eyesGroup = new THREE.Group()
    .add(
      ...[topLidLeft, topLidRight, bottomLidLeft, bottomLidRight].map(
        (geom) => new THREE.Mesh(geom, blackMaterial)
      )
    )
    .add(
      ...[eyeballLeft, eyeballRight].map(
        (geom) => new THREE.Mesh(geom, redMaterial)
      )
    );

  //
  // Nose
  //

  const thetaRadius = 0.2;
  const phiRadius = 0.5;

  const noseParams = {
    centerTheta: 0.2 + thetaRadius,
    centerPhi: -1.48 + phiRadius,
    thetaRadius,
    phiRadius,
    tubeRadius: 0.04,
    startAngle: HALF_PI + 0.9,
    finishAngle: PI + HALF_PI - 0.5,
  };

  const noseLeft = createArc(noseParams);
  const noseRight = noseLeft.clone().scale(-1, 1, 1);

  const nose = new THREE.Group().add(
    ...[noseLeft, noseRight].map(
      (geom) => new THREE.Mesh(geom, blackMaterial)
    )
  );

  //
  // Mouth
  //

  const mouth = new THREE.Mesh(
    createArc({
      centerTheta: 0,
      centerPhi: -HALF_PI,
      thetaRadius: 0.7,
      phiRadius: 0.7,
      tubeRadius: 0.04,
      startAngle: -0.9,
      finishAngle: 0.9,
    }),
    blackMaterial
  );

  const face = new THREE.Group()
    .add(foreheadGroup)
    .add(eyesGroup)
    .add(nose)
    .add(mouth);

  setLayerRecursive(face, Layer.main);

  return face;
};
