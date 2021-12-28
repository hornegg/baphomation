/* eslint-disable functional/no-expression-statement */

import * as fs from 'fs/promises';
import * as gulp from 'gulp';
import * as os from 'os';
import * as path from 'path';
import * as pLimit from 'p-limit';

import { exec as execOrig } from 'child_process';
import { newer } from './gulp/newer';
import { promisify } from 'util';
import settings from './src/settings';
import { times } from 'lodash';
import { watchRunScriptNewer } from './gulp/watchRunNewer';

const execNoLog = promisify(execOrig);

const exec = async (cmd) => {
  console.log(`\n${cmd}`);
  return execNoLog(cmd).then((result) => {
    console.log(result.stdout + result.stderr);
    return result;
  });
};

const defaultTask = (callback: () => void): void => {
  // fire
  fs.copyFile(path.join(__dirname, 'src/THREE.Fire/Fire.png'), 'dist/Fire.png');

  // head

  watchRunScriptNewer({
    displayName: 'headGeometry',
    src: 'model/headGeometry.ts',
    extra: ['model/commonGeometry.ts'],
    dests: ['dist/headGeometry.json'],
    args: ['false'],
  });

  // body

  watchRunScriptNewer({
    displayName: 'bodyGeometry',
    src: 'model/bodyGeometry.ts',
    extra: ['model/commonGeometry.ts', 'src/settings.ts'],
    dests: ['dist/bodyGeometry.json'],
    args: ['false'],
  });

  // left foot

  watchRunScriptNewer({
    displayName: 'leftFootGeometry',
    src: 'model/footGeometry.ts',
    extra: ['model/commonGeometry.ts'],
    dests: ['dist/leftFootGeometry.json'],
    args: ['false', 'true'],
  });

  // right foot

  watchRunScriptNewer({
    displayName: 'rightFootGeometry',
    src: 'model/footGeometry.ts',
    extra: ['model/commonGeometry.ts'],
    dests: ['dist/rightFootGeometry.json'],
    args: ['false', 'false'],
  });

  // Post processing
  postProcessing();

  callback();
};

const postProcessing = async () => {
  const zipFilename = path.resolve('dist/frames.zip');
  const rawFramesPath = path.resolve('dist/rawFrames');
  const framesPath = path.resolve('dist/frames');
  const framesParam = path.join(framesPath, 'f%06d.png');
  const videoPath = path.resolve('dist/baphomation.mp4');
  const ffmpegPath = path.join('node_modules', 'ffmpeg-static', 'ffmpeg');
  const tsNodePath = path.join('node_modules', '.bin', 'ts-node');
  const batchSize = 32;
  const limit = pLimit(os.cpus().length);
  const batches = Math.ceil(settings.cycleLength / batchSize);
  const lexec = (cmd) => limit(() => exec(cmd));

  const result: boolean = await newer([zipFilename], [videoPath]);

  const task = async () => {
    await exec(`rimraf ${rawFramesPath}/*`);
    await exec(`rimraf ${framesPath}`);
    await fs.mkdir(framesPath);
    await exec(`extract-zip ${zipFilename} ${rawFramesPath}`);

    await Promise.all(
      times(batches, (batch) => {
        const offset = batch * batchSize;
        const thisBatchSize = Math.min(
          batchSize,
          settings.cycleLength - offset - 1
        );
        return lexec(
          `${tsNodePath} processing/postProcessing.ts ${offset} ${thisBatchSize}`
        );
      })
    );

    await exec(
      `${ffmpegPath} -framerate ${settings.fps} -i ${framesParam} ${videoPath} -y`
    );
  };

  gulp.watch(
    zipFilename,
    { ignoreInitial: !result },
    Object.assign(task, { displayName: 'post processing' })
  );
};

export default defaultTask;
