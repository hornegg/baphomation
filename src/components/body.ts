/* eslint-disable functional/no-expression-statement */
import * as THREE from 'three';
import { choreographArm, stillArm } from '../choreograph';
import { skin, Surface } from '../materials';
import { AnimationLoopComponent } from './AnimationLoopComponent';
import { arm } from '../meshes/arm';

interface BodyProps {
  bodyAngle: number;
  head: THREE.Group;
  body: THREE.Group;
  watchTowerFrame: number;
}

export const createBodyComponent = (): AnimationLoopComponent<BodyProps> => {
  return (props: BodyProps) => {
    const group = new THREE.Group();
    group.setRotationFromEuler(new THREE.Euler(0, props.bodyAngle, 0));
    group
      .add(props.head)
      .add(props.body)
      .add(arm({ sign: 1, pointAt: stillArm, skin: skin(Surface.leftArm) }))
      .add(
        arm({
          sign: -1,
          pointAt: choreographArm(props.watchTowerFrame),
          skin: skin(Surface.rightArm),
        })
      );
    return group;
  };
};
