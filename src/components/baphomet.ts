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
  leftFootGeometry: THREE.BufferGeometry;
  leftFootAngle: number;
  rightFootGeometry: THREE.BufferGeometry;
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
      leftFootGeometry,
      leftFootAngle,
      rightFootGeometry,
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
            footGeometry: leftFootGeometry,
            skin,
          })
        )
        .add(
          rightFoot({
            footAngle: rightFootAngle,
            footGeometry: rightFootGeometry,
            skin,
          })
        );
  };
