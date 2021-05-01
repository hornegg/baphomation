import * as THREE from 'three';

import { floorLevel, outlineMaterial } from './common';

const createOutlinedBox = (
  width: number,
  height: number,
  depth: number,
  scalar: number,
  material: THREE.Material
): THREE.Group => {
  const group = new THREE.Group()
    .add(new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material))
    .add(
      new THREE.Mesh(
        new THREE.BoxGeometry(width + scalar, height + scalar, depth + scalar),
        outlineMaterial
      )
    );

  return group;
};

const floorMaterial = new THREE.MeshBasicMaterial({
  color: 0x999999,
  side: THREE.DoubleSide,
});

const altarMaterial = new THREE.MeshBasicMaterial({
  color: 0x444444,
  side: THREE.DoubleSide,
});

const floorThickness = 0.1;
const floor = createOutlinedBox(5, floorThickness, 5, 0.15, floorMaterial);
// eslint-disable-next-line functional/no-expression-statement
floor.position.set(0, floorLevel - floorThickness - floorThickness, 0);

const altarHeight = 1.25;
const altar = createOutlinedBox(0.7, altarHeight, 1.25, 0.15, altarMaterial);
// eslint-disable-next-line functional/no-expression-statement
altar.position.set(-2.2, floorLevel + (0.5 * altarHeight) + floorThickness, 0);

export const room = (): THREE.Group => new THREE.Group().add(floor).add(altar);
