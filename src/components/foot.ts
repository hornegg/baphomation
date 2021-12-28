/* eslint-disable functional/no-expression-statement */
import * as THREE from 'three';
import { AnimationLoopComponent } from './AnimationLoopComponent';

interface FootProps {
  footAngle: number;
  footGeometry: THREE.BufferGeometry;
  skin: THREE.Material;
}

export const createFootComponent = (): AnimationLoopComponent<FootProps> => {
  return (props: FootProps) => {
    const group = new THREE.Group();
    group.setRotationFromEuler(new THREE.Euler(0, props.footAngle, 0));
    group.add(new THREE.Mesh(props.footGeometry, props.skin));
    return group;
  };
};
