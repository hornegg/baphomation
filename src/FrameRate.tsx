/* eslint-disable functional/no-expression-statement */
import * as React from 'react';
import { useFrame } from 'react-three-fiber';

interface FrameRateProps {
  logger?: (s: string) => void;
}

const FrameRate = (props: FrameRateProps): JSX.Element => {
  const [frameCount, setFrameCount] = React.useState(0);

  React.useMemo(() => {
    setInterval(() => {
      setFrameCount((currentFrameCount) => {
        props.logger(`${currentFrameCount} fps`);
        return 0;
      });
    }, 1000);
  }, []);

  useFrame(() => setFrameCount(frameCount + 1));

  return <></>;
};

export default FrameRate;
