/* eslint-disable functional/no-expression-statement */
import * as THREE from 'three';
import { AnimationLoopComponent, outlineMaterial } from './common';
import { choreographArm, stillArm } from './choreograph';
import { arm } from './arm';

interface BodyProps {
  bodyAngle: number;
  head: THREE.Group;
  bodyGeometry: THREE.BufferGeometry;
  outlineBodyGeometry: THREE.BufferGeometry;
  skin: THREE.Material;
  watchTowerFrame: number;
}

export const createBodyComponent = (): AnimationLoopComponent<BodyProps> => {
  return (props: BodyProps) => {
    const group = new THREE.Group();
    group.setRotationFromEuler(new THREE.Euler(0, props.bodyAngle, 0));
    group
      .add(props.head)
      .add(new THREE.Mesh(props.bodyGeometry, props.skin))
      .add(new THREE.Mesh(props.outlineBodyGeometry, outlineMaterial))
      .add(arm({ sign: 1, pointAt: stillArm, skin: props.skin }))
      .add(
        arm({
          sign: -1,
          pointAt: choreographArm(props.watchTowerFrame),
          skin: props.skin,
        })
      );
    return group;
  };
};
