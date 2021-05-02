/* eslint-disable functional/no-expression-statement */
import * as React from 'react';
import * as THREE from 'three';

import {
  AnimationLoopComponent,
  createPentagram,
  PentagramProps,
} from './pentagram';

import { Canvas, CanvasContext, useFrame } from 'react-three-fiber';

import {
  choreographArm,
  choreographBody,
  pentagramLength,
  stillArm,
} from './choreograph';

import {
  HALF_PI,
  loadGeometry,
  outlineMaterial,
  watchTowerLength,
} from './common';

import { arm } from './arm';
import { createHead } from './head';
import FrameCapture from './FrameCapture';
import FrameRate from './FrameRate';
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

      const Body = () => (
        <group rotation={new THREE.Euler(0, state.bodyAngle, 0)}>
          <primitive object={head} />
          <mesh geometry={bodyGeometry} material={skin} />
          <mesh geometry={outlineBodyGeometry} material={outlineMaterial} />
          <primitive object={arm({ sign: 1, pointAt: stillArm, skin })} />
          <primitive
            object={arm({
              sign: -1,
              pointAt: choreographArm(watchTowerFrame),
              skin,
            })}
          />
        </group>
      );

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
          <Body />
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
          <FrameRate logger={console.log} />
          {settings.frameCapture ? (
            <FrameCapture
              startFrame={0}
              endFrame={settings.cycleLength * 3}
              filename="frames.zip"
              getCanvas={() => document.getElementsByTagName('canvas')[0]}
            />
          ) : (
            <></>
          )}
          <Main />
        </Canvas>
      </div>,
      document.getElementById('root')
    );
  }
);
