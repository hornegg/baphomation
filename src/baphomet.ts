import * as THREE from 'three';
import { AnimationLoopComponent } from './common';
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
  outlineBodyGeometry: THREE.BufferGeometry;
  leftFootGeometry: THREE.BufferGeometry;
  outlineLeftFootGeometry: THREE.BufferGeometry;
  leftFootAngle: number;
  rightFootGeometry: THREE.BufferGeometry;
  outlineRightFootGeometry: THREE.BufferGeometry;
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
      outlineBodyGeometry,
      leftFootGeometry,
      outlineLeftFootGeometry,
      leftFootAngle,
      rightFootGeometry,
      outlineRightFootGeometry,
      rightFootAngle,
      skin,
    }: BaphometProps) =>
      new THREE.Group()
        .add(
          body({
            bodyAngle,
            head,
            bodyGeometry,
            outlineBodyGeometry,
            skin,
            watchTowerFrame,
          })
        )
        .add(
          leftFoot({
            footAngle: leftFootAngle,
            footGeometry: leftFootGeometry,
            outlineFootGeometry: outlineLeftFootGeometry,
            skin,
          })
        )
        .add(
          rightFoot({
            footAngle: rightFootAngle,
            footGeometry: rightFootGeometry,
            outlineFootGeometry: outlineRightFootGeometry,
            skin,
          })
        );
  };
