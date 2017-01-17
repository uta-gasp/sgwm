# SGWM.js

A JavaScript library to map fixations to text (words).

## Install

    npm install --save-dev git://github.com/uta-gasp/sgwm.git

The library files are located in the `sgwm/build` folder.

## Usage

    const SGWM = require( 'sgwm' );
    const sgwm = new SGWM();

    const { fixations, text } = sgwm.map( { 
        fixations: [
            {ts: 10000, x: 150, y: 100, duration: 300 },
            ...
        ], words: [
            {x: 100, y: 100, width: 120, height: 18, text: 'gaze-awareness'},
            ...
        ]
    });

The returned `fixations` array stores copies of the original fixations, some probably removed or modified, where each fixation, if mapped to some word,  complemened with `line` property indicating the line index and `word` property containing an object `{left, top, right, bottom, text, index, index, id}` where `index` is the word index in the given line and `id` is its index in the text. 

The returned `text` object has `words` property, an array corresponding to the input words array. Each word may have additional property `fixations` which is the array of fixations (refs to the items in the returned `fixations` array) mapped onto this word. The object also has some other properties like `lines`, the array of arrays of words.

## Modification

First, download the package

    git clone https://github.com/uta-gasp/sgwm.git

If webpack (version 1.x) is not installed globally, install it:

    npm install -g webpack@">=1.0.0 <2.0.0"

Then install dependencies

    cd sgwm
    npm install

Make changes, then test that mapping work at least not worse that it was:

    npm test

Write more tests to check the new functionality.

### Building for Web

Run

    webpack

to create `build/sgwm.js` or

    NODE_ENV=production webpack 

to create `build/sgwm.min.js`.

Ensure that library is valid by running the static server:

    npm install -g node-static
    static

in the project root folder and opening the file `127.0.0.1:8080/test/sgwm.html` in a browser: all tests should have 'success' text.

### Building for NodeJS

If you need to build the CommonJS module (say, to use in NodeJS app), then add `TYPE=node` before `webpack`:

    [NODE_ENV=production] TYPE=node webpack 

This will create `build/sgwm.module.js` or `build/sgwm.module.min.js` file.
