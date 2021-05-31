/* eslint-disable immutable/no-let */
/* eslint-disable functional/no-expression-statement */

import './parcel';

import * as THREE from 'three';

import { Layer, loadGeometry } from './common';

import changeHue from 'url:./shaders/changeHue.frag';
import { choreographBody } from './choreograph';
import { createFrameCaptureComponent } from './frameCapture';
import { createHead } from './head';
import { createMainComponent } from './main';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import getCameraPosition from './getCameraPosition';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import settings from './settings';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';

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


    const RGBShiftShader = {

      uniforms: {
    
        'tDiffuse': { value: null },
        'amount': { value: 0.005 },
        'angle': { value: 0.0 }
    
      },
    
      vertexShader: [
    
        'varying vec2 vUv;',
    
        'void main() {',
    
        '  vUv = uv;',
        '  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
    
        '}'
    
      ].join( '\n' ),
    
      fragmentShader: changeHue
    
    };

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

    const cameraTemplate = new THREE.PerspectiveCamera(75, 1.2, 0.1, 1000);
    const cameras: THREE.Camera[] = [];

    const createRenderPass = (layer: Layer): RenderPass => {
      const camera = cameraTemplate.clone();
      camera.layers = new THREE.Layers();
      camera.layers.set(layer);
      const pass = new RenderPass(scene, camera);
      cameras.push(camera);
      pass.clear = false;
      return pass;
    };

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(settings.width, settings.height);
    renderer.autoClear = false;

    document.body.appendChild(renderer.domElement);

    const flamesBehindComposer = new EffectComposer(renderer);
    flamesBehindComposer.addPass(createRenderPass(Layer.flamesBehind));

    const shapesComposer = new EffectComposer(renderer);
    shapesComposer.addPass(createRenderPass(Layer.shapes));

    const faceComposer = new EffectComposer(renderer);
    faceComposer.addPass(createRenderPass(Layer.face));

    const flamesInfrontComposer = new EffectComposer(renderer);
    flamesInfrontComposer.addPass(createRenderPass(Layer.flamesInfront));
    flamesInfrontComposer.addPass(new ShaderPass(RGBShiftShader));

    let state = choreographBody(0);

    renderer.setAnimationLoop(() => {
      const [x, y, z] = getCameraPosition(state.frame).toArray();
      const yAdjust = 0.4;
      cameras.forEach((camera) => {
        camera.position.set(x, y + yAdjust, z);
        camera.lookAt(0, -0.6 + yAdjust, 0);
      });

      scene.clear();

      scene.add(main(state));

      flamesBehindComposer.render();
      shapesComposer.render();
      faceComposer.render();
      flamesInfrontComposer.render();

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
