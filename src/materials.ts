import * as THREE from 'three';

const skinColor = 0x777777;

const r0 = -0x010000;
const r1 = 0;

const g0 = -0x000100;
const g1 = 0;
const g2 = 0x000100;

const b0 = -0x000001;
const b1 = 0;
const b2 = 0x000001;

export enum Surface {
  body = skinColor + r0 + g0 + b0,
  leftFoot = skinColor  + r0 + g0 + b1,
  rightFoot = skinColor  + r0 + g0 + b2,
  sphere = skinColor  + r0 + g1 + b0,
  cylinder = skinColor  + r0 + g1 + b1,
  leftBreast =skinColor  + r0 + g1 + b2,
  rightBreast = skinColor  + r0 + g2 + b0,
  leftWing = skinColor  + r0 + g2 + b1,
  rightWing = skinColor  + r0 + g2 + b2,
  leftArm = skinColor  + r1 + g0 + b0,
  rightArm = skinColor  + r1 + g0 + b1,
  head = skinColor  + r1 + g0 + b2,
  leftEar = skinColor  + r1 + g1 + b0,
  rightEar = skinColor  + r1 + g1 + b1,
  leftHorn = skinColor  + r1 + g1 + b2,
  rightHorn = skinColor  + r1 + g2 + b0,
}

export const blackMaterial = () =>
  new THREE.MeshBasicMaterial({
    color: 'black',
    side: THREE.DoubleSide,
  });

export const redMaterial = () =>
  new THREE.MeshBasicMaterial({
    color: 'red',
    side: THREE.DoubleSide,
  });

export const skin = (surface: Surface) =>
  new THREE.MeshBasicMaterial({
    color: surface,
    side: THREE.DoubleSide,
  });

export const floorMaterial = new THREE.MeshBasicMaterial({
  color: 0xdddddd,
  side: THREE.DoubleSide,
});

export const altarMaterial = new THREE.MeshBasicMaterial({
  color: 0xbbbbbb,
  side: THREE.DoubleSide,
});
