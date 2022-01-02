# Baphomation

A short animation featuring [Baphomet](https://en.wikipedia.org/wiki/Baphomet) and a segment of a well known ritual.  Primarily made with [ThreeJS](https://threejs.org/).  Programming language is TypeScript.  Baphomation is a portmanteau of Baphomet and Animation.

# Live demo

See the animation here

https://hornegg.github.io/baphomation/dist/

# Getting started

This is a standard nodejs/npm project hosted in a git repository.  As such, the commands for getting started are:

```
git clone https://github.com/hornegg/baphomation.git
cd baphomation
npm install
npm start
```

The `npm start` command runs the parcel web-application bundler.  The web application can then be reached by opening a web browser at this address:

http://localhost:1234/index.html

# Web application

In the web-application we see an approximation to the finished animation.  The minor difference is that the flames have been thinned out to help the performance get closer to the correct animation speed.

# src/settings.ts

All the most important configuration settings are in [src/settings.ts](src/settings.ts).  When we are happy with them, we can set frameCapture to true in order to generate the animation.

# Frame capture

Set frameCapture to true, and run the animation as usual.  Once the first cycle is complete, in the background a zip file containing frames of animation is being generated.  When this is ready, the browser will "download" a file called `frames.zip`.  The animation might cycle round an additional two or three times before this happens.

# Generating a video file

`frames.zip` simply contains a .png file for each frame of the animation.  Any approach for converting this to a video file is
fine, but the one provided is to place `frames.zip` in the `dist` directory, then run `npm run ffmpeg`.  This generates a `baphomation.mp4` video file from the frames.

For some weird reason this file does not work universally on all media players.  Fortunately [VLC](https://www.videolan.org/) is
able to play it, and convert it to a file does appear to work properly on other players.

# Package dependencies

In the hope of making them slightly easier to understand, the package dependencies in [package.json](./package.json) are listed here by category.

## 3D Graphics

* three

## 2D Graphics (used for lettering)

* p5

## Serving web content

* parcel
* @parcel/transformer-glsl
* @parcel/transformer-image

## Frame capture

* file-saver
* jszip

## Video generation

* ffmpeg-static
* rimraf
* extract-zip
 
## TypeScript and type definitions

* @types/file-saver
* @types/node
* @types/p5
* ts-node
* typescript

## Code formatting

* @typescript-eslint/eslint-plugin
* @typescript-eslint/parser
* eslint
* eslint-plugin-functional
* eslint-plugin-immutable
* eslint-plugin-no-mixed-operators
* prettier

