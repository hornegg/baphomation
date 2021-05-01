import * as THREE from 'three';
import { BufferGeometry } from 'three';
import settings from './settings';

export const PI = Math.PI;
export const TWO_PI = 2 * PI;
export const HALF_PI = 0.5 * PI;
export const QUARTER_PI = 0.25 * PI;
export const EIGHTH_PI = 0.125 * PI;

export type IMap = (
  value: number,
  range1start: number,
  range1end: number,
  range2start: number,
  range2end: number
) => number;

export const linearMap = (
  value: number,
  range1start: number,
  range1end: number,
  range2start: number,
  range2end: number
): number => {
  return (
    range2start +
    ((range2end - range2start) *
      ((value - range1start) / (range1end - range1start)))
  );
};

export const powerMap = (power: number): IMap => {
  return (
    value: number,
    range1start: number,
    range1end: number,
    range2start: number,
    range2end: number
  ): number => {
    const linearRatio = (value - range1start) / (range1end - range1start);
    const ratio = Math.pow(linearRatio, power);
    return range2start + ((range2end - range2start) * ratio);
  };
};

export const segmentedMap = (
  value: number,
  range1: number[],
  range2: number[],
  _maps?: IMap[]
): number => {
  if (range1.length !== range2.length) {
    throw new Error('segmentedMap range arrays not equal');
  }

  const maps = _maps ? _maps : Array(range1.length - 1).fill(linearMap);

  if (maps.length !== range1.length - 1) {
    throw new Error(
      'segmentedMap maps array length must be one less that ranges length'
    );
  }

  const n = range1.findIndex((t) => t > value);
  switch (n) {
    case 0:
      return range2[0];
    case -1:
      return range2[range2.length - 1];
    default:
      return maps[n - 1](
        value,
        range1[n - 1],
        range1[n],
        range2[n - 1],
        range2[n]
      );
  }
};

export const linearMap3 = (
  value: number,
  range1start: number,
  range1end: number,
  range2start: THREE.Vector3,
  range2end: THREE.Vector3
): THREE.Vector3 => {
  return new THREE.Vector3(
    linearMap(value, range1start, range1end, range2start.x, range2end.x),
    linearMap(value, range1start, range1end, range2start.y, range2end.y),
    linearMap(value, range1start, range1end, range2start.z, range2end.z)
  );
};

export const segmentedLinearMap3 = (
  value: number,
  range1: number[],
  range2: THREE.Vector3[]
): THREE.Vector3 => {
  const result = new THREE.Vector3(
    segmentedMap(
      value,
      range1,
      range2.map((v) => v.x)
    ),
    segmentedMap(
      value,
      range1,
      range2.map((v) => v.y)
    ),
    segmentedMap(
      value,
      range1,
      range2.map((v) => v.z)
    )
  );
  return result;
};

export const headWidth = 1.5;
export const headHeight = 1;
export const headDepth = 1;

export const floorLevel = -3.1;

export const watchTowerLength = settings.cycleLength / 4;

export const ellipticalToCartesian = (
  r: number,
  theta: number,
  phi: number,
  _vec?: THREE.Vector3
): THREE.Vector3 => {
  const vec = _vec ? _vec : new THREE.Vector3();

  return vec.set(
    r * headWidth * Math.sin(theta) * Math.cos(phi),
    r * headHeight * Math.sin(theta) * Math.sin(phi),
    r * headDepth * Math.cos(theta)
  );
};

//
// Materials
//

export const outlineMaterial = new THREE.MeshBasicMaterial({
  color: 'black',
  side: THREE.BackSide,
});

export const outlineMaterialDouble = new THREE.MeshBasicMaterial({
  color: 'black',
  side: THREE.DoubleSide,
});

export const redMaterial = new THREE.MeshBasicMaterial({
  color: 'red',
  side: THREE.DoubleSide,
});

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
  class Tube extends THREE.Curve<THREE.Vector3> {
    getPoint(t): THREE.Vector3 {
      const theta = linearMap(t, 0, 1, param.thetaStart, param.thetaEnd);
      const phi = linearMap(t, 0, 1, param.phiStart, param.phiEnd);
      return ellipticalToCartesian(1, theta, phi);
    }
  }

  return new THREE.TubeGeometry(new Tube(), 100, param.radius, 100, false);
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
  class Arc extends THREE.Curve<THREE.Vector3> {
    getPoint(t): THREE.Vector3 {
      const angle = linearMap(t, 0, 1, param.startAngle, param.finishAngle);
      return ellipticalToCartesian(
        1,
        param.centerTheta + (param.thetaRadius * Math.cos(angle)),
        param.centerPhi + (param.phiRadius * Math.sin(angle))
      );
    }
  }

  return new THREE.TubeGeometry(new Arc(), 100, param.tubeRadius, 100, false);
};

//
// loadGeometry
//

export const loadGeometry = (filename: string): Promise<BufferGeometry> => {
  return new Promise((resolve, reject) => {
    // eslint-disable-next-line functional/no-expression-statement
    new THREE.BufferGeometryLoader().load(
      filename,
      (geometry) => resolve(geometry),
      null,
      (error: ErrorEvent) => reject(error)
    );
  });
};
