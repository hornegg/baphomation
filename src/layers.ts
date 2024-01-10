import * as THREE from 'three';

export enum Layer {
  main, // second (middle) layer
  flamesBehind, // first (bottom) layer
  flamesInfront, // fourth (top) layer
}

export const setLayerRecursive = (obj: THREE.Object3D, layer: Layer): void => {
  obj.layers.set(layer);
  obj.children.forEach((child) => setLayerRecursive(child, layer));
};
