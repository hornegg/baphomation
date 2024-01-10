import * as THREE from 'three';
import { AnimationLoopComponent } from './AnimationLoopComponent';
import { createFoot } from '../meshes/foot';

interface FootProps {
  footAngle: number;
  left: boolean;
  skin: THREE.Material;
}

export const createFootComponent = (): AnimationLoopComponent<FootProps> => {
  return (props: FootProps) => {
    const group = new THREE.Group();
    group.setRotationFromEuler(new THREE.Euler(0, props.footAngle, 0));
    group.add(createFoot(props.left, props.skin));
    return group;
  };
};
