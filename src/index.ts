/* eslint-disable immutable/no-let */
/* eslint-disable functional/no-expression-statement */

import * as THREE from 'three';

import { Layer, loadGeometry, watchTowerLength } from './common';

import { choreographBody } from './choreograph';
import { createFrameCaptureComponent } from './frameCapture';
import { createHead } from './head';
import { createLetteringComponent } from './lettering';
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

const hueAdjustments = {
  blue: 128,
  green: 60,
  yellow: 20,
  red: -30,
};

const run = async () => {
  const [
    head,
    bodyGeometry,
    outlineBodyGeometry,
    leftFootGeometry,
    outlineLeftFootGeometry,
    rightFootGeometry,
    outlineRightFootGeometry,
  ] = await Promise.all([
    createHead(skin),
    loadGeometry('bodyGeometry.json'),
    loadGeometry('outlineBodyGeometry.json'),
    loadGeometry('leftFootGeometry.json'),
    loadGeometry('outlineLeftFootGeometry.json'),
    loadGeometry('rightFootGeometry.json'),
    loadGeometry('outlineRightFootGeometry.json'),
  ]);

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

  const parentDiv = document.createElement('div');
  parentDiv.style.display = 'none';

  const createRenderPass = (layer: Layer): RenderPass => {
    const camera = cameraTemplate.clone();
    camera.layers = new THREE.Layers();
    camera.layers.set(layer);
    const pass = new RenderPass(scene, camera);
    cameras.push(camera);
    return pass;
  };

  const createRenderer = (): THREE.WebGLRenderer => {
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    renderer.setSize(settings.width, settings.height);
    parentDiv.appendChild(renderer.domElement);
    return renderer;
  };

  const createShaderPass = (fragmentShader) => {
    const pass = new ShaderPass(
      new THREE.ShaderMaterial({
        vertexShader: shaders.basicVertexShader,
        fragmentShader,
        side: THREE.DoubleSide,
        uniforms: {
          tDiffuse: { value: null },
        },
      })
    );
    return pass;
  };

  const changeHueShader = createShaderPass(shaders.changeHue);

  const flamesBehindRenderer = createRenderer();
  const flamesBehindComposer = new EffectComposer(flamesBehindRenderer);
  flamesBehindComposer.addPass(createRenderPass(Layer.flamesBehind));
  flamesBehindComposer.addPass(changeHueShader);

  const mainRenderer = createRenderer();
  const mainComposer = new EffectComposer(mainRenderer);
  mainComposer.addPass(createRenderPass(Layer.main));

  const flamesInfrontRenderer = createRenderer();
  const flamesInfrontComposer = new EffectComposer(flamesInfrontRenderer);
  flamesInfrontComposer.addPass(createRenderPass(Layer.flamesInfront));
  flamesInfrontComposer.addPass(changeHueShader);

  const canvas = document.createElement('canvas');
  canvas.width = settings.width;
  canvas.height = settings.height;
  document.body.appendChild(canvas);
  document.body.append(parentDiv);

  const lettering = await createLetteringComponent();

  let state = choreographBody(0);

  flamesBehindRenderer.setAnimationLoop(async () => {
    const [x, y, z] = getCameraPosition(state.frame).toArray();
    const yAdjust = 0.4;
    cameras.forEach((camera) => {
      camera.position.set(x, y + yAdjust, z);
      camera.lookAt(0, -0.6 + yAdjust, 0);
    });

    scene.clear();

    scene.add(main(state));

    const watchTowerIndex = Math.floor(
      (state.frame % settings.cycleLength) / watchTowerLength
    );
    const watchTowerColor = settings.watchTowers.color[watchTowerIndex];
    changeHueShader.uniforms.hueAdjustment = new THREE.Uniform(
      hueAdjustments[watchTowerColor] / 255
    );

    scene.background = new THREE.Color('white');
    flamesBehindComposer.render();
    scene.background = null;
    mainComposer.render();
    flamesInfrontComposer.render();
    await lettering.render();

    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(flamesBehindRenderer.domElement, 0, 0);
    context.drawImage(mainRenderer.domElement, 0, 0);
    context.drawImage(flamesInfrontRenderer.domElement, 0, 0);
    context.drawImage(lettering.domElement, 0, 0);

    if (settings.frameCapture) {
      frameCapture({
        startFrame: 0,
        endFrame: settings.cycleLength,
        filename: 'frames.zip',
        getCanvas: () => canvas,
      });
    }

    state = choreographBody(state.frame + 1);
  });
};

run();
