/* eslint-disable immutable/no-let */
import * as THREE from 'three';

import { AnimationLoopComponent } from './components/AnimationLoopComponent';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

interface FrameCaptureProps {
  startFrame: number;
  endFrame: number;
  filename: string;
  getCanvas: () => HTMLCanvasElement;
}

interface FrameCaptureState {
  frame: number;
  zip: JSZip;
}

export const createFrameCaptureComponent =
  (): AnimationLoopComponent<FrameCaptureProps> => {
    let state: FrameCaptureState = {
      frame: 0,
      zip: new JSZip(),
    };

    return (props: FrameCaptureProps) => {
      if (state.frame >= props.startFrame && state.frame < props.endFrame) {
        const frameString = state.frame.toString().padStart(6, '0');

        props.getCanvas().toBlob((blob: Blob | null) => {
          if (blob) {
            state.zip.file(`f${frameString}.png`, blob);
            const captureCount = props.endFrame - props.startFrame;

            if (Object.keys(state.zip.files).length >= captureCount) {
              console.log(`Generating ${props.filename}`);
              state.zip.generateAsync({ type: 'blob' }).then((content) => {
                console.log('Frame capture complete');
                saveAs(content, props.filename);
              });
            }
          }
        });
      }

      state = { ...state, frame: state.frame + 1 };
      return new THREE.Group();
    };
  };
