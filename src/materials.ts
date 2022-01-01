import * as THREE from 'three';

export enum Surface {
  skip = 1,
  body,
  leftFoot,
  rightFoot,
  sphere,
  cylinder,
  leftBreast,
  rightBreast,
  leftWing,
  rightWing,
  leftArm,
  rightArm,
  head,
  leftEar,
  rightEar,
  leftHorn,
  rightHorn,
  floor,
  altar,
}

const opacity = (surface: Surface) => {
  return surface / 255;
};

export const blackMaterial = (surface: Surface) =>
  new THREE.MeshBasicMaterial({
    color: 'black',
    opacity: opacity(surface),
    side: THREE.DoubleSide,
  });

export const redMaterial = (surface: Surface) =>
  new THREE.MeshBasicMaterial({
    color: 'red',
    opacity: opacity(surface),
    side: THREE.DoubleSide,
  });

export const skin = (surface: Surface) =>
  new THREE.MeshBasicMaterial({
    color: 0x444444,
    opacity: opacity(surface),
    side: THREE.DoubleSide,
  });

export const floorMaterial = new THREE.MeshBasicMaterial({
  color: 0xcccccc,
  opacity: opacity(Surface.floor),
  side: THREE.DoubleSide,
});

export const altarMaterial = new THREE.MeshBasicMaterial({
  color: 0x888888,
  opacity: opacity(Surface.altar),
  side: THREE.DoubleSide,
});
