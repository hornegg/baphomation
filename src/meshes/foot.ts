import * as THREE from 'three';
import { createParametricEllipsoidMesh } from '../common/parametricEllipsoid';
import { floorLevel } from '../floorLevel';

export const createFoot = (left: boolean, skin: THREE.Material): THREE.Mesh => {
  const radius = 0.5;

  const footRatio = 1.75;
  const footCenterX = left ? -0.85 : 0.85;

  const z = 0;

  return createParametricEllipsoidMesh(
    new THREE.Vector3(footCenterX, floorLevel, z + (footRatio * radius)),
    new THREE.Vector3(footCenterX, floorLevel, z - (footRatio * radius)),
    radius,
    skin,
  );
};
