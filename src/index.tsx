/* eslint-disable functional/no-expression-statement */
import * as React from 'react';
import * as THREE from 'three';

import {
  AnimationLoopComponent,
  HALF_PI,
  loadGeometry,
  watchTowerLength,
} from './common';

import { Canvas, CanvasContext, useFrame } from 'react-three-fiber';

import { choreographBody, pentagramLength } from './choreograph';

import { createPentagram, PentagramProps } from './pentagram';

import { createBaphometComponent } from './baphomet';
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

    const baphomet = createBaphometComponent();

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

      return (
        <group>
          {state.layerInfo.baphomet ? (
            <primitive
              object={baphomet({
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
              })}
            />
          ) : (
            <></>
          )}
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
