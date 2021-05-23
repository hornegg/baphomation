/* eslint-disable immutable/no-let */
/* eslint-disable functional/no-expression-statement */
import * as THREE from 'three';

import { Layer, loadGeometry } from './common';

import { choreographBody } from './choreograph';
import { createFrameCaptureComponent } from './frameCapture';
import { createHead } from './head';
import { createMainComponent } from './main';
import getCameraPosition from './getCameraPosition';
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
    const main = createMainComponent({
      head,
      bodyGeometry,
      outlineBodyGeometry,
      leftFootGeometry,
      outlineLeftFootGeometry,
      rightFootGeometry,
      outlineRightFootGeometry,
      skin,
    });

    const frameCapture = createFrameCaptureComponent();

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(75, 1.2, 0.1, 1000);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(settings.width, settings.height);
    renderer.autoClear = false;

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
      camera.layers.set(Layer.flamesBehind);
      renderer.render(scene, camera);

      scene.background = null;
      camera.layers.set(Layer.shapes);
      renderer.render(scene, camera);

      camera.layers.set(Layer.face);
      renderer.render(scene, camera);

      camera.layers.set(Layer.flamesInfront);
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
