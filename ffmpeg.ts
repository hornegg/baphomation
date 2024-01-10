import * as fs from 'fs/promises';
import * as path from 'path';

import { exec as execOrig } from 'child_process';
import { promisify } from 'util';
import settings from './src/settings';

const execNoLog = promisify(execOrig);

const exec = async (cmd: string) => {
  console.log(`\n${cmd}`);
  return execNoLog(cmd).then((result) => {
    console.log(result.stdout + result.stderr);
    return result;
  });
};

const zipFilename = path.resolve('dist/frames.zip');
const framesPath = path.resolve('dist/frames');
const framesParam = path.join(framesPath, 'f%06d.png');
const videoPath = path.resolve('dist/baphomation.mp4');
const ffmpegPath = path.join('node_modules', 'ffmpeg-static', 'ffmpeg');

const task = async () => {
  await exec(`rimraf ${framesPath}`);
  await fs.mkdir(framesPath);
  await exec(`extract-zip ${zipFilename} ${framesPath}`);

  await exec(
    `${ffmpegPath} -framerate ${settings.fps} -i ${framesParam} ${videoPath} -y`,
  );
};

task();
