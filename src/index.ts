/* eslint-disable immutable/no-let */
/* eslint-disable functional/no-expression-statement */

import * as THREE from 'three';

import { Layer, loadGeometry } from './common';

import { choreographBody } from './choreograph';
import { ClearPass } from 'three/examples/jsm/postprocessing/ClearPass';
import { createFrameCaptureComponent } from './frameCapture';
import { createHead } from './head';
import { createMainComponent } from './main';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import getCameraPosition from './getCameraPosition';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import settings from './settings';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import shaders from './shaders';

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
    const changeHueShader = {
      uniforms: {'tDiffuse': { value: null },
  },

      vertexShader: shaders.basicVertexShader,
      fragmentShader: shaders.changeHue,
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

    const createRenderer = (display: string): THREE.WebGLRenderer => {
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(settings.width, settings.height);
      renderer.autoClear = false;
      renderer.domElement.style.display = display;
      document.body.appendChild(renderer.domElement);
      return renderer;
    };

    const flamesBehindRenderer = createRenderer('initial');
    const flamesBehindComposer = new EffectComposer(flamesBehindRenderer);
    flamesBehindComposer.addPass(createRenderPass(Layer.flamesBehind));

    const shapesRenderer = createRenderer('initial');
    const shapesComposer = new EffectComposer(shapesRenderer);
    shapesComposer.addPass(createRenderPass(Layer.shapes));

    const faceRenderer = createRenderer('initial');
    const faceComposer = new EffectComposer(faceRenderer);
    faceComposer.addPass(createRenderPass(Layer.face));

    const flamesInfrontRenderer = createRenderer('initial');
    const flamesInfrontComposer = new EffectComposer(flamesInfrontRenderer);
    flamesInfrontComposer.addPass(createRenderPass(Layer.flamesInfront));
//    flamesInfrontComposer.addPass(new ShaderPass(changeHueShader));

    let state = choreographBody(0);

    flamesBehindRenderer.setAnimationLoop(() => {
      const [x, y, z] = getCameraPosition(state.frame).toArray();
      const yAdjust = 0.4;
      cameras.forEach((camera) => {
        camera.position.set(x, y + yAdjust, z);
        camera.lookAt(0, -0.6 + yAdjust, 0);
      });

      scene.clear();

      scene.add(main(state));

      scene.background = new THREE.Color('white');
      flamesBehindComposer.render();
      scene.background = null;
      shapesComposer.render();
      faceComposer.render();
//      scene.background = new THREE.Color('white');
      flamesInfrontComposer.render();

      if (settings.frameCapture) {
        frameCapture({
          startFrame: 0,
          endFrame: settings.cycleLength,
          filename: 'frames.zip',
          getCanvas: () => document.getElementsByTagName('canvas')[0], // FIX ME
        });
      }

      state = choreographBody(state.frame + 1);
    });
  }
);
