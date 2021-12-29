import * as THREE from 'three';

const createSphere = (radius: number): THREE.BufferGeometry => {
  const sphereSegments = 24;
  return new THREE.SphereGeometry(radius, sphereSegments, sphereSegments);
};

export const createEllipsoid = (
  x: number,
  y: number,
  z: number
): THREE.BufferGeometry => {
  return createSphere(1).applyMatrix4(new THREE.Matrix4().makeScale(x, y, z));
};

export const createCylinder = (
  radius: number,
  height: number
): THREE.BufferGeometry => {
  const radialSegments = 24;
  return new THREE.CylinderGeometry(radius, radius, height, radialSegments);
};
