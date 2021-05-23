/* eslint-disable functional/no-expression-statement */
import * as THREE from 'three';
import {
  AnimationLoopComponent,
  HALF_PI,
  Layer,
  setLayerRecursive,
  watchTowerLength,
} from './common';
import { createPentagram, PentagramProps } from './pentagram';
import { createBaphometComponent } from './baphomet';
import { pentagramLength } from './choreograph';
import { room } from './room';

export interface MainProps {
  head: THREE.Group;
  bodyGeometry: THREE.BufferGeometry;
  outlineBodyGeometry: THREE.BufferGeometry;
  leftFootGeometry: THREE.BufferGeometry;
  outlineLeftFootGeometry: THREE.BufferGeometry;
  rightFootGeometry: THREE.BufferGeometry;
  outlineRightFootGeometry: THREE.BufferGeometry;
  skin: THREE.Material;
}

export interface MainState {
  frame: number;
  bodyAngle: number;
  leftFootAngle: number;
  rightFootAngle: number;
}

const pentagrams = [
  createPentagram(),
  createPentagram(),
  createPentagram(),
  createPentagram(),
];

const baphomet = createBaphometComponent();

export const createMainComponent = (props: MainProps) => {
  return (state: MainState): THREE.Group => {
    const watchTowerFrame = state.frame % watchTowerLength;

    const positionedPentagrams = [0, 1, 2, 3].map((watchTowerIndex) => {
      const angle = -watchTowerIndex * HALF_PI;
      const position = new THREE.Vector3().setFromCylindricalCoords(
        0.5,
        angle - HALF_PI,
        0
      );
      const startFrame = watchTowerIndex * watchTowerLength;
      const endFrame = startFrame + pentagramLength;

      const pentagram: AnimationLoopComponent<PentagramProps> =
        pentagrams[watchTowerIndex];

      const group = new THREE.Group();
      group.position.set(...position.toArray());
      group.add(pentagram({ angle, startFrame, endFrame }));

      if (watchTowerIndex > 1) {
        setLayerRecursive(group, Layer.flamesBehind);
      } else {
        setLayerRecursive(group, Layer.flamesInfront);
      }

      return group;
    });

    const mainGroup = new THREE.Group();

    mainGroup.add(
      baphomet({
        ...props,
        watchTowerFrame,
        bodyAngle: state.bodyAngle,
        head: props.head,
        bodyGeometry: props.bodyGeometry,
        leftFootAngle: state.leftFootAngle,
        rightFootAngle: state.rightFootAngle,
      })
    );

    positionedPentagrams.forEach((pp) => mainGroup.add(pp));

    mainGroup.add(room());

    return mainGroup;
  };
};
