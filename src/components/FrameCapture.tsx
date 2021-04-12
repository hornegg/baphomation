/* eslint-disable functional/no-expression-statement */
import * as React from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { CanvasContext, useFrame } from 'react-three-fiber';

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

const FrameCapture = (props: FrameCaptureProps): JSX.Element => {
  const [state, setState] = React.useState<FrameCaptureState>({
    frame: 0,
    zip: new JSZip(),
  });

  useFrame((canvasContext: CanvasContext) => {
    canvasContext.gl.render(canvasContext.scene, canvasContext.camera);

    if (state.frame >= props.startFrame && state.frame < props.endFrame) {
      const frameString = state.frame.toString().padStart(6, '0');

      props.getCanvas().toBlob((blob: Blob) => {
        state.zip.file(`f${frameString}.png`, blob);
        const captureCount = props.endFrame - props.startFrame;

        if (Object.keys(state.zip.files).length >= captureCount) {
          state.zip.generateAsync({ type: 'blob' }).then((content) => {
            saveAs(content, props.filename);
          });

          // The requested capture is complete.  Stop the animation to free up resources for processing the zip file

          canvasContext.ready = false;
        }
      });
    }

    setState({ ...state, frame: state.frame + 1 });
  }, 1);

  return <></>;
};

export default FrameCapture;
