/* eslint-disable @typescript-eslint/no-explicit-any */
import '../THREE.Fire/Fire';
import '../THREE.Fire/FireShader';

import * as THREE from 'three';

const textureLoader = new THREE.TextureLoader();
const tex = textureLoader.load('./THREE.Fire/Fire.png');

export interface Fire extends THREE.Object3D {
  update(time: number): void;
  material: any;
}

export const createFire = (): Fire => new (THREE as any).Fire(tex);
