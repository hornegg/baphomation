import * as THREE from 'three';

export type AnimationLoopComponent<Props> = (props: Props) => THREE.Object3D;
