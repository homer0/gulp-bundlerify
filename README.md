# gulp-bundlerify

_(gulp-)_ Bundlerify it's something between a generator and a boilerplate for ES6 projects.

[![Build Status](https://travis-ci.org/homer0/gulp-bundlerify.svg?branch=master)](https://travis-ci.org/homer0/gulp-bundlerify) [![Coverage Status](https://coveralls.io/repos/homer0/gulp-bundlerify/badge.svg?branch=master&service=github)](https://coveralls.io/github/homer0/gulp-bundlerify?branch=master) [![Documentation Status](https://doc.esdoc.org/github.com/homer0/gulp-bundlerify/badge.svg)](https://doc.esdoc.org/github.com/homer0/gulp-bundlerify/) [![Dependencies status](https://david-dm.org/homer0/gulp-bundlerify.svg)](https://david-dm.org/homer0/gulp-bundlerify)



It uses [Browserify](http://browserify.org/), [Babel](http://babeljs.io), [Watchify](https://github.com/substack/watchify) and [BrowserSync](http://www.browsersync.io) (among others) to build your ES6 project with just a couple of lines, but at the same time, it's also highly customizable: You can inject your own dependencies and tasks very easily.

I now it's nothing new and special, but every time I started a new project I had 3 issues:

- I don't like generators that add a LOT of code to your `gulpfile.js`.
- Most of the time (more now that I try to use ES6 for everything) I need the same tools: [Babel](http://babeljs.io), [ESLint](http://eslint.org), [ESDoc](http://esdoc.org), [Browserify](http://browserify.org/), etc.). And I think the only thing it changes between project it's the project file, so it's always the same settings and tasks.
- Sometimes, when using a `gulp-` version of a tool, the author doesn't update the dependencies often, and if I need a new feature or a bug fix, I have to wait... or fork and fix.

Well, the solution:

- Bundlerify it's a plugin, you import it, set the settings you want and done.
- Most of the default settings align with what most tutorials and examples use.
- You can inject your own dependencies.

## Information

| -            | -                                                                |
|--------------|------------------------------------------------------------------|
| Package      | gulp-bundlerify                                                  |
| Description  | Something between a generator and a boilerplate for ES6 projects |
| Node Version | >= v0.12.6 (You need >= v4.0.0 for the tests)                    |


## Installation
You can install gulp-bundlerify using [npm](https://www.npmjs.com/).

    npm install gulp-bundlerify --save_dev
    npm install babel-preset-es2015 --save_dev

Yes, you need to install an extra package, because since version `6.0`, Babel requires this package to compile your code `ES5` compatible, and, for some reason, it can't be used from inside Bundlerify.

## Usage

```javascript
// Import your Gulp
const gulp = require('gulp');
// Import Bundlerify
const Bundlerify = require('gulp-bundlerify');

// Create the instance and call the .tasks() method.
new Bundlerify(gulp, {
    mainFile: './demo/index.js',
    browserSyncBaseDir: './demo/',
}).tasks();
```

Just with that you have all the tasks Bundlerify adds and the basic settings to run your project:

- `build`: Use Browserify and Babel to create a your build.
- `serve`: Watch your Browserify build and run BrowserSync in your demo folder.
- `lint`: Run JSCS and ESLint for your project.
- `docs`: It will generate your project documentation using ESDoc.
- `clean`: Deletes the distribution directory.

Ok, that's just the basic usage, now lets review all the possible settings...

### Build generation

```javascript
new Bundlerify(gulp, {
    mainFile: './index.js',
    dist: {
        file: 'build.js',
        dir: './dist/'
    },
}).tasks();
```

- `mainFile`: The file from which the build will be generated.
- `dist.file`: The distribution file that Browserify will generate.
- `dist.dir`: The directory where the distribution file will be saved.

### Watchify options

```javascript
new Bundlerify(gulp, {
    watchifyOptions: {
        debug: true,
        fullPaths: true,
    },
}).tasks();
```

- `watchifyOptions`: This entire object is used when both Browserify and Watchify are instantiated.
- `watchifyOptions.debug`: Enables source maps to be generated.
- `watchifyOptions.fullPaths`: Preserves the modules full paths on the build.

[Browserify docs](https://github.com/substack/node-browserify#usage)

### BrowserSync options

```javascript
new Bundlerify(gulp, {
    browserSyncOptions: {
        server: {
            baseDir: './',
            directory: true,
            index: 'index.html',
            routes: {
                '/src/': './src/',
                '/dist/': './dist/',
            },
        },
    }
}).tasks();
```

- `browserSyncOptions`: This entire object is sent to BrowserSync when instantiated.
- `browserSyncOptions.server`: These are the settings for your test server.
- `browserSyncOptions.server.baseDir`: The root directory for your test server.
- `browserSyncOptions.server.directory`: A flag for the server to show a directory index.
- `browserSyncOptions.server.index`: The name of the index file for the directories.
- `browserSyncOptions.server.routes`: Special route aliases for the server. A special note about this setting is that Bundlerify will generate an extra route for the distribution directory.

[BrowserSync docs](http://www.browsersync.io/docs/options/)

### Babelify options

```javascript
new Bundlerify(gulp, {
    babelifyOptions: {
        presets: ['es2015'],
    },
}).tasks();
```

- `babelifyOptions`: The object sent to the Babelify transformer.
- `babelifyOptions.presets`: The preset used when the code is compiled. A **special note** about this is that the preset should be installed by your project, because Babel can't find otherwise.

[Babelify docs](https://github.com/babel/babelify)

### Polyfills

```javascript
new Bundlerify(gulp, {
    polyfillsEnabled: false,
    polyfills: [
        'whatwg-fetch/fetch',
        'core-js/fn/symbol',
        'core-js/fn/promise',
    ],
}).tasks();
```

- `polyfillsEnabled`: This enables/disables the inclusion of polyfills in your build.
- `polyfills`: A list of polyfills modules that should be added to your build. As you can see, it includes `fetch`, `symbol` and `promise` as default.

### Uglify

```javascript
new Bundlerify(gulp, {
    uglify: false,
}).tasks();
```

- `uglify`: A simple flag to tell Bundlerify if it should uglify the build or not.

### Lint

```javascript
new Bundlerify(gulp, {
    lint: {
        jscs: true,
        eslint: true,
        target: ['./src/**/*.js'],
    }
}).tasks();
```
- `lint.jscs`: If your code should be analyzed with JSCS or not.
- `lint.eslint`: If your code should be analyzed with ESLint or not.
- `lint.target`: A glob or an array of globs that will be analyzed. Glob refers to [node-glob syntax](https://github.com/isaacs/node-glob) or it can be a direct file path.

### Docs

```javascript
new Bundlerify(gulp, {
    esdocOptions: {
        source: './src',
        destination: './docs',
        plugins: [
            {name: 'esdoc-es7-plugin'},
        ],
    }
}).tasks();
```

- `esdocOptions`: This entire object will be sent to the ESDoc generator.
- `esdocOptions.source`: The directory where the documented files are.
- `esdocOptions.destination`: The directory where the docs will be generated.
- `esdocOptions.plugins`: A list of plugins for the ESDoc generator. In this case, it just uses the one for the ES6 syntax.

[ESDoc docs](https://esdoc.org/api.html) (:P)

### Tasks

```javascript
new Bundlerify(gulp, {
    tasks: {
        serve: 'server',
        lint: {
            name: 'linter',
            deps: ['clean'],
        },
        build: {
            name: 'builder',
            deps: ['super-clean', 'mega-clean'],
            method: (task, callback) => {
                doSomething();
                task();
                callback();
            },
        },
        docs: false,
    },
}).tasks();
```

The tasks setting is, maybe, the "most" complex of the settings, but allows you to customize **everything** related to the tasks Bundlerify creates.

This setting is an object with six keys, one per each task Bundlerify creates: `build`, `serve`, `clean`, `lint` and `docs` (you can see a brief description of each one at the beginning of this section); and you can do four things with the tasks:

#### - Disable

To disable a task, you just set the value of its key to `false`:

```javascript
new Bundlerify(gulp, {
    tasks: {
        docs: false,
    },
}).tasks();
```

#### - Rename

You have two ways of doing this: You can set the value of its key to the new name:

```javascript
new Bundlerify(gulp, {
    tasks: {
        docs: 'documentation',
    },
}).tasks();
```

Or you can use an object with the `name` key on it.

```javascript
new Bundlerify(gulp, {
    tasks: {
        docs: {
            name: 'doc-build',
        },
    },
}).tasks();
```

#### - Adding dependencies

If you want to add extra dependencies tasks to one of Bundlerify tasks, you can use an object with the `deps` keys:

```javascript
new Bundlerify(gulp, {
    tasks: {
        docs: {
            deps: ['some-dependant-task'],
        },
    },
}).tasks();
```

#### - Overwriting the task functionality

If you want to change the way the task works, you can use an object with the key `method` for a `function` that receives two arguments: The original task function and the callback function the Gulp task sends.

```javascript
new Bundlerify(gulp, {
    tasks: {
        build: {
            method: (task, callback) => {
                doSomething();
                task();
                callback();
            },
        },
    },
}).tasks();
```

### Dependencies

Bundlerify uses **thirteen**(*) module dependencies and each and every one of them can be overwritten with a simple getter method.

#### 1 - [Watchify](https://www.npmjs.com/package/watchify)

This is used to update your Browserify build any time you make a change. This plays along with BrowserSync perfectly :). You can inject your own version by doing this:

```javascript
const b = new Bundlerify(gulp);
b.watchify = myCustomWatchify;
```

#### 2 - [Browserify](https://www.npmjs.com/package/browserify)

This generates one single build package with all the required modules of your project. You can inject your own version by doing this:

```javascript
const b = new Bundlerify(gulp);
b.browserify = myCustomBrowserify;
```

#### 3 - [Babelify](https://www.npmjs.com/package/babelify)

It transforms your ES6 code with [Babel](https://babeljs.io) so Browserify can create a build. You can inject your own version by doing this:

```javascript
const b = new Bundlerify(gulp);
b.babelify = myCustomBabelify;
```

#### 4 - [vinyl-source-stream](https://www.npmjs.com/package/vinyl-source-stream)

Creates a text stream of the Browserify build so it can be modified on the Gulp pipe. You can inject your own version by doing this:

```javascript
const b = new Bundlerify(gulp);
b.vinylSourceStream = myCustomVinylSourceStream;
```

#### 5 - [BrowserSync](https://www.npmjs.com/package/browser-sync)

Creates a test server for your project and refreshes the page every time your build it's updated (which is updated thanks to Watchify). You can inject your own version by doing this:

```javascript
const b = new Bundlerify(gulp);
b.browserSync = myCustomBrowserSync;
```

#### 6 - [rimraf](https://www.npmjs.com/package/rimraf)

It's the node version of `rm -rf ...` and it's used to clean the distribution directory before doing a new build. You can inject your own version by doing this:

```javascript
const b = new Bundlerify(gulp);
b.rimraf = myCustomRimRaf;
```

#### 7 - [gulp-util](https://www.npmjs.com/package/gulp-util)

A set of utility function for Gulp. Bundlerify uses it to log Gulp-like errors on the console. You can inject your own version by doing this:

```javascript
const b = new Bundlerify(gulp);
b.gulpUtil = myCustomGulpUtil;
```

#### 8 - [gulp-if](https://www.npmjs.com/package/gulp-if)

A utility module that runs in the pipe and execute some actions depending on a boolean balue... an `if` for `.pipe`. You can inject your own version by doing this:

```javascript
const b = new Bundlerify(gulp);
b.gulpIf = myCustomGulpIf;
```

#### 9 - [gulp-streamify](https://www.npmjs.com/package/gulp-streamify)

Force some plugins to work with Gulp streams. Bundlerify uses it for `gulp-uglify`. You can inject your own version by doing this:

```javascript
const b = new Bundlerify(gulp);
b.gulpStreamify = myCustomGulpStreamify;
```

#### 10 - [gulp-uglify](https://www.npmjs.com/package/gulp-uglify)

Minifies and uglifies the build file. You can inject your own version by doing this:

```javascript
const b = new Bundlerify(gulp);
b.gulpUglify = myCustomGulpUglify;
```

#### 11 - [gulp-jscs](https://www.npmjs.com/package/gulp-jscs)

Lint your project with JSCS. You can inject your own version by doing this:

```javascript
const b = new Bundlerify(gulp);
b.gulpJSCS = myCustomGulpJSCS;
```

#### 12 - [gulp-eslint](https://www.npmjs.com/package/gulp-eslint)

Lint your project with ESLint. You can inject your own version by doing this:

```javascript
const b = new Bundlerify(gulp);
b.gulpESLint = myCustomGulpESLint;
```

#### 13 - [ESDoc](https://www.npmjs.com/package/esdoc)

Generates your project documentation. You can inject your own version by doing this:

```javascript
const b = new Bundlerify(gulp);
b.esdoc = myCustomESDoc;
```

ESdoc it's special because it also uses a publisher module, and by default, Bundlerify requires the one inside the ESDoc package (`esdoc/out/src/Publisher/publish` but you can inject your own version by doing this:

```javascript
const b = new Bundlerify(gulp);
esdocPublisher = myCustomESDocPublisher;
```
#### *: Note

There are three other dependencies that can't be "injected", but that's because the Bundlerify doesn't use them directly:

- [esdoc-es7-plugin](https://www.npmjs.com/package/esdoc-es7-plugin): The ESDoc plugin for ES6/7 syntax. You can change it on the settings: `esdocOptions.plugins`. Check the **Docs** part under **Usage**.
- [whatwg-fetch](https://www.npmjs.com/package/whatwg-fetch): The `Fetch` polyfill for old browsers. You can edit the `polyfills` setting to remove it from the list.
- [core-js](https://www.npmjs.com/package/core-js): More Polyfills, Bundlerify uses two from by this package: `Symbol` and `Promise`, and like with `Fetch`, you can edit the `polyfills` setting to remove them.

## Development

### Install Git hooks

    ./hooks/install

### npm tasks

- `npm run build`: Generate a new build of the plugin.
- `npm test`: Run the plugin's unit tests.
- `npm run coverage`: Run the unit tests and open the coverage report on the browser.
- `npm run lint`: Lint the plugin's code with JSCS and ESLint.
- `npm run docs`: Generate the project documentation.

## License

MIT. [License file](./LICENSE).
