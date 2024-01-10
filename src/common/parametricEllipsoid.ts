import * as THREE from 'three';
import { linearMap, segmentedMap } from '../common/maps';
import { ParametricGeometry } from 'three/examples/jsm/geometries/ParametricGeometry';
import { TWO_PI } from '../common/constants';

const parametricEllipsoid = ({
  start,
  end,
  maxGirth,
  minZ,
}: {
  start: THREE.Vector3;
  end: THREE.Vector3;
  maxGirth: number;
  minZ?: number;
}) => {
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

    dest
      .set(
        linearMap(u, 0, 1, start.x, end.x),
        linearMap(u, 0, 1, start.y, end.y),
        Math.max(
          linearMap(u, 0, 1, start.z, end.z),
          minZ ?? Number.MIN_SAFE_INTEGER,
        ),
      )
      .add(component1)
      .add(component2);
  };
};

export const createParametricEllipsoidMesh = (
  start: THREE.Vector3,
  end: THREE.Vector3,
  maxGirth: number,
  material: THREE.Material,
): THREE.Mesh =>
  new THREE.Mesh(
    new ParametricGeometry(
      parametricEllipsoid({ start, end, maxGirth }),
      20,
      20,
    ),
    material,
  );
