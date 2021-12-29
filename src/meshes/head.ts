import * as THREE from 'three';
import { createEllipsoid } from '../common/geometry';
import { skin } from '../materials';

export const createHead = (): THREE.Group => {
  const head = createEllipsoid(1.5, 1.0, 1.0);

  // vector between center of head and center of ear
  const x = 1.44;
  const y = 0.6;
  const z = -0.3;

  const earParams: [number, number, number] = [0.4, 0.4, 0.25];
  const leftEar = createEllipsoid(...earParams).translate(x, y, z);
  const rightEar = createEllipsoid(...earParams).translate(-x, y, z);

  return new THREE.Group()
    .add(new THREE.Mesh(head, skin))
    .add(new THREE.Mesh(leftEar, skin))
    .add(new THREE.Mesh(rightEar, skin));
};
