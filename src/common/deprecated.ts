import * as THREE from 'three';
import { BufferGeometry } from 'three';

export const loadGeometry = (filename: string): Promise<BufferGeometry> => {
  return new Promise((resolve, reject) => {
    // eslint-disable-next-line functional/no-expression-statement
    new THREE.BufferGeometryLoader().load(
      filename,
      (geometry) => resolve(geometry),
      null,
      (error: ErrorEvent) => reject(error)
    );
  });
};
