import * as THREE from 'three';

import { linearMap, segmentedMap, TWO_PI } from '../common';

const parametricEllipsoid = (
  start: THREE.Vector3,
  end: THREE.Vector3,
  maxGirth: number
) => {
  const vec = end.clone().sub(start);
  const crossx = new THREE.Vector3(1, 0, 0).cross(vec);
  const crossy = new THREE.Vector3(0, 1, 0).cross(vec);
  // If v is zero-length, we'll end up drawing everything at a single point, which is correct.
  // Otherwise the larger of these two cross products is guaranteed to be perpendicular.
  // The smaller one might be zero-length as a consequence of taking the cross product of two parallel vectors.
  const perp1 =
    crossx.lengthSq() > crossy.lengthSq()
      ? crossx.normalize()
      : crossy.normalize();
  // Now find one that is perpendicular to both the original vector and the first perpendicular
  const perp2 = perp1.clone().cross(vec).normalize();

  return (u: number, v: number, dest: THREE.Vector3) => {
    const u2 = segmentedMap(u, [0, 0.5, 1], [1, 0, 1]);
    const girth = maxGirth * Math.sqrt(1 - (u2 * u2));
    const angle = linearMap(v, 0, 1, 0, TWO_PI);
    const component1 = perp1.clone().multiplyScalar(girth * Math.cos(angle));
    const component2 = perp2.clone().multiplyScalar(girth * Math.sin(angle));

    // eslint-disable-next-line functional/no-expression-statement
    dest
      .set(
        linearMap(u, 0, 1, start.x, end.x),
        linearMap(u, 0, 1, start.y, end.y),
        linearMap(u, 0, 1, start.z, end.z)
      )
      .add(component1)
      .add(component2);
  };
};

const createParametricEllipsoidMesh = (
  start: THREE.Vector3,
  end: THREE.Vector3,
  maxGirth: number,
  material: THREE.Material
) => {
  const group = new THREE.Group().add(
    new THREE.Mesh(
      new THREE.ParametricGeometry(
        parametricEllipsoid(start, end, maxGirth),
        20,
        20
      ),
      material
    )
  );

  return group;
};

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
