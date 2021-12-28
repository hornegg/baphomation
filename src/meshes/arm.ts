import * as THREE from 'three';
import { createParametricEllipsoidMesh } from '../common/parametricEllipsoid';

const girth = 0.25;
const length = 1.2;

class ArmProps {
  pointAt: THREE.Vector3;
  sign: 1 | -1;
  skin: THREE.Material;
}

export const arm = (props: ArmProps): THREE.Object3D => {
  const start = new THREE.Vector3(props.sign * 0.8, -1.3, 0.4);

  const end: THREE.Vector3 = props.pointAt
    .clone()
    .sub(start)
    .normalize()
    .multiplyScalar(length)
    .add(start);

  return createParametricEllipsoidMesh(start, end, girth, props.skin);
};
