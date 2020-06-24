import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import FrameTimingTool from './FrameTimingTool';

import {
  ellipticalToCartesian, TWO_PI, HALF_PI, PI, createArc, linearMap, headHeight, skin, outlineMaterial, outlineMaterialDouble, redMaterial
} from './common';

import {createFace} from './face';

//
// Set up the scene
//

const scene = new THREE.Scene();
scene.background = new THREE.Color('white');

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth - 10, window.innerHeight - 20);
document.body.appendChild( renderer.domElement );

//
// Load the geometry
//

(new THREE.BufferGeometryLoader()).load('headGeometry.json', (geometry) => {

  const head = new THREE.Mesh(
      geometry,
      skin
    );

  scene.add(head);
});

(new THREE.BufferGeometryLoader()).load('outlineHeadGeometry.json', (geometry) => {

  const headOutline = new THREE.Mesh(
    geometry,
    outlineMaterial
  );

  scene.add(headOutline);

});

//
// Horns
//

interface HornParameters {
  theta: number;
  phi: number;
  maxWidth: number;
  maxDepth: number;
  length: number;
  bend: number;
}

const createHorn = (param: HornParameters): THREE.Geometry => {

  const openHorn = (u: number, v: number, vec: THREE.Vector3): void => {

    const width = param.maxWidth * (1 - u);
    const depth = param.maxDepth * (1 - u);
    const angle = TWO_PI * v;

    ellipticalToCartesian(
      1 + (param.length * u),
      param.theta + (width * Math.sin(angle)),
      param.phi + (depth * Math.cos(angle)),
      vec
    );

    vec = vec.applyAxisAngle(new THREE.Vector3(0, 0, 1), param.bend * param.length * u);
  }; 

  const horn = new THREE.ParametricGeometry(openHorn, 10, 10);

  return horn;
};

const horn = {
  theta: HALF_PI,
  phi: (5/8) * PI,
  maxWidth: 0.15,
  maxDepth: 0.1,
  length: 1,
  bend: 0.2
};

const om = 1.4; // Outline multiplier

const hornOutline = {
  ...horn,
  maxWidth: horn.maxWidth * om,
  maxDepth: horn.maxDepth * om,
  length: 1.2
};

const leftHorn = new THREE.Mesh(
  createHorn(horn),
  skin
);

const leftHornOutline = new THREE.Mesh(
  createHorn(hornOutline),
  outlineMaterial
);

const rightHorn = new THREE.Mesh(
  createHorn({
    ...horn,
    phi: (3/8) * PI,
    bend: -horn.bend
  }),
  skin
);

const rightHornOutline = new THREE.Mesh(
  createHorn({
    ...hornOutline,
    phi: (3/8) * PI,
    bend: -horn.bend
  }),
  outlineMaterial
);

const hornRing = {
  centerTheta: horn.theta,
  centerPhi: horn.phi,
  thetaRadius: horn.maxWidth,
  phiRadius: horn.maxDepth,
  tubeRadius: 0.07,
  startAngle: 0,
  finishAngle: TWO_PI
};

const hornGroup = new THREE.Group();
hornGroup.add(leftHorn);
hornGroup.add(leftHornOutline);
hornGroup.add(rightHorn);
hornGroup.add(rightHornOutline);

hornGroup.add(
  new THREE.Mesh(
    createArc(hornRing),
    outlineMaterialDouble
  ),
);

hornGroup.add(
  new THREE.Mesh(
    createArc({
      ...hornRing,
      centerPhi: (3/8) * PI,
    }),
    outlineMaterialDouble
  ),
);

scene.add(hornGroup);

//
// Antenna
//

const createAntenna = (beginning: THREE.Vector3, middle: THREE.Vector3, end: THREE.Vector3, width: number): THREE.TubeGeometry => {

  class Tube extends THREE.Curve<THREE.Vector3> {
    getPoint(t): THREE.Vector3 {
      if (t < 0.5) {
        return new THREE.Vector3(
          linearMap(t, 0, 0.5, beginning.x, middle.x),
          linearMap(t, 0, 0.5, beginning.y, middle.y),
          linearMap(t, 0, 0.5, beginning.z, middle.z)
        );
      } else {
        return new THREE.Vector3(
          linearMap(t, 0.5, 1, middle.x, end.x),
          linearMap(t, 0.5, 1, middle.y, end.y),
          linearMap(t, 0.5, 1, middle.z, end.z)
        );
      }
    }
  }

  return new THREE.TubeGeometry(new Tube, 20, width);

};

const antenna = new THREE.Group();
const antennaPosition = new THREE.Vector3(1, headHeight + 0.8, 0);
const antennaSize = 0.2;

const antennaPole = createAntenna(
  new THREE.Vector3(0, headHeight, 0),
  new THREE.Vector3(0.3, headHeight + 1, 0),
  antennaPosition,
  0.05
);

const antennaDot = new THREE.SphereGeometry(antennaSize, 12, 12);
const antennaOutline = new THREE.SphereGeometry(antennaSize * om, 12, 12);
antennaDot.translate(antennaPosition.x, antennaPosition.y, antennaPosition.z);
antennaOutline.translate(antennaPosition.x, antennaPosition.y, antennaPosition.z);

antenna.add(
  new THREE.Mesh(
    antennaPole,
    outlineMaterialDouble
  )
);

antenna.add(
  new THREE.Mesh(
    antennaDot,
    redMaterial
  )
);

antenna.add(
  new THREE.Mesh(
    antennaOutline,
    outlineMaterial
  )
);

scene.add(antenna);

scene.add(createFace());

//
// Animate
//

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

