/* eslint-disable functional/no-expression-statement */
import * as THREE from 'three';
import { createPentagram, PentagramProps } from './pentagram';
import { Layer, setLayerRecursive } from '../layers';
import { AnimationLoopComponent } from './AnimationLoopComponent';
import { createBaphometComponent } from './baphomet';
import { HALF_PI } from '../common/constants';
import { pentagramLength } from '../choreograph';
import { room } from '../meshes/room';
import { watchTowerLength } from '../settings';

export interface MainProps {
  head: THREE.Group;
  body: THREE.Group;
}

export interface MainState {
  frame: number;
  bodyAngle: number;
  leftFootAngle: number;
  rightFootAngle: number;
  layerInfo: { topFlames: boolean; baphomet: boolean; bottomFlames: boolean };
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
        leftFootAngle: state.leftFootAngle,
        rightFootAngle: state.rightFootAngle,
      })
    );

    positionedPentagrams.forEach((pp) => mainGroup.add(pp));

    mainGroup.add(room());

    return mainGroup;
  };
};
