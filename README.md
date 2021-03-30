# Baphomation

A short animation featuring [Baphomet](https://en.wikipedia.org/wiki/Baphomet) and a segment of a well known ritual.  Baphomation is a portmanteau of Baphomet and Animation.

# Getting started

This is a standard nodejs/npm project hosted in a git repository.  As such, the commands for getting started are:

```
git clone https://github.com/hornegg/baphomation.git
cd baphomation
npm install
npm start
```

The `npm start` command runs a gulp workflow.  This causes some pre-processing to be executed.  The pre-processing is used to generate some of the required geometry upfront in order to save time later.

The `npm start` command also runs the parcel web-application bundler.  The web application can be reached by opening a web browser at this address:

http://localhost:1234/index.html

# Web application

In the web-application we see an approximation to the finished animation.  The difference is that the flames are normal flame colored because post-processing has not been performed, and they have been thinned out for the performance to get close to the correct animation speed.

# src/settings.ts

All the most important configuration settings are in [src/settings.ts](src/settings.ts).  When we are happy with them, we can set frameCapture to true in order to generate the animation.

# Frame capture

When running the web-application in frameCapture mode, we only see one of the three layers of animation at a time.  Once the third cycle is complete, it might appear to start again, but in the background a zip file containing frames of animation is being generated.  When this is ready, the browser will "download" a file called `frames.zip`.

`frame.zip` must be placed in the `dist` directory in order to trigger the post-processing steps.  This is the only part of the animation generation process which is not automated.

# Post-processing

Unfortunately the post-processing is slower than desired.  It changes the hue of frames containing flames, and composites the three layers of animation together, finally generating a `baphomation.mp4` video file from the frames.

# Root directory

The contents of the root directory of this repository are as follows

* `dist` - All content which is generated by, but not part of this repository lives here.  Therefore it is also the directory which you should delete, if at any point you should feel the need to 'clean' the build and start again.
* [gulp](./gulp) - Some tools to help with the workflow automation live here.
* [model](./model) - The pre-processing (which generates some geometry upfront) lives here.
* `node_modules` - The package dependencies live here.
* [processing](./processing) - The post-processing lives here.
* [src](./src) - The web-application lives here.
* [gulpfile.ts](./gulpfile.ts) - This is the script which automates the pre-processing and post-processing workflows.
* [package.json](./package.json) - Defines package dependencies and npm scripts.

# Package dependencies

In the hope of making them slightly easier to understand, the package dependencies in [package.json](./package.json) are listed here by category.

## Web frameworks

* three
* three-js-csg 
* react
* react-dom
* react-three-fiber

## Serving web content

* parcel
* parcel-bundler

## Post-processing

* canvas
* ffmpeg-static
* jsdom
* jsdom-global
* p5
* pngjs
 
## Workflow automation

* gulp
* gulp-noop
* gulp-run
* npm-run-all
* rimraf

## TypeScript and type definitions

* @types/file-saver
* @types/gulp
* @types/lodash
* @types/node
* @types/p-limit
* @types/p5
* @types/pngjs
* @types/react
* @types/react-dom
* ts-node
* typescript

## Code formatting

* @typescript-eslint/eslint-plugin
* @typescript-eslint/parser
* eslint
* eslint-plugin-immutable
* eslint-plugin-no-mixed-operators
* prettier

## Misc

* file-saver
* extract-zip
* jszip
* lodash
* p-limit

