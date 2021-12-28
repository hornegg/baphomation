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
});
