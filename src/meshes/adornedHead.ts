import * as THREE from 'three';
import { blackMaterial, redMaterial, skin, Surface } from '../materials';
import { ellipticalToCartesian, headHeight } from '../headHelpers';
import { HALF_PI, PI, TWO_PI } from '../common/constants';
import { createFace } from './face';
import { createHead } from './head';
import { linearMap } from '../common/maps';
import { ParametricGeometry } from 'three/examples/jsm/geometries/ParametricGeometry';

export const createAdornedHead = (): THREE.Group => {
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

  const createHorn = (param: HornParameters): THREE.BufferGeometry => {
    const openHorn = (u: number, v: number, vec: THREE.Vector3): void => {
      const width = param.maxWidth * (1 - u);
      const depth = param.maxDepth * (1 - u);
      const angle = TWO_PI * v;

      ellipticalToCartesian(
        1 + (param.length * u),
        param.theta + (width * Math.sin(angle)),
        param.phi + (depth * Math.cos(angle)),
        vec,
      );

      vec = vec.applyAxisAngle(
        new THREE.Vector3(0, 0, 1),
        param.bend * param.length * u,
      );
    };

    const horn = new ParametricGeometry(openHorn, 10, 10);

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

  const leftHorn = new THREE.Mesh(createHorn(horn), skin(Surface.leftHorn));

  const rightHorn = new THREE.Mesh(
    createHorn({
      ...horn,
      phi: (3 / 8) * PI,
      bend: -horn.bend,
    }),
    skin(Surface.rightHorn),
  );

  const hornGroup = new THREE.Group().add(leftHorn).add(rightHorn);

  //
  // Antenna
  //

  const createAntenna = (
    beginning: THREE.Vector3,
    middle: THREE.Vector3,
    end: THREE.Vector3,
    width: number,
  ) => {
    const tubePath = new THREE.Curve<THREE.Vector3>();
    tubePath.getPoint = (t): THREE.Vector3 => {
      if (t < 0.5) {
        return new THREE.Vector3(
          linearMap(t, 0, 0.5, beginning.x, middle.x),
          linearMap(t, 0, 0.5, beginning.y, middle.y),
          linearMap(t, 0, 0.5, beginning.z, middle.z),
        );
      } else {
        return new THREE.Vector3(
          linearMap(t, 0.5, 1, middle.x, end.x),
          linearMap(t, 0.5, 1, middle.y, end.y),
          linearMap(t, 0.5, 1, middle.z, end.z),
        );
      }
    };

    return new THREE.TubeGeometry(tubePath, 20, width).clone();
  };

  const antennaPosition = new THREE.Vector3(1, headHeight + 0.8, 0);
  const antennaSize = 0.2;

  const antennaPole = createAntenna(
    new THREE.Vector3(0, headHeight, 0),
    new THREE.Vector3(0.3, headHeight + 1, 0),
    antennaPosition,
    0.05,
  );

  const antennaDot = new THREE.SphereGeometry(antennaSize, 12, 12).translate(
    antennaPosition.x,
    antennaPosition.y,
    antennaPosition.z,
  );

  const antenna = new THREE.Group()
    .add(new THREE.Mesh(antennaPole, blackMaterial(Surface.skip)))
    .add(new THREE.Mesh(antennaDot, redMaterial(Surface.skip)));

  //
  // Create the face then return the finished head
  //

  const head = new THREE.Group()
    .add(createHead())
    .add(hornGroup)
    .add(antenna)
    .add(createFace());

  return head;
};
