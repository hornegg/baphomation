/* eslint-disable functional/no-expression-statement */
import * as THREE from 'three';

import {
  HALF_PI,
  linearMap,
  loadGeometry,
  outlineMaterial,
  QUARTER_PI,
  segmentedMap,
} from './common';

import { createHead } from './head';

const skin = new THREE.MeshBasicMaterial({
  color: 0x333333,
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
    const cycleLength = 1200; // The number of frames before the animation repeats itself
    //const captureOffset = cycleLength; // The number of frames to wait before commencing with any capture
    const captureCount = 100; // Number of frames to capture.  Set to zero for no capture

    //
    // Set up the scene
    //

    const scene = new THREE.Scene();
    const sceneBehind = new THREE.Scene();

    // eslint-disable-next-line immutable/no-mutation
    sceneBehind.background = new THREE.Color('white');

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    const renderer = new THREE.WebGLRenderer({ antialias: true });

    if (captureCount) {
      renderer.setSize(800, 600);
    } else {
      renderer.setSize(window.innerWidth - 10, window.innerHeight - 20);
    }

    document.body.appendChild(renderer.domElement);
    //const canvas: HTMLCanvasElement = renderer.domElement;

    const capture = captureCount
      ? null //new FrameCapture(captureOffset, captureCount, canvas)
      : null;

    //
    // Body
    //

    const bodyGroup = new THREE.Group()
      .add(head)
      .add(new THREE.Mesh(bodyGeometry, skin))
      .add(new THREE.Mesh(outlineBodyGeometry, outlineMaterial));
    const leftFootGroup = new THREE.Group()
      .add(new THREE.Mesh(leftFootGeometry, skin))
      .add(new THREE.Mesh(outlineLeftFootGeometry, outlineMaterial));
    const rightFootGroup = new THREE.Group()
      .add(new THREE.Mesh(rightFootGeometry, skin))
      .add(new THREE.Mesh(outlineRightFootGeometry, outlineMaterial));

    scene.add(bodyGroup);
    scene.add(leftFootGroup);
    scene.add(rightFootGroup);

    /*
const pentagrams = [
  createPentagram(0, 'blueFire.png'),
  createPentagram(-HALF_PI, 'greenFire.png'),
  createPentagram(-PI, 'yellowFire.png'),
  createPentagram(-3 * HALF_PI, 'redFire.png'),
];

pentagrams[0].add(sceneBehind);
pentagrams[1].add(sceneBehind);
pentagrams[2].add(scene);
pentagrams[3].add(scene);
*/

    //
    // Choreograph
    //

    const choreograph = (frame: number) => {
      const watchTowerLength = cycleLength / 4;
      const pentagramLength = (2 * watchTowerLength) / 3;
      const midStepLength = linearMap(
        0.5,
        0,
        1,
        pentagramLength,
        watchTowerLength
      );

      const cycleFrame = frame % cycleLength;
      const watchTower = 3 - Math.floor(cycleFrame / watchTowerLength);
      const watchTowerFrame = cycleFrame % watchTowerLength;

      const bodyAngle = segmentedMap(
        watchTowerFrame,
        [pentagramLength, watchTowerLength],
        [watchTower * HALF_PI, (watchTower - 1) * HALF_PI]
      );

      const leftFootAngle = segmentedMap(
        watchTowerFrame,
        [pentagramLength, midStepLength],
        [watchTower * HALF_PI, (watchTower - 1) * HALF_PI]
      );

      const rightFootAngle = segmentedMap(
        watchTowerFrame,
        [midStepLength, watchTowerLength],
        [watchTower * HALF_PI, (watchTower - 1) * HALF_PI]
      );

      /* eslint-disable immutable/no-mutation */
      bodyGroup.rotation.y = bodyAngle;
      leftFootGroup.rotation.y = leftFootAngle;
      rightFootGroup.rotation.y = rightFootAngle;
      /* eslint-enable immutable/no-mutation */
    };

    //
    // Animate
    //

    camera.position.setFromSphericalCoords(5, HALF_PI, QUARTER_PI);

    // eslint-disable-next-line immutable/no-let
    let frame = 0;

    renderer.setAnimationLoop(() => {
      ++frame;

      choreograph(frame);

      //  pentagrams.forEach((pentagram) => pentagram.update(frame));

      /* eslint-disable immutable/no-mutation */
      renderer.autoClear = true;
      renderer.render(sceneBehind, camera);
      renderer.autoClear = false;
      renderer.render(scene, camera);
      /* eslint-enable immutable/no-mutation */

      if (capture) {
        capture.captureFrame(frame);
      }

      ++frame;
    });
  }
);
