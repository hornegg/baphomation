import * as THREE from 'three';

import { altarMaterial, floorMaterial } from '../materials';
import { floorLevel } from '../floorLevel';

const createBox = (
  width: number,
  height: number,
  depth: number,
  material: THREE.Material,
): THREE.Group => {
  const group = new THREE.Group().add(
    new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material),
  );

  return group;
};

const floorThickness = 0.1;
const floor = createBox(5, floorThickness, 5, floorMaterial);
floor.position.set(0, floorLevel - floorThickness - floorThickness, 0);

const altarHeight = 1.25;
const altar = createBox(0.7, altarHeight, 1.25, altarMaterial);
altar.position.set(-2.2, floorLevel + (0.5 * altarHeight) + floorThickness, 0);

export const room = (): THREE.Group => new THREE.Group().add(floor).add(altar);
