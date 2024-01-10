/* eslint-disable functional/no-expression-statement */
import * as THREE from 'three';
import { linearMap } from './common/maps';

export const headWidth = 1.5;
export const headHeight = 1;
export const headDepth = 1;

export const ellipticalToCartesian = (
  r: number,
  theta: number,
  phi: number,
  _vec?: THREE.Vector3,
): THREE.Vector3 => {
  const vec = _vec ? _vec : new THREE.Vector3();

  return vec.set(
    r * headWidth * Math.sin(theta) * Math.cos(phi),
    r * headHeight * Math.sin(theta) * Math.sin(phi),
    r * headDepth * Math.cos(theta),
  );
};

//
// Basic shapes upon the ellipical head
//

interface TubeParameters {
  thetaStart: number;
  phiStart: number;
  thetaEnd: number;
  phiEnd: number;
  radius: number;
}

export const createTube = (param: TubeParameters): THREE.TubeGeometry => {
  const tubePath = new THREE.Curve<THREE.Vector3>();
  tubePath.getPoint = (t): THREE.Vector3 => {
    const theta = linearMap(t, 0, 1, param.thetaStart, param.thetaEnd);
    const phi = linearMap(t, 0, 1, param.phiStart, param.phiEnd);
    return ellipticalToCartesian(1, theta, phi);
  };

  return new THREE.TubeGeometry(tubePath, 100, param.radius, 100, false);
};

interface ArcParameters {
  centerTheta: number;
  centerPhi: number;
  thetaRadius: number;
  phiRadius: number;
  tubeRadius: number;
  startAngle: number;
  finishAngle: number;
}

export const createArc = (param: ArcParameters): THREE.TubeGeometry => {
  const arcPath = new THREE.Curve<THREE.Vector3>();
  arcPath.getPoint = (t): THREE.Vector3 => {
    const angle = linearMap(t, 0, 1, param.startAngle, param.finishAngle);
    return ellipticalToCartesian(
      1,
      param.centerTheta + (param.thetaRadius * Math.cos(angle)),
      param.centerPhi + (param.phiRadius * Math.sin(angle)),
    );
  };

  return new THREE.TubeGeometry(arcPath, 100, param.tubeRadius, 100, false);
};
