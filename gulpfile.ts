/* eslint-disable functional/no-expression-statement */
import * as path from 'path';
import { promisify } from 'util';
import { exec as execOrig } from 'child_process';
import * as fs from 'fs/promises';
import * as os from 'os';

import * as gulp from 'gulp';
import * as pLimit from 'p-limit';
import { times } from 'lodash';

import { newer } from './gulp/newer';
import { watchRunScriptNewer } from './gulp/watchRunNewer';
import settings from './src/settings';

const execNoLog = promisify(execOrig);

const exec = async (cmd) => {
  console.log(`\n${cmd}`);
  return execNoLog(cmd).then((result) => {
    console.log(result.stdout + result.stderr);
    return result;
  });
};

const defaultTask = (callback: () => void): void => {
  // head

  watchRunScriptNewer({
    displayName: 'headGeometry',
    src: 'model/headGeometry.ts',
    extra: ['model/commonGeometry.ts'],
    dests: ['dist/headGeometry.json'],
    args: ['false'],
  });

  watchRunScriptNewer({
    displayName: 'outlineHeadGeometry',
    src: 'model/headGeometry.ts',
    extra: ['model/commonGeometry.ts'],
    dests: ['dist/outlineHeadGeometry.json'],
    args: ['true'],
  });

  // body

  watchRunScriptNewer({
    displayName: 'bodyGeometry',
    src: 'model/bodyGeometry.ts',
    extra: [
      'model/commonGeometry.ts',
      'dist/outlineHeadGeometry.json',
      'src/settings.ts',
    ],
    dests: ['dist/bodyGeometry.json'],
    args: ['false'],
  });

  watchRunScriptNewer({
    displayName: 'outlineBodyGeometry',
    src: 'model/bodyGeometry.ts',
    extra: [
      'model/commonGeometry.ts',
      'dist/outlineHeadGeometry.json',
      'src/settings.ts',
    ],
    dests: ['dist/outlineBodyGeometry.json'],
    args: ['true'],
  });

  // left foot

  watchRunScriptNewer({
    displayName: 'leftFootGeometry',
    src: 'model/footGeometry.ts',
    extra: ['model/commonGeometry.ts', 'dist/outlineBodyGeometry.json'],
    dests: ['dist/leftFootGeometry.json'],
    args: ['false', 'true'],
  });

  watchRunScriptNewer({
    displayName: 'outlineLeftFootGeometry',
    src: 'model/footGeometry.ts',
    extra: ['model/commonGeometry.ts', 'dist/outlineBodyGeometry.json'],
    dests: ['dist/outlineLeftFootGeometry.json'],
    args: ['true', 'true'],
  });

  // right foot

  watchRunScriptNewer({
    displayName: 'rightFootGeometry',
    src: 'model/footGeometry.ts',
    extra: ['model/commonGeometry.ts', 'dist/outlineBodyGeometry.json'],
    dests: ['dist/rightFootGeometry.json'],
    args: ['false', 'false'],
  });

  watchRunScriptNewer({
    displayName: 'outlineRightFootGeometry',
    src: 'model/footGeometry.ts',
    extra: ['model/commonGeometry.ts', 'dist/outlineBodyGeometry.json'],
    dests: ['dist/outlineRightFootGeometry.json'],
    args: ['true', 'false'],
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
