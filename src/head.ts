import * as THREE from 'three';

import {
  createArc,
  ellipticalToCartesian,
  HALF_PI,
  headHeight,
  linearMap,
  loadGeometry,
  outlineMaterial,
  outlineMaterialDouble,
  PI,
  redMaterial,
  TWO_PI,
} from './common';

import { createFace } from './face';

export const createHead = async (
  skin: THREE.Material
): Promise<THREE.Group> => {
  //
  // Horns
  //

  interface HornParameters {
    theta: number;
    phi: number;
    maxWidth: number;
    maxDepth: number;
    length: number;
    bend: number;
  }

  const createHorn = (param: HornParameters): THREE.Geometry => {
    const openHorn = (u: number, v: number, vec: THREE.Vector3): void => {
      const width = param.maxWidth * (1 - u);
      const depth = param.maxDepth * (1 - u);
      const angle = TWO_PI * v;

      // eslint-disable-next-line functional/no-expression-statement
      ellipticalToCartesian(
        1 + (param.length * u),
        param.theta + (width * Math.sin(angle)),
        param.phi + (depth * Math.cos(angle)),
        vec
      );

      // eslint-disable-next-line functional/no-expression-statement
      vec = vec.applyAxisAngle(
        new THREE.Vector3(0, 0, 1),
        param.bend * param.length * u
      );
    };

    const horn = new THREE.ParametricGeometry(openHorn, 10, 10);

    return horn;
  };

  const horn = {
    theta: HALF_PI,
    phi: (5 / 8) * PI,
    maxWidth: 0.15,
    maxDepth: 0.1,
    length: 1,
    bend: 0.2,
  };

  const om = 1.4; // Outline multiplier

  const hornOutline = {
    ...horn,
    maxWidth: horn.maxWidth * om,
    maxDepth: horn.maxDepth * om,
    length: 1.2,
  };

  const leftHorn = new THREE.Mesh(createHorn(horn), skin);

  const leftHornOutline = new THREE.Mesh(
    createHorn(hornOutline),
    outlineMaterial
  );

  const rightHorn = new THREE.Mesh(
    createHorn({
      ...horn,
      phi: (3 / 8) * PI,
      bend: -horn.bend,
    }),
    skin
  );

  const rightHornOutline = new THREE.Mesh(
    createHorn({
      ...hornOutline,
      phi: (3 / 8) * PI,
      bend: -horn.bend,
    }),
    outlineMaterial
  );

  const hornRing = {
    centerTheta: horn.theta,
    centerPhi: horn.phi,
    thetaRadius: horn.maxWidth,
    phiRadius: horn.maxDepth,
    tubeRadius: 0.07,
    startAngle: 0,
    finishAngle: TWO_PI,
  };

  const hornGroup = new THREE.Group()
    .add(leftHorn)
    .add(leftHornOutline)
    .add(rightHorn)
    .add(rightHornOutline)
    .add(new THREE.Mesh(createArc(hornRing), outlineMaterialDouble))
    .add(
      new THREE.Mesh(
        createArc({
          ...hornRing,
          centerPhi: (3 / 8) * PI,
        }),
        outlineMaterialDouble
      )
    );

  //
  // Antenna
  //

  const createAntenna = (
    beginning: THREE.Vector3,
    middle: THREE.Vector3,
    end: THREE.Vector3,
    width: number
  ): THREE.TubeGeometry => {
    class Tube extends THREE.Curve<THREE.Vector3> {
      getPoint(t): THREE.Vector3 {
        if (t < 0.5) {
          return new THREE.Vector3(
            linearMap(t, 0, 0.5, beginning.x, middle.x),
            linearMap(t, 0, 0.5, beginning.y, middle.y),
            linearMap(t, 0, 0.5, beginning.z, middle.z)
          );
        } else {
          return new THREE.Vector3(
            linearMap(t, 0.5, 1, middle.x, end.x),
            linearMap(t, 0.5, 1, middle.y, end.y),
            linearMap(t, 0.5, 1, middle.z, end.z)
          );
        }
      }
    }

    return new THREE.TubeGeometry(new Tube(), 20, width);
  };

  const antennaPosition = new THREE.Vector3(1, headHeight + 0.8, 0);
  const antennaSize = 0.2;

  const antennaPole = createAntenna(
    new THREE.Vector3(0, headHeight, 0),
    new THREE.Vector3(0.3, headHeight + 1, 0),
    antennaPosition,
    0.05
  );

  const antennaDot = new THREE.SphereGeometry(antennaSize, 12, 12).translate(
    antennaPosition.x,
    antennaPosition.y,
    antennaPosition.z
  );

  const antennaOutline = new THREE.SphereGeometry(
    antennaSize * om,
    12,
    12
  ).translate(antennaPosition.x, antennaPosition.y, antennaPosition.z);

  const antenna = new THREE.Group()
    .add(new THREE.Mesh(antennaPole, outlineMaterialDouble))
    .add(new THREE.Mesh(antennaDot, redMaterial))
    .add(new THREE.Mesh(antennaOutline, outlineMaterial));

  //
  // Create the face then return the finished head
  //

  const headMesh = new THREE.Mesh(
    await loadGeometry('headGeometry.json'),
    skin
  );

  const head = new THREE.Group()
    .add(headMesh)
    .add(
      new THREE.Mesh(
        await loadGeometry('outlineHeadGeometry.json'),
        outlineMaterial
      )
    )
    .add(hornGroup)
    .add(antenna)
    .add(createFace(headMesh));

  return head;
};
