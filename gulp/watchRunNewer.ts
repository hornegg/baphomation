/* eslint-disable functional/no-expression-statement */
import * as path from 'path';

import * as gulp from 'gulp';
import * as run from 'gulp-run';
import * as noop from 'gulp-noop';

import { newer } from './newer';

interface CommonParams {
  displayName: string;
  src: string;
  dests: string[];
  extra: string[];
}

interface WatchRunNewerParams extends CommonParams {
  cmd: string;
}

export const watchRunNewer = async (
  params: WatchRunNewerParams
): Promise<void> => {
  const srcs = [params.src, ...params.extra];

  const result: boolean = await newer(srcs, params.dests);

  const task = () => run(params.cmd).exec().pipe(noop());

  gulp.watch(
    [params.src, ...params.extra],
    { ignoreInitial: !result },
    Object.assign(task, { displayName: params.displayName })
  );
};

interface WatchRunScriptNewerParams extends CommonParams {
  args: string[];
}

export const watchRunScriptNewer = (
  params: WatchRunScriptNewerParams
): void => {
  const tsNodePath = path.join('node_modules', '.bin', 'ts-node');

  watchRunNewer({
    ...params,
    cmd: `${tsNodePath} ${params.src} ${[...params.dests, ...params.args].join(
      ' '
    )}`,
  });
};
