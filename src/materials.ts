import * as THREE from 'three';

export const blackMaterial = new THREE.MeshBasicMaterial({
  color: 'black',
  side: THREE.DoubleSide,
});

export const redMaterial = new THREE.MeshBasicMaterial({
  color: 'red',
  side: THREE.DoubleSide,
});

export const skin = new THREE.MeshBasicMaterial({
  color: 0x444444,
  side: THREE.DoubleSide,
  opacity: 0.5,
});

export const floorMaterial = new THREE.MeshBasicMaterial({
  color: 0xcccccc,
  side: THREE.DoubleSide,
});

export const altarMaterial = new THREE.MeshBasicMaterial({
  color: 0x888888,
  side: THREE.DoubleSide,
});
