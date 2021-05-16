/* eslint-disable immutable/no-let */
/* eslint-disable functional/no-expression-statement */
import * as PostProcessing from 'postprocessing';
import * as THREE from 'three';

import {
  AnimationLoopComponent,
  HALF_PI,
  Layer,
  loadGeometry,
  watchTowerLength,
} from './common';

import { choreographBody, pentagramLength } from './choreograph';

import { createPentagram, PentagramProps } from './pentagram';

import { createBaphometComponent } from './baphomet';
import { createFrameCaptureComponent } from './frameCapture';
import { createHead } from './head';
import getCameraPosition from './getCameraPosition';
import { MainState } from './mainState';
import { room } from './room';
import settings from './settings';

const skin = new THREE.MeshBasicMaterial({
  color: 0x444444,
  side: THREE.DoubleSide,
});

Promise.all([
  createHead(skin),
  loadGeometry('bodyGeometry.json'),
  loadGeometry('outlineBodyGeometry.json'),
  loadGeometry('leftFootGeometry.json'),
  loadGeometry('outlineLeftFootGeometry.json'),
  loadGeometry('rightFootGeometry.json'),
  loadGeometry('outlineRightFootGeometry.json'),
]).then(
  ([
    head,
    bodyGeometry,
    outlineBodyGeometry,
    leftFootGeometry,
    outlineLeftFootGeometry,
    rightFootGeometry,
    outlineRightFootGeometry,
  ]) => {
    const pentagrams = [
      createPentagram(),
      createPentagram(),
      createPentagram(),
      createPentagram(),
    ];

    const baphomet = createBaphometComponent();
    const frameCapture = createFrameCaptureComponent();

    const main = (state: MainState) => {
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

        return group;
      });

      const mainGroup = new THREE.Group();

      mainGroup.add(
          baphomet({
            watchTowerFrame,
            bodyAngle: state.bodyAngle,
            head,
            bodyGeometry,
            outlineBodyGeometry,
            leftFootGeometry,
            outlineLeftFootGeometry,
            leftFootAngle: state.leftFootAngle,
            rightFootGeometry,
            outlineRightFootGeometry,
            rightFootAngle: state.rightFootAngle,
            skin,
          })
        );

      positionedPentagrams.forEach((pp) => mainGroup.add(pp));

      mainGroup.add(room());

      return mainGroup;
    };

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(75, 1.2, 0.1, 1000);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(settings.width, settings.height);

    const composer = new PostProcessing.EffectComposer(renderer);
    composer.addPass(new PostProcessing.RenderPass(scene, camera));

    document.body.appendChild(renderer.domElement);

    let state = choreographBody(0);

    renderer.setAnimationLoop(() => {
      const [x, y, z] = getCameraPosition(state.frame).toArray();
      const yAdjust = 0.4;
      camera.position.set(x, y + yAdjust, z);
      camera.lookAt(0, -0.6 + yAdjust, 0);

      scene.clear();


      scene.add(main(state));

      scene.background = new THREE.Color('white');
      camera.layers.set(0);
      renderer.render(scene, camera);

      scene.background = null;
      camera.layers.set(Layer.face);
      renderer.render(scene, camera);

      if (settings.frameCapture) {
        frameCapture({
          startFrame: 0,
          endFrame: settings.cycleLength,
          filename: 'frames.zip',
          getCanvas: () => document.getElementsByTagName('canvas')[0],
        });
      }

      state = choreographBody(state.frame + 1);
    });
  }
);
