import * as THREE from 'three';
const ThreeBSP = require('three-js-csg')(THREE);
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import FrameTimingTool from './FrameTimingTool';

const createSphere = (radius: number): THREE.Geometry => {
  const sphereSegments = 32;
  return new THREE.SphereGeometry(radius, sphereSegments, sphereSegments);
};

const createEllipsoid = (x: number, y: number, z: number, scalar: number): THREE.Geometry => {
  return createSphere(1).applyMatrix4(new THREE.Matrix4().makeScale(x + scalar, y + scalar, z + scalar));
};

const createHeadGeometry = (outline: boolean): THREE.Geometry => {
  const scalar = outline ? 0.07 : 0;
  const head = createEllipsoid(1.5, 1.0, 1.0, scalar);

  // vector between center of head and center of ear
  const x = 1.44;
  const y = 0.6;
  const z = -0.3; 

  const leftEar = createEllipsoid(0.4, 0.4, 0.25, scalar);
  const rightEar = leftEar.clone();
  
  leftEar.translate(x, y, z);
  rightEar.translate(-x, y, z);
  
  const headBsp = new ThreeBSP(head);
  const leftEarBsp = new ThreeBSP(leftEar);
  const rightEarBsp = new ThreeBSP(rightEar);

  const leftIntersect = headBsp.intersect(leftEarBsp);
  const rightIntersect = headBsp.intersect(rightEarBsp);

  return headBsp
  .union(leftEarBsp)
  .union(rightEarBsp)
  .subtract(leftIntersect)
  .subtract(rightIntersect)
  .toGeometry();
};

const scene = new THREE.Scene();
scene.background = new THREE.Color('white');

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth - 10, window.innerHeight - 20);
document.body.appendChild( renderer.domElement );

const skin = new THREE.MeshBasicMaterial({color: 0x333333});
const outlineMaterial = new THREE.MeshBasicMaterial({color: 'black', side: THREE.BackSide});

const head = new THREE.Mesh(
  createHeadGeometry(false),
  skin
);

const headOutline = new THREE.Mesh(
  createHeadGeometry(true),
  outlineMaterial
);

scene.add(head, headOutline);

camera.position.z = 5;

const controls = new OrbitControls(camera, renderer.domElement);
controls.update();

const timingTool = new FrameTimingTool(30);

const animate = (): void => {

  setTimeout(() => {
      requestAnimationFrame( animate );
    },
    timingTool.calculateTimeToNextFrame()
  );

  controls.update();

  renderer.render(scene, camera);
};

animate();

