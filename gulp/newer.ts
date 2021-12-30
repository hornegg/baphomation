import * as fs from 'fs/promises';

// mtimePromise - returns the last time the file was modified if it can get it, or null if the file is missing or otherwise inaccessible
const mtimePromise = (filename: string): Promise<number | null> =>
  fs
    .stat(filename)
    .then((stat) => stat.mtime.valueOf())
    .catch(() => null);

type NumericalReduce = (a: number | null, b: number) => number | null;

const createMtimeReducer = (fn: NumericalReduce) => {
  return (acc: number | null, mtime: number | null): number | null =>
    acc === null || mtime === null ? null : fn(acc, mtime);
};

// newer - returns true if at least one of the source files is newer than at least one of the destination files
export const newer = async (
  srcs: string[],
  dests: string[]
): Promise<boolean> => {
  const [srcsMtime, destsMtime] = await Promise.all([
    Promise.all(srcs.map(mtimePromise)),
    Promise.all(dests.map(mtimePromise)),
  ]);

  const srcMtime = srcsMtime.reduce(createMtimeReducer(Math.max as NumericalReduce), 0);
  const destMtime = destsMtime.reduce(
    createMtimeReducer(Math.min as NumericalReduce),
    Number.MAX_SAFE_INTEGER
  );
  if (srcMtime !== null) {
    if (destMtime === null || srcMtime >= destMtime) {
      return true;
    }
  }

  return false;
};
