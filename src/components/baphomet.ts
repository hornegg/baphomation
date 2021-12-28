import * as THREE from 'three';
import { AnimationLoopComponent } from './AnimationLoopComponent';
import { createBodyComponent } from './body';
import { createFootComponent } from './foot';

const body = createBodyComponent();
const leftFoot = createFootComponent();
const rightFoot = createFootComponent();

interface BaphometProps {
  watchTowerFrame: number;
  bodyAngle: number;
  head: THREE.Group;
  bodyGeometry: THREE.BufferGeometry;
  leftFootAngle: number;
  rightFootAngle: number;
  skin: THREE.Material;
}

export const createBaphometComponent =
  (): AnimationLoopComponent<BaphometProps> => {
    return ({
      watchTowerFrame,
      bodyAngle,
      head,
      bodyGeometry,
      leftFootAngle,
      rightFootAngle,
      skin,
    }: BaphometProps) =>
      new THREE.Group()
        .add(
          body({
            bodyAngle,
            head,
            bodyGeometry,
            skin,
            watchTowerFrame,
          })
        )
        .add(
          leftFoot({
            footAngle: leftFootAngle,
            left: true,
            skin,
          })
        )
        .add(
          rightFoot({
            footAngle: rightFootAngle,
            left: false,
            skin,
          })
        );
  };
