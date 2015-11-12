# gulp-bundlerify

_(gulp-)_ Bundlerify it's something between a generator and a boilerplate for ES6 projects.

[![Build Status](https://travis-ci.org/homer0/gulp-bundlerify.svg?branch=master)](https://travis-ci.org/homer0/gulp-bundlerify) [![Coverage Status](https://coveralls.io/repos/homer0/gulp-bundlerify/badge.svg?branch=master&service=github)](https://coveralls.io/github/homer0/gulp-bundlerify?branch=master) [![Documentation Status](https://doc.esdoc.org/github.com/homer0/gulp-bundlerify/badge.svg)](https://doc.esdoc.org/github.com/homer0/gulp-bundlerify/) [![Dependencies status](https://david-dm.org/homer0/gulp-bundlerify.svg)](https://david-dm.org/homer0/gulp-bundlerify) [![Dev dependencies status](https://david-dm.org/homer0/gulp-bundlerify/dev-status.svg)](https://david-dm.org/homer0/gulp-bundlerify#info=devDependencies)



It uses [Browserify](http://browserify.org/), [Babel](http://babeljs.io), [Watchify](https://github.com/substack/watchify) and [BrowserSync](http://www.browsersync.io) (among others) to build your ES6 project with just a couple of lines, but at the same time, it's also highly customizable: You can inject your own dependencies and tasks very easily.

I now it's nothing new or special, but every time I started a new project I had 3 issues:

- I don't like generators that add a LOT of code to your `gulpfile.js`.
- Most of the time (more now that I try to use ES6 for everything) I need the same tools: [Babel](http://babeljs.io), [ESLint](http://eslint.org), [ESDoc](http://esdoc.org), [Browserify](http://browserify.org/), etc.). And I think the only thing it changes between project it's the project file, so it's always the same settings and tasks.
- Sometimes, when using a `gulp-` version of a tool, the author doesn't update the dependencies often, and if I need a new feature or a bug fix, I have to wait... or fork and fix.

Well, the solution:

- Bundlerify it's a plugin, you import it, set the settings you want and done.
- Almost all of the default settings align with what most tutorials and examples use.
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
- `uploadDocs`: Connects with the [ESDoc Hosting API](https://doc.esdoc.org) and generates your documentation.
- `clean`: Deletes the distribution directory.
- `es5`: Instead of making a build with Browserify, compile all the files to ES5.
- `cleanEs5`: Deletes the ES5 directory.
- `test`: Run unit tests with Jest.

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

### Compile to ES5

```javascript
new Bundlerify(gulp, {
    es5: {
        origin: './src/**/*',
        dir: './es5/',
    },
}).tasks();
```

- `es5.origin`: A glob or an array of globs for files that will be compiled. Glob refers to [node-glob syntax](https://github.com/isaacs/node-glob) or it can be a direct file path.
- `es5.dir`: The directory where the ES5 files will be saved.

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
- `lint.jscs`: If your code should be analyzed with [JSCS](http://jscs.info) or not.
- `lint.eslint`: If your code should be analyzed with [ESLint](http://eslint.org) or not.
- `lint.target`: A glob or an array of globs that will be analyzed. Glob refers to [node-glob syntax](https://github.com/isaacs/node-glob) or it can be a direct file path.

Check the **Extras** section for more information about [JSCS](http://jscs.info) and [ESLint](http://eslint.org).

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

If you have your ESDoc configuration on a `esdoc.json`, you can tell Bundlerify to get your settings from there by giving the name of your file to the `esdocOptions` key:

```javascript
new Bundlerify(gulp, {
    esdocOptions: 'esdoc.json'
}).tasks();
```

**Note:** You'll need to have an `esdoc.json` file if you want to use the `uploadDocs` task.

Check the **Extras** section for more information about [ESDoc](https://esdoc.org).

[ESDoc docs](https://esdoc.org/api.html) (:P)

### Unit testing

```javascript
new Bundlerify(gulp, {
    jestOptions: {
        target: '.',
        collectCoverage: true,
        preprocessorIgnorePatterns: ['/node_modules/', '/dist/', '/es5/']
    }
}).tasks();
```

- `jestOptions`: This entire object will be set as the Jest configuration.
- `jestOptions.target`: **This is the most important property**, because it's not a default from the Jest configuration but a it's the path this plugin uses to get the files that are going to be sent to Jest.
- `jestOptions.collectCoverage`: A flag to know if code coverage should be generated from your tests.
- `jestOptions.preprocessorIgnorePatterns`: A list of directories and/or files that should be ignored by the preprocessor.

Two things to have in mind while using this:

- Bundlerify uses the [babel-jest](https://github.com/babel/babel-jest) preprocessor by default, and it's located inside the plugin. If you want to change it, you can use the `scriptPreprocessor` setting and set the path to your preprocessor.
- Instead of using an object for the `jestOptions`, you can tell Bundlerify to get your settings from a file by just using it's name as value:

```javascript
new Bundlerify(gulp, {
    jestOptions: 'jest.json'
}).tasks();
```

And if you are migrating and you already have your Jest settings in your `package.json`, no problem! Bundlerify will automatically detect it and extract your settings from the `jest` property:

```javascript
{
    "name": "gulp-bundlerify",
    "repository": "homer0/gulp-bundlerify",
    "license": "MIT",
    "jest": {
        "collectCoverage": true,
        "collectCoverageOnlyFrom": {
            "src/index.js" : true
        },
    },
    "main": "dist/index.js"
}
```

and...

```javascript
new Bundlerify(gulp, {
    jestOptions: 'package.json'
}).tasks();
```

[Jest docs](https://facebook.github.io/jest/docs/api.html)

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

This setting is an object with six keys, one per each task Bundlerify creates: `build`, `serve`, `clean`, `lint`, `es5`, `cleanEs5` and `docs` (you can see a brief description of each one at the beginning of this section); and you can do four things with the tasks:

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

#### - Adding task dependencies

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

### Running a callback before every task

```javascript
new Bundlerify(gulp, {
    beforeTask: (task, instance) => {
        // ... do something
    }
}).tasks();
```

This is a utility callback that runs before executing every task. It can be used to change the instance settings depending on the task that it's about to run.

### Dependencies

Bundlerify uses **seventeen**(*) module dependencies and each and every one of them can be overwritten with a simple getter method.

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

It transforms your ES6 code with [Babel](https://babeljs.io) so Browserify can create a build. Babelify it's also used with [vinyl-transform](https://www.npmjs.com/package/vinyl-transform) by the `es5` task to compile the separated files. You can inject your own version by doing this:

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

#### 5 - [vinyl-transform](https://www.npmjs.com/package/vinyl-transform)

Allows the use of a Browserify transform plugins on a regular Gulp stream, and thanks to that, Bundlerify can _re use_ Babelify to compile each individual file with the `es5` task. You can inject your own version by doing this:

```javascript
const b = new Bundlerify(gulp);
b.vinylTransform = myCustomVinylTransform;
```

#### 6 - [BrowserSync](https://www.npmjs.com/package/browser-sync)

Creates a test server for your project and refreshes the page every time your build it's updated (which is updated thanks to Watchify). You can inject your own version by doing this:

```javascript
const b = new Bundlerify(gulp);
b.browserSync = myCustomBrowserSync;
```

#### 7 - [rimraf](https://www.npmjs.com/package/rimraf)

It's the node version of `rm -rf ...` and it's used to clean the distribution directory before doing a new build. You can inject your own version by doing this:

```javascript
const b = new Bundlerify(gulp);
b.rimraf = myCustomRimRaf;
```

#### 8 - [gulp-util](https://www.npmjs.com/package/gulp-util)

A set of utility function for Gulp. Bundlerify uses it to log Gulp-like errors on the console. You can inject your own version by doing this:

```javascript
const b = new Bundlerify(gulp);
b.gulpUtil = myCustomGulpUtil;
```

#### 9 - [gulp-if](https://www.npmjs.com/package/gulp-if)

A utility module that runs in the pipe and execute some actions depending on a boolean balue... an `if` for `.pipe`. You can inject your own version by doing this:

```javascript
const b = new Bundlerify(gulp);
b.gulpIf = myCustomGulpIf;
```

#### 10 - [gulp-streamify](https://www.npmjs.com/package/gulp-streamify)

Force some plugins to work with Gulp streams. Bundlerify uses it for `gulp-uglify`. You can inject your own version by doing this:

```javascript
const b = new Bundlerify(gulp);
b.gulpStreamify = myCustomGulpStreamify;
```

#### 11 - [gulp-uglify](https://www.npmjs.com/package/gulp-uglify)

Minifies and uglifies the build file. You can inject your own version by doing this:

```javascript
const b = new Bundlerify(gulp);
b.gulpUglify = myCustomGulpUglify;
```

#### 12 - [gulp-jscs](https://www.npmjs.com/package/gulp-jscs)

Lint your project with JSCS. You can inject your own version by doing this:

```javascript
const b = new Bundlerify(gulp);
b.gulpJSCS = myCustomGulpJSCS;
```

#### 13 - [gulp-eslint](https://www.npmjs.com/package/gulp-eslint)

Lint your project with ESLint. You can inject your own version by doing this:

```javascript
const b = new Bundlerify(gulp);
b.gulpESLint = myCustomGulpESLint;
```

#### 14 - [ESDoc](https://www.npmjs.com/package/esdoc)

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

### 15 - [esdoc-uploader](https://www.npmjs.com/package/esdoc-uploader)

This is a plugin I made and that allows Bundlerify to connect with the [ESDoc Hosting API](https://doc.esdoc.org) in order to generate your project documentation. You can inject your own version by doing this:

```javascript
const b = new Bundlerify(gulp);
b.esdocUploader = myCustomUploader;
```

### 16 - [jest-cli](https://www.npmjs.com/package/jest-cli)

Runs your unit tests suite. You can inject your own version by doing this:

```javascript
const b = new Bundlerify(gulp);
b.jest = myCustomJest;
```

### 17 - [through2](https://www.npmjs.com/package/through2)

A wrapper for streams that allows the plugin to run `jest-cli` with a stream rather than running the `cli` command. You can inject your own version by doing this:

```javascript
const b = new Bundlerify(gulp);
b.through = myCustomThrough;
```


#### *: Note

There are five other dependencies that can't be "injected", but that's because the Bundlerify doesn't use them directly:

- [esdoc-es7-plugin](https://www.npmjs.com/package/esdoc-es7-plugin): The ESDoc plugin for ES6/7 syntax. You can change it on the settings: `esdocOptions.plugins`. Check the **Docs** part under **Usage**.
- [babel-eslint](https://github.com/babel/babel-eslint): The ESLint plugin for Babel. You can change it on your `.eslintrc` configuration file.
- [whatwg-fetch](https://www.npmjs.com/package/whatwg-fetch): The `Fetch` polyfill for old browsers. You can edit the `polyfills` setting to remove it from the list.
- [core-js](https://www.npmjs.com/package/core-js): More Polyfills, Bundlerify uses two from by this package: `Symbol` and `Promise`, and like with `Fetch`, you can edit the `polyfills` setting to remove them.
- [babel-jest](https://www.npmjs.com/package/babel-jest): The preprocessor the plugin uses to compile your code and tests when running the `test` task. You can specify your own preprocessor with the `jestOption. scriptPreprocessor` setting. Check the **Unit testing** part under **Usage**.

## Extras

### JSCS

> JSCS is a code style linter for programmatically enforcing your style guide. You can configure JSCS for your project in detail using over 150 validation rules, including presets from popular style guides like jQuery, Airbnb, Google, and more.

If you want a quick start, you can copy the [.jscscr](./.jscsrc) file from this repository and put it on the root of your project, then just run the `lint` task.
Feel free to modify your `.jscsrc` with your own rules and presets.

[JSCS overview](http://jscs.info/overview).

#### ESLint

> The pluggable linting utility for JavaScript and JSX.

The short version, it's like JSHint, but it supports plugins :). Like with JSCS, you can copy the [.eslintrc](./.eslintrc) file from this repository and run the `lint` task.

#### ESDoc

> ESDoc is a documentation generator for JavaScript(ES6).

that pretty much sums it up, it's a doc generator. Unlike `JSCS` and `ESLint`, you don't _necessarily_ need an `.esdocrc` file, well it uses an `esdoc.json`, but you can set the configuration using the Bundlerify `esdocOptions` setting option. As mentioned on the **Docs** section of this file, if you need/use an external file for the configuration, you can give Bundlerify the name of your file as value for `esdocOptions` and it will automatically retrieve those values.

#### Jest

> Painless JavaScript Unit Testing

Jest is a unit tests suite Facebook built on top of [Jasmine](jasmine.github.io) and that it's intended to test ES6 and React applications. It's really easy to configure and as you may noticed, Bundlerify not only provides support for your project Jest tests, but it also uses itself for its own unit tests.

## Development

### Install Git hooks

    ./hooks/install

### npm tasks

- `npm run build`: Generate a new build of the plugin.
- `npm test`: Run the plugin's unit tests.
- `npm run coverage`: Run the unit tests and open the coverage report on the browser.
- `npm run lint`: Lint the plugin's code with JSCS and ESLint.
- `npm run docs`: Generate the project documentation.

## Version History

#### 1.0.2

- Added compatibility with node `v0.12.6`.
- Better organization of the dependencies and development dependencies on the `package.json`.
- Updated the `README` with more information about dependencies, ESLint, JSCS and ESDoc.
- Included a version history on the `README`.

#### 1.0.0 and 1.0.1
Initial version. The reason I made an empty release was because I published it to early in [npmjs](http://npmjs.com) and I needed to refresh it.

## License

MIT. [License file](./LICENSE).
