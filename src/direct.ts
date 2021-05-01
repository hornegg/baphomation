/* eslint-disable functional/no-expression-statement */
import * as THREE from 'three';

import {
  HALF_PI,
  linearMap,
  loadGeometry,
  outlineMaterial,
  QUARTER_PI,
  segmentedMap,
  skin,
} from './common';

import { createHead } from './head';

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

const bodyGroup = new THREE.Group();
const leftFootGroup = new THREE.Group();
const rightFootGroup = new THREE.Group();

const capture = captureCount
  ? null //new FrameCapture(captureOffset, captureCount, canvas)
  : null;

//
// Add the head
//

createHead().then((head) => {
  bodyGroup.add(head);
});

//
// Body
//

const addMesh = async (
  geometryFile: string,
  material: THREE.Material,
  parent: THREE.Object3D
) => {
  const geometry = await loadGeometry(geometryFile);

  const mesh = new THREE.Mesh(geometry, material);

  parent.add(mesh);
};

addMesh('bodyGeometry.json', skin, bodyGroup);
addMesh('outlineBodyGeometry.json', outlineMaterial, bodyGroup);
addMesh('leftFootGeometry.json', skin, leftFootGroup);
addMesh('outlineLeftFootGeometry.json', outlineMaterial, leftFootGroup);
addMesh('rightFootGeometry.json', skin, rightFootGroup);
addMesh('outlineRightFootGeometry.json', outlineMaterial, rightFootGroup);

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
  const midStepLength = linearMap(0.5, 0, 1, pentagramLength, watchTowerLength);

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

const nextAnimateFunction = (frame: number) => {
  return () => {
    animate(frame + 1);
  };
};

const animate = (frame): void => {
  setTimeout(() => {
    requestAnimationFrame(nextAnimateFunction(frame));
  });

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
};

nextAnimateFunction(0)();
