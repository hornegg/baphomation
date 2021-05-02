/* eslint-disable functional/no-expression-statement */
import * as React from 'react';
import * as THREE from 'three';

import {
  AnimationLoopComponent,
  HALF_PI,
  loadGeometry,
  outlineMaterial,
  watchTowerLength,
} from './common';

import { Canvas, CanvasContext, useFrame } from 'react-three-fiber';

import { choreographBody, pentagramLength } from './choreograph';

import { createPentagram, PentagramProps } from './pentagram';

import { createBodyComponent } from './body';
import { createHead } from './head';
import getCameraPosition from './getCameraPosition';
import ReactDOM from 'react-dom';
import { room } from './room';
import settings from './settings';

const skin = new THREE.MeshBasicMaterial({
  color: 0x111111,
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

    const body = createBodyComponent();

    const Main = () => {
      const [state, setState] = React.useState(choreographBody(0));

      useFrame((canvasContext: CanvasContext) => {
        const [x, y, z] = getCameraPosition(state.frame).toArray();
        const yAdjust = 0.4;
        canvasContext.camera.position.set(x, y + yAdjust, z);
        canvasContext.camera.lookAt(0, -0.6 + yAdjust, 0);

        // Now update the body position based on what frame number this is
        setState(choreographBody(state.frame + 1));
      });

      const watchTowerFrame = state.frame % watchTowerLength;

      const LeftFoot = () => (
        <group rotation={new THREE.Euler(0, state.leftFootAngle, 0)}>
          <mesh geometry={leftFootGeometry} material={skin} />
          <mesh geometry={outlineLeftFootGeometry} material={outlineMaterial} />
        </group>
      );

      const RightFoot = () => (
        <group rotation={new THREE.Euler(0, state.rightFootAngle, 0)}>
          <mesh geometry={rightFootGeometry} material={skin} />
          <mesh
            geometry={outlineRightFootGeometry}
            material={outlineMaterial}
          />
        </group>
      );

      const watchtowers = [
        ...(state.layerInfo.topFlames ? [0, 1] : []),
        ...(state.layerInfo.bottomFlames ? [2, 3] : []),
      ];

      const Pentagrams = (
        <group>
          {watchtowers.map((watchTowerIndex) => {
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

            return (
              <group key={watchTowerIndex} position={position}>
                <primitive
                  object={pentagram({ angle, startFrame, endFrame })}
                />
              </group>
            );
          })}
        </group>
      );

      const baphomet = (
        <group>
          <primitive
            object={body({
              bodyAngle: state.bodyAngle,
              head,
              bodyGeometry,
              outlineBodyGeometry,
              skin,
              watchTowerFrame,
            })}
          />
          <LeftFoot />
          <RightFoot />
        </group>
      );

      return (
        <group>
          {state.layerInfo.baphomet ? baphomet : <></>}
          {Pentagrams}
          {state.layerInfo.baphomet ? <primitive object={room()} /> : <></>}
        </group>
      );
    };

    ReactDOM.render(
      <div
        style={{
          width: settings.width,
          height: settings.height,
          border: 'solid 1px black',
        }}
      >
        <Canvas>
          <Main />
        </Canvas>
      </div>,
      document.getElementById('root')
    );
  }
);
