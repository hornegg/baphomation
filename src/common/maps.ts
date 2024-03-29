import * as THREE from 'three';

export type IMap = (
  value: number,
  range1start: number,
  range1end: number,
  range2start: number,
  range2end: number,
) => number;

export const linearMap = (
  value: number,
  range1start: number,
  range1end: number,
  range2start: number,
  range2end: number,
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
    range2end: number,
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
  _maps?: IMap[],
): number => {
  if (range1.length !== range2.length) {
    throw new Error('segmentedMap range arrays not equal');
  }

  const maps = _maps ? _maps : Array(range1.length - 1).fill(linearMap);

  if (maps.length !== range1.length - 1) {
    throw new Error(
      'segmentedMap maps array length must be one less that ranges length',
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
        range2[n],
      );
  }
};

export const linearMap3 = (
  value: number,
  range1start: number,
  range1end: number,
  range2start: THREE.Vector3,
  range2end: THREE.Vector3,
): THREE.Vector3 => {
  return new THREE.Vector3(
    linearMap(value, range1start, range1end, range2start.x, range2end.x),
    linearMap(value, range1start, range1end, range2start.y, range2end.y),
    linearMap(value, range1start, range1end, range2start.z, range2end.z),
  );
};

export const segmentedLinearMap3 = (
  value: number,
  range1: number[],
  range2: THREE.Vector3[],
): THREE.Vector3 => {
  const result = new THREE.Vector3(
    segmentedMap(
      value,
      range1,
      range2.map((v) => v.x),
    ),
    segmentedMap(
      value,
      range1,
      range2.map((v) => v.y),
    ),
    segmentedMap(
      value,
      range1,
      range2.map((v) => v.z),
    ),
  );
  return result;
};
