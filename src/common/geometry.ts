import * as THREE from 'three';

const createSphere = (radius: number): THREE.Geometry => {
  const sphereSegments = 24;
  return new THREE.SphereGeometry(radius, sphereSegments, sphereSegments);
};

export const createEllipsoid = (
  x: number,
  y: number,
  z: number
): THREE.Geometry => {
  return createSphere(1).applyMatrix4(new THREE.Matrix4().makeScale(x, y, z));
};

export const createCylinder = (
  radius: number,
  height: number
): THREE.Geometry => {
  const radialSegments = 24;
  return new THREE.CylinderGeometry(radius, radius, height, radialSegments);
};
