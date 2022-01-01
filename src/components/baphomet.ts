import * as THREE from 'three';
import { skin, Surface } from '../materials';
import { AnimationLoopComponent } from './AnimationLoopComponent';
import { createBodyComponent } from './body';
import { createFootComponent } from './foot';

const bodyComponent = createBodyComponent();
const leftFoot = createFootComponent();
const rightFoot = createFootComponent();

interface BaphometProps {
  watchTowerFrame: number;
  bodyAngle: number;
  head: THREE.Group;
  body: THREE.Group;
  leftFootAngle: number;
  rightFootAngle: number;
}

export const createBaphometComponent =
  (): AnimationLoopComponent<BaphometProps> => {
    return ({
      watchTowerFrame,
      bodyAngle,
      head,
      body,
      leftFootAngle,
      rightFootAngle,
    }: BaphometProps) =>
      new THREE.Group()
        .add(
          bodyComponent({
            bodyAngle,
            head,
            body,
            watchTowerFrame,
          })
        )
        .add(
          leftFoot({
            footAngle: leftFootAngle,
            left: true,
            skin: skin(Surface.leftFoot),
          })
        )
        .add(
          rightFoot({
            footAngle: rightFootAngle,
            left: false,
            skin: skin(Surface.rightFoot),
          })
        );
  };
