'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/**
 * Bundlerify it's something between a generator and a boilerplate for ES6 projects.
 * It uses Browserify, Babel, Watchify and BrowserSync, among others, to build your project with
 * just a couple of lines, but at the same time, it's also highly customizable: You can inject
 * your own dependencies and tasks.
 * @version 1.0.2
 */

var Bundlerify = (function () {
    /**
     * Create a new instance of the plugin.
     * @example
     * const gulp = require('gulp');
     *
     * // Instantiate with the default settings.
     * const instanceOne = new Bundlerify(gulp);
     *
     * // Instantiate with custom settings.
     * const instanceTwo = new Bundlerify(gulp, {
     *     mainFile: './myApp/index.js',
     *     watchifyOptions: {
     *         debug: false,
     *     },
     * });
     *
     * // Instantiate with the entry file and the default settings
     * const instanceThree = new Bundlerify(gulp, './myApp/index.js');
     *
     * // Instantiate with shorthand settings
     * const instanceThree = new Bundlerify(gulp, {
     *     watchifyDebug: false, // alias for `.watchifyOptions.debug = false`
     *     browserSyncBaseDir: './', // alias for `.browserSyncOptions.server.baseDir = './'`
     *     browserSyncEnabled: false, // alias for `.browserSyncOptions.enabled = false`
     *     jscs: false, // alias for `.lint.jscs`
     *     eslint: false, // alias for `.lint.eslint`
     * });
     *
     * @param {Function}      gulp            - A reference to the main project's Gulp so the
     *                                          default tasks can be registered.
     * @param {Object|String} config          - If an object it's used, it will be merged with the
     *                                          default settings, but if a string it's used, it
     *                                          would be the same as using an Object with just the
     *                                          `mainFile` setting.
     * @public
     */

    function Bundlerify(gulp, _x) {
        _classCallCheck(this, Bundlerify);

        /**
         * A reference to the main project's Gulp.
         * @type {Function}
         */
        this.gulp = gulp;
        /**
         * We'll need path to resolve useful paths inside the plugin, like the absolute path to
         * `babel-jest`, or the list of files for the coverage report.
         */
        var path = require('path');
        /**
         * A few ID constants to be used inside the plugin.
         * @type {Object}
         * @private
         * @ignore
         */
        this._consts = {
            packageName: 'gulp-bundlerify',
            path: path.resolve('node_modules/gulp-bundlerify'),
            modules: path.resolve('node_modules')
        };
        /**
         * Detect the alternative method of initializing the plugin using just the
         * mainFile setting.
         */
        if (typeof config === 'string') {
            config = {
                mainFile: config
            };
        } else {
            config = this._expandShorthandSettings(this._mergeObjects({}, config));
        }
        /**
         * Checks if the ESDoc options should be read from a file.
         */
        if (typeof config.esdocOptions === 'string') {
            var esdocOptionsFile = require('fs').readFileSync(config.esdocOptions, 'utf-8');
            if (esdocOptionsFile) {
                config.esdocOptions = JSON.parse(esdocOptionsFile);
            } else {
                delete config.esdocOptions;
            }
        }
        /**
         * Checks if the Jest options should be read from a file.
         */
        if (typeof config.jestOptions === 'string') {
            var jestOptionsFilename = config.jestOptions;
            var jestOptionsFile = require('fs').readFileSync(jestOptionsFilename, 'utf-8');
            if (jestOptionsFile) {
                config.jestOptions = JSON.parse(jestOptionsFile);
                if (jestOptionsFilename === 'package.json') {
                    config.jestOptions = config.jestOptions.jest;
                }
            } else {
                delete config.jestOptions;
            }
        }
        /**
         * The Bundlerify main settings.
         * @type {Object}
         */
        this.config = this._mergeObjects({
            mainFile: './index.js',
            dist: {
                file: 'build.js',
                dir: './dist/'
            },
            es5: {
                origin: './src/**/*',
                dir: './es5/'
            },
            watchifyOptions: {
                debug: true,
                fullPaths: false
            },
            browserSyncOptions: {
                enabled: true,
                server: {
                    baseDir: './',
                    directory: false,
                    index: 'index.html',
                    routes: {
                        '/src/': './src/',
                        '/dist/': './dist/',
                        '/es5/': './es5/'
                    }
                }
            },
            babelifyOptions: {
                presets: ['es2015']
            },
            polyfillsEnabled: false,
            polyfills: ['whatwg-fetch/fetch', 'core-js/fn/symbol', 'core-js/fn/promise'],
            uglify: false,
            lint: {
                jscs: true,
                eslint: true,
                target: ['./src/**/*.js']
            },
            esdocOptions: {
                enabled: true,
                source: './src',
                destination: './docs',
                plugins: [{ name: 'esdoc-es7-plugin' }]
            },
            jestOptions: {
                target: '.',
                collectCoverage: true,
                scriptPreprocessor: this._consts.path + '/node_modules/babel-jest',
                preprocessorIgnorePatterns: ['/node_modules/', '/dist/', '/es5/'],
                testFileExtensions: ['es6', 'js', 'jsx'],
                moduleFileExtensions: ['js', 'json', 'jsx', 'es6']
            },
            tasks: {
                build: 'build',
                serve: 'serve',
                es5: 'es5',
                clean: 'clean',
                cleanEs5: 'cleanEs5',
                lint: 'lint',
                test: 'test',
                uploadDocs: 'uploadDocs',
                docs: 'docs'
            },
            beforeTask: function beforeTask() {}
        }, config);

        /**
         * If the Jest option `collectCoverageOnlyFrom` was used, this code will resolve the
         * absolute paths for those files.
         */
        if (this.config.jestOptions.collectCoverageOnlyFrom) {
            (function () {
                var newCoveragePaths = {};
                Object.keys(_this.config.jestOptions.collectCoverageOnlyFrom).forEach(function (file) {
                    newCoveragePaths[path.resolve(file)] = true;
                });

                _this.config.jestOptions.collectCoverageOnlyFrom = newCoveragePaths;
            })();
        }

        /**
         * Create a route for the distribution directory on the BrowserSync test server.
         */
        var distRoutePath = this.config.dist.dir;
        if (distRoutePath.substr(0, 1) === '.') {
            distRoutePath = distRoutePath.substr(1);
        }

        this.config.browserSyncOptions.server.routes[distRoutePath] = this.config.dist.dir;
        /**
         * The bundler object returned by Browserify or Watchify (depending on the task).
         * @type {Function}
         * @private
         * @ignore
         */
        this._bundler = null;
        /**
         * A custom version of Watchify that may be injected using the `watchify` setter.
         * @type {Function}
         * @private
         * @ignore
         */
        this._watchify = null;
        /**
         * A custom version of Browserify that may be injected using the `browserify` setter.
         * @type {Function}
         * @private
         * @ignore
         */
        this._browserify = null;
        /**
         * A custom version of Babelify that may be injected using the `babelify` setter.
         * @type {Function}
         * @private
         * @ignore
         */
        this._babelify = null;
        /**
         * A custom version of vinyl-source-stream that may be injected using the
         * `vinylSourceStream` setter.
         * @type {Function}
         * @private
         * @ignore
         */
        this._vinylSourceStream = null;
        /**
         * A custom version of vinyl-transform that may be injected using the `vinylTransform`
         * setter.
         * @type {Function}
         * @private
         * @ignore
         */
        this._vinylTransform = null;
        /**
         * A custom version of BrowserSync that may be injected using the `browserSync` setter.
         * @type {Function}
         * @private
         * @ignore
         */
        this._browserSync = null;
        /**
         * A custom version of rimraf that may be injected using the `rimraf` setter.
         * @type {Function}
         * @private
         * @ignore
         */
        this._rimraf = null;
        /**
         * A custom version of Gulp Util that may be injected using the `gulpUtil` setter.
         * @type {Function}
         * @private
         * @ignore
         */
        this._gulpUtil = null;
        /**
         * A custom version of gulp-if that may be injected using the `gulp-if` setter.
         * @type {Function}
         * @private
         * @ignore
         */
        this._gulpIf = null;
        /**
         * A custom version of gulp-streamify that may be injected using the `gulpStreamify`
         * setter.
         * @type {Function}
         * @private
         * @ignore
         */
        this._gulpStreamify = null;
        /**
         * A custom version of gulp-uglify that may be injected using the `gulpUglify` setter.
         * @type {Function}
         * @private
         * @ignore
         */
        this._gulpUglify = null;
        /**
         * A custom version of gulp-jscs that may be injected using the `gulpJSCS` setter.
         * @type {Function}
         * @private
         * @ignore
         */
        this._gulpJSCS = null;
        /**
         * A custom version of gulp-eslint that may be injected using the `gulpESLint` setter.
         * @type {Function}
         * @private
         * @ignore
         */
        this._gulpESLint = null;
        /**
         * A custom version of ESDoc that may be injected using the `esdoc` setter.
         * @type {Function}
         * @private
         * @ignore
         */
        this._esdoc = null;
        /**
         * A custom version of the ESDoc uploader that may be injected using the
         * `esdocUploader` setter.
         * @type {Function}
         * @private
         * @ignore
         */
        this._esdocUploader = null;
        /**
         * A custom version of the ESDoc Publisher that may be injected using the
         * `esdocPublisher` setter.
         * @type {Function}
         * @private
         * @ignore
         */
        this._esdocPublisher = null;
        /**
         * A custom version of Jest-cli that may be injected using the `jest` setter.
         * @type {Function}
         * @private
         * @ignore
         */
        this._jest = null;
        /**
         * A custom version of through2 that may be injected using the `through` setter.
         * @type {Function}
         * @private
         * @ignore
         */
        this._through = null;
        /**
         * A private flag to detect whether the bundler was created for a simple build (wrap with
         * Browserify) or for the watch (using Watchify).
         * @type {Boolean}
         * @private
         * @ignore
         */
        this._watch = true;
        /**
         * A dictionary that will store the dependencies modules that are not overwritten by the
         * dynamic setters.
         * @type {Object}
         * @private
         * @ignore
         */
        this._dependencies = {};
        /**
         * These are the default dependencies for the tasks generated by the plugin.
         * @type {Object}
         * @private
         * @ignore
         */
        this._tasksDependencies = {
            serve: ['build'],
            build: ['clean'],
            es5: ['cleanEs5']
        };
    }
    /**
     * Clean the build (dist) directory. This method it's called by the `clean` task, which is a
     * dependency of the `build` task.
     * @param {Function} [callback=null] - An optional callback sent by the Gulp task.
     */

    _createClass(Bundlerify, [{
        key: 'clean',
        value: function clean(_x2) {
            var callback = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

            this._beforeTask('clean');
            this._cleanDirectory(this.config.dist.dir, callback);
        }
        /**
         * Clean the ES5 output directory. This method it's called by the `cleanEs5` task, which is a
         * dependency of the `es5` task.
         * @param {Function} [callback=null] - An optional callback sent by the Gulp task.
         */

    }, {
        key: 'cleanEs5',
        value: function cleanEs5(_x3) {
            var callback = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

            this._beforeTask('cleanEs5');
            this._cleanDirectory(this.config.es5.dir, callback);
        }
        /**
         * Make a new build. This method it's called by the `build` task.
         * @return {Function} It returns the stream used to create and write the build.
         */

    }, {
        key: 'build',
        value: function build() {
            this._beforeTask('build');
            this._watch = false;
            return this._bundle();
        }
        /**
         * Start the BrowserSync server and the watch for any change in the build. This method it's
         * called by the `serve` task.
         * @return {Function} It returns the stream used to create and write the build.
         */

    }, {
        key: 'serve',
        value: function serve() {
            this._beforeTask('serve');
            this._watch = true;
            this._bundler = null;
            this.browserSync(this.config.browserSyncOptions);
            return this._bundle();
        }
        /**
         * Compile your project to ES5 using. This method it's called by the `es5` task.
         * @return {Function} It returns the stream used to compile the files.
         */

    }, {
        key: 'es5',
        value: function es5() {
            this._beforeTask('es5');
            return this.gulp.src(this.config.es5.origin).pipe(this.vinylTransform(this.babelify.configure(this.config.babelifyOptions))).pipe(this.gulpIf(this.config.uglify, this.gulpStreamify(this.gulpUglify()))).pipe(this.gulp.dest(this.config.es5.dir));
        }
        /**
         * Lint the project code. This method it's called by the `serve` task.
         * @return {Function} It returns the stream used to create and write the build.
         */

    }, {
        key: 'lint',
        value: function lint() {
            this._beforeTask('lint');
            return this.gulp.src(this.config.lint.target).pipe(this.gulpIf(this.config.lint.eslint, this.gulpESLint())).pipe(this.gulpIf(this.config.lint.eslint, this.gulpESLint.format())).pipe(this.gulpIf(this.config.lint.jscs, this.gulpJSCS()));
        }
        /**
         * Run the Jest tests from your project. This method it's called by the `test` task.
         * @return {Function} It returns the stream used to run Jest.
         */

    }, {
        key: 'test',
        value: function test() {
            var _this2 = this;

            this._beforeTask('test');
            var target = this.config.jestOptions.target;
            delete this.config.jestOptions.target;
            return this.gulp.src(target).pipe((function () {
                return _this2.through.obj((function (file, enc, callback) {
                    _this2.config.jestOptions.rootDir = _this2.config.jestOptions.rootDir || file.path;
                    _this2.jest.runCLI({
                        config: _this2.config.jestOptions
                    }, _this2.config.jestOptions.rootDir, (function (success) {
                        if (!success) {
                            _this2._logError(new Error('Tests failed'));
                        }

                        callback();
                    }).bind(_this2));
                }).bind(_this2));
            }).bind(this)());
        }
        /**
         * Generate the project documentation using ESDoc. This method it's called by the `docs` task.
         * @return {Function} The result of the ESDoc generator.
         */

    }, {
        key: 'docs',
        value: function docs() {
            this._beforeTask('docs');
            return this.esdoc.generate(this.config.esdocOptions, this.esdocPublisher);
        }
        /**
         * Connects with the [ESDoc hosting service](https://doc.esdoc.org/) API in order to generate
         * the documentation for your project. This method it's called by the `uploadDocs` task.
         * @param {Function} [callback=null] - An optional callback sent by the Gulp task.
         */

    }, {
        key: 'uploadDocs',
        value: function uploadDocs(_x4) {
            var callback = arguments.length <= 0 || arguments[0] === undefined ? null : arguments[0];

            this._beforeTask('uploadDocs');
            var uploader = new this.esdocUploader();
            if (uploader.canUpload()) {
                uploader.upload(function () {
                    // This callback can't receive the same arguments as the one for `.upload()`.
                    if (callback) {
                        callback();
                    }
                });
            }
        }
        /**
         * Register the plugin tasks on the main project's Gulp. Because it returns the instance
         * object, it can be used right after instantiating the plugin.
         * @example
         * const gulp = require('gulp');
         * const instance = new Bundlerify(gulp).tasks();
         *
         * @return {Bundlerify} The current instance of the object.
         */

    }, {
        key: 'tasks',
        value: function tasks() {
            var _this3 = this;

            Object.keys(this.config.tasks).forEach(function (name) {
                var task = _this3.config.tasks[name];
                if (task !== false) {
                    var defaultTaskDeps = _this3._tasksDependencies[name] || [];
                    if ((typeof task === 'undefined' ? 'undefined' : _typeof(task)) === 'object') {
                        var taskName = task.name || name;
                        var taskDeps = task.deps || [];
                        if (defaultTaskDeps.length) {
                            taskDeps = taskDeps.concat(defaultTaskDeps);
                        }

                        _this3.gulp.task(taskName, taskDeps, (function (callback) {
                            var result = null;
                            if (task.method) {
                                result = task.method(_this3[name].bind(_this3), callback);
                            } else {
                                result = _this3[name](callback);
                            }

                            return result;
                        }).bind(_this3));
                    } else {
                        _this3.gulp.task(name, defaultTaskDeps, (function (callback) {
                            return _this3[name](callback);
                        }).bind(_this3));
                    }
                }
            }, this);

            return this;
        }
        /**
         * Call the `beforeTask` config callback with the name/alias of a selected task.
         * @param  {String} taskName - The internal name of the task. It will automatically detect if
         *                             the name was changed from the config.
         * @private
         * @ignore
         */

    }, {
        key: '_beforeTask',
        value: function _beforeTask(taskName) {
            var task = this.config.tasks[taskName];
            var taskConfigName = '';
            if ((typeof task === 'undefined' ? 'undefined' : _typeof(task)) === 'object' && task.name) {
                taskConfigName = task.name;
            } else {
                taskConfigName = task;
            }

            this.config.beforeTask(taskConfigName, this);
        }
        /**
         * This method is called by the constructor and it's used to expand the shorthand settings.
         * @param  {Object} config - The original settings sent to the constructor.
         * @return {Object} The already parsed settings.
         * @private
         * @ignore
         */

    }, {
        key: '_expandShorthandSettings',
        value: function _expandShorthandSettings(config) {
            var _this4 = this;

            var shortSettings = {
                watchifyDebug: 'watchifyOptions/debug',
                browserSyncBaseDir: 'browserSyncOptions/server/baseDir',
                browserSyncEnabled: 'browserSyncOptions/enabled',
                jscs: 'lint/jscs',
                eslint: 'lint/eslint'
            };
            Object.keys(shortSettings).forEach(function (setting) {
                var shortValue = config[setting];
                if (typeof shortValue !== 'undefined') {
                    _this4._setValueAtObjectPath(config, shortSettings[setting], shortValue);
                    delete config[setting];
                }
            }, this);

            return config;
        }
        /**
         * It will merge a given list of Objects into a new one. It works recursively, so any "sub
         * objects" will also be merged. This method returns a new Object, so none of the targets will
         * be modified.
         * @example
         * const a = {
         *     b: 'c',
         *     d: {
         *         e: 'f',
         *         g: {
         *             h: ['i'],
         *         },
         *     },
         *     j: 'k',
         * };
         * const b = {
         *     j: 'key',
         *     d: {
         *         g: {
         *             h: ['x', 'y', 'z'],
         *             l: 'm',
         *         },
         *     },
         * };
         * // The result will be
         * // {
         * //     b: 'c',
         * //     d: {
         * //         e: 'f',
         * //         g: {
         * //             h: ['x', 'y', 'z'],
         * //             l: 'm',
         * //         }
         * //     },
         * //     j: 'k',
         * // }
         * ._mergeObjects(a, b);
         *
         * @param  {...Object} objects - The list of objects to merge.
         * @return {Object} A new object with the merged properties.
         * @private
         * @ignore
         */

    }, {
        key: '_mergeObjects',
        value: function _mergeObjects() {
            var _this5 = this;

            var result = {};

            for (var _len = arguments.length, objects = Array(_len), _key = 0; _key < _len; _key++) {
                objects[_key] = arguments[_key];
            }

            objects.forEach(function (obj) {
                if (typeof obj !== 'undefined') {
                    Object.keys(obj).forEach(function (objKey) {
                        var current = obj[objKey];
                        var target = result[objKey];
                        if (typeof target !== 'undefined' && current.constructor && current.constructor === Object && target.constructor && target.constructor === Object) {
                            result[objKey] = _this5._mergeObjects(target, current);
                        } else {
                            result[objKey] = current;
                        }
                    }, _this5);
                }
            }, this);

            return result;
        }
        /**
         * A utility method used when expanding a shorthand setting. It uses a directory-type path,
         * like 'property1/property2/value', to set a value on a given object. If a segment of the
         * path doesn't exists, it will create an `Object` for it.
         * @param {Object} obj   - The target object where the value will be set.
         * @param {String} path  - The directory-type path for the property that will get the value.
         * @param {*}      value - The value to set.
         * @private
         * @ignore
         */

    }, {
        key: '_setValueAtObjectPath',
        value: function _setValueAtObjectPath(obj, path, value) {
            var pathParts = path.split('/');
            var limit = pathParts.length - 1;
            var currentObj = obj;
            for (var i = 0; i < limit; i++) {
                var part = pathParts[i];
                if (!currentObj[part]) {
                    currentObj[part] = {};
                }

                currentObj = currentObj[part];
            }

            currentObj[pathParts[limit]] = value;
        }
        /**
         * Creates and returns the stream for the build.
         * @return {Function} It returns the stream used to create and write the build.
         * @private
         * @ignore
         */

    }, {
        key: '_bundle',
        value: function _bundle() {
            return this.bundler.transform(this.babelify.configure(this.config.babelifyOptions)).bundle().on('error', this._logError.bind(this)).pipe(this.vinylSourceStream(this.config.dist.file)).pipe(this.gulpIf(this.config.uglify, this.gulpStreamify(this.gulpUglify()))).pipe(this.gulp.dest(this.config.dist.dir)).pipe(this.browserSync.reload({ stream: true }));
        }
        /**
         * When creating and instance of Browserify, instead of just sending the name of the main
         * file, this method will return an array with it and any other polyfill module required.
         * @return {Array} A list of the files to include in the Browserify initialization.
         * @private
         * @ignore
         */

    }, {
        key: '_getEntryFileSettings',
        value: function _getEntryFileSettings() {
            var result = [];
            if (this.config.polyfillsEnabled) {
                for (var i = 0; i < this.config.polyfills.length; i++) {
                    var polyfill = this.config.polyfills[i];
                    if (typeof polyfill === 'string') {
                        result.push(require.resolve(polyfill));
                    } else {
                        result.push(polyfill);
                    }
                }
            }

            result.push(this.config.mainFile);
            return result;
        }
        /**
         * It creates the bundler object from Browserify and depending if the watch it's required or
         * not it wraps it with Watchify.
         * @return {Function} The Browserify instance.
         * @private
         * @ignore
         */

    }, {
        key: '_createBundler',
        value: function _createBundler() {
            if (this._bundler === null) {
                var watchifyOptions = this._mergeObjects(this.config.watchifyOptions, this.watchify.args);
                var browserifyBuild = this.browserify(this._getEntryFileSettings(), watchifyOptions);
                this._bundler = this._watch ? this.watchify(browserifyBuild) : browserifyBuild;
                if (this._watch) {
                    this._bundler.on('update', this._bundle.bind(this));
                }
            }

            return this._bundler;
        }
        /**
         * Runs `rm -rf` on a given directory. This is a resource method for the `clean` and `cleanEs5`
         * tasks and that's why it receives a callback argument.
         * @param  {String}   path     - The path to the directory to delete.
         * @param  {Function} callback - An optional callback sent by the Gulp task.
         * @private
         * @ignore
         */

    }, {
        key: '_cleanDirectory',
        value: function _cleanDirectory(path, _x5) {
            var callback = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

            this.rimraf(path, callback);
        }
        /**
         * Internally used to require dependency modules. The dynamic getters for the modules will
         * check first if there's a custom version, if there isn't, the getter will call this method
         * and then the module will be required. This way it avoids required all the modules at once
         * if some of them are not going to be used.
         * @param  {String} name - The module name.
         * @return {*} The module contents.
         * @private
         * @ignore
         */

    }, {
        key: '_getDependency',
        value: function _getDependency(name) {
            if (!this._dependencies[name]) {
                this._dependencies[name] = require(name);
            }

            return this._dependencies[name];
        }
        /**
         * Logs an error using `PluginError` object from Gulp Util.
         * @param  {Error} error - The error object to log.
         * @private
         * @ignore
         */

    }, {
        key: '_logError',
        value: function _logError(error) {
            var gErr = new this.gulpUtil.PluginError(this._consts.packageName, error.message);
            console.log(gErr.toString());
        }
        /**
         * Get the current bundler object from Browserify (or Watchify). If it doesn't exists, it will
         * create a new one.
         * @type {Function}
         */

    }, {
        key: 'bundler',
        get: function get() {
            return this._createBundler();
        }
        /**
         * Set a custom version of Watchify.
         * @type {Function}
         */

    }, {
        key: 'watchify',
        set: function set(value) {
            this._watchify = value;
        }
        /**
         * Get the Watchify instance the plugin it's using. If a custom version was injected using the
         * setter, it will return that, otherwise, it will require the one on the plugin
         * `package.json`.
         * @type {Function}
         */
        ,
        get: function get() {
            return this._watchify || this._getDependency('watchify');
        }
        /**
         * Set a custom version of Browserify.
         * @type {Function}
         */

    }, {
        key: 'browserify',
        set: function set(value) {
            this._browserify = value;
        }
        /**
         * Get the Browserify instance the plugin it's using. If a custom version was injected using
         * the setter, it will return that, otherwise, it will require the one on the plugin
         * `package.json`.
         * @type {Function}
         */
        ,
        get: function get() {
            return this._browserify || this._getDependency('browserify');
        }
        /**
         * Set a custom version of Babelify.
         * @type {Function}
         */

    }, {
        key: 'babelify',
        set: function set(value) {
            this._babelify = value;
        }
        /**
         * Get the Babelify instance the plugin it's using. If a custom version was injected using
         * the setter, it will return that, otherwise, it will require the one on the plugin
         * `package.json`.
         * @type {Function}
         */
        ,
        get: function get() {
            return this._babelify || this._getDependency('babelify');
        }
        /**
         * Set a custom version of vinyl-source-stream.
         * @type {Function}
         */

    }, {
        key: 'vinylSourceStream',
        set: function set(value) {
            this._vinylSourceStream = value;
        }
        /**
         * Get the vinyl-source-stream instance the plugin it's using. If a custom version was
         * injected using the setter, it will return that, otherwise, it will require the one on
         * the plugin `package.json`.
         * @type {Function}
         */
        ,
        get: function get() {
            return this._vinylSourceStream || this._getDependency('vinyl-source-stream');
        }
        /**
         * Set a custom version of vinyl-transform
         * @type {Function}
         */

    }, {
        key: 'vinylTransform',
        set: function set(value) {
            this._vinylTransform = value;
        }
        /**
         * Get the vinyl-transform instance the plugin it's using. If a custom version was
         * injected using the setter, it will return that, otherwise, it will require the one on
         * the plugin `package.json`.
         * @type {Function}
         */
        ,
        get: function get() {
            return this._vinylTransform || this._getDependency('vinyl-transform');
        }
        /**
         * Set a custom version of BrowserSync.
         * @type {Function}
         */

    }, {
        key: 'browserSync',
        set: function set(value) {
            this._browserSync = value;
        }
        /**
         * Get the BrowserSync instance the plugin it's using. If a custom version was
         * injected using the setter, it will return that, otherwise, it will require the one on
         * the plugin `package.json`.
         * @type {Function}
         */
        ,
        get: function get() {
            return this._browserSync || this._getDependency('browser-sync');
        }
        /**
         * Set a custom version of rimraf.
         * @type {Function}
         */

    }, {
        key: 'rimraf',
        set: function set(value) {
            this._rimraf = value;
        }
        /**
         * Get the rimraf instance the plugin it's using. If a custom version was injected using the
         * setter, it will return that, otherwise, it will require the one on the plugin
         * `package.json`.
         * @type {Function}
         */
        ,
        get: function get() {
            return this._rimraf || this._getDependency('rimraf');
        }
        /**
         * Set a custom version of Gulp Util.
         * @type {Function}
         */

    }, {
        key: 'gulpUtil',
        set: function set(value) {
            this._gulpUtil = value;
        }
        /**
         * Get the Gulp Util instance the plugin it's using. If a custom version was injected using
         * the setter, it will return that, otherwise, it will require the one on the plugin
         * `package.json`.
         * @type {Function}
         */
        ,
        get: function get() {
            return this._gulpUtil || this._getDependency('gulp-util');
        }
        /**
         * Set a custom version of gulp-if.
         * @type {Function}
         */

    }, {
        key: 'gulpIf',
        set: function set(value) {
            this._gulpIf = value;
        }
        /**
         * Get the gulp-if instance the plugin it's using. If a custom version was injected using
         * the setter, it will return that, otherwise, it will require the one on the plugin
         * `package.json`.
         * @type {Function}
         */
        ,
        get: function get() {
            return this._gulpIf || this._getDependency('gulp-if');
        }
        /**
         * Set a custom version of gulp-streamify.
         * @type {Function}
         */

    }, {
        key: 'gulpStreamify',
        set: function set(value) {
            this._gulpStreamify = value;
        }
        /**
         * Get the gulp-streamify instance the plugin it's using. If a custom version was injected
         * using the setter, it will return that, otherwise, it will require the one on the plugin
         * `package.json`.
         * @type {Function}
         */
        ,
        get: function get() {
            return this._gulpStreamify || this._getDependency('gulp-streamify');
        }
        /**
         * Set a custom version of gulp-uglify.
         * @type {Function}
         */

    }, {
        key: 'gulpUglify',
        set: function set(value) {
            this._gulpUglify = value;
        }
        /**
         * Get the gulp-uglify instance the plugin it's using. If a custom version was injected
         * using the setter, it will return that, otherwise, it will require the one on the plugin
         * `package.json`.
         * @type {Function}
         */
        ,
        get: function get() {
            return this._gulpUglify || this._getDependency('gulp-uglify');
        }
        /**
         * Set a custom version of gulp-jscs.
         * @type {Function}
         */

    }, {
        key: 'gulpJSCS',
        set: function set(value) {
            this._gulpJSCS = value;
        }
        /**
         * Get the gulp-jscs instance the plugin it's using. If a custom version was injected
         * using the setter, it will return that, otherwise, it will require the one on the plugin
         * `package.json`.
         * @type {Function}
         */
        ,
        get: function get() {
            return this._gulpJSCS || this._getDependency('gulp-jscs');
        }
        /**
         * Set a custom version of gulp-eslint.
         * @type {Function}
         */

    }, {
        key: 'gulpESLint',
        set: function set(value) {
            this._gulpESLint = value;
        }
        /**
         * Get the gulp-eslint instance the plugin it's using. If a custom version was injected
         * using the setter, it will return that, otherwise, it will require the one on the plugin
         * `package.json`.
         * @type {Function}
         */
        ,
        get: function get() {
            return this._gulpESLint || this._getDependency('gulp-eslint');
        }
        /**
         * Set a custom version of ESDoc.
         * @type {Function}
         */

    }, {
        key: 'esdoc',
        set: function set(value) {
            this._esdoc = value;
        }
        /**
         * Get the ESDoc instance the plugin it's using. If a custom version was injected
         * using the setter, it will return that, otherwise, it will require the one on the plugin
         * `package.json`.
         * @type {Function}
         */
        ,
        get: function get() {
            return this._esdoc || this._getDependency('esdoc');
        }
        /**
         * Set a custom version of the ESDoc Uploader.
         * @type {Function}
         */

    }, {
        key: 'esdocUploader',
        set: function set(value) {
            this._esdocUploader = value;
        }
        /**
         * Get the ESDoc Uploader instance the plugin it's using. If a custom version was injected
         * using the setter, it will return that, otherwise, it will require the one on the plugin
         * `package.json`.
         * @type {Function}
         */
        ,
        get: function get() {
            return this._esdocUploader || this._getDependency('esdoc-uploader').default;
        }
        /**
         * Set a custom version of the ESDoc Publisher.
         * @type {Function}
         */

    }, {
        key: 'esdocPublisher',
        set: function set(value) {
            this._esdocPublisher = value;
        }
        /**
         * Get the ESDoc Publisher instance the plugin it's using. If a custom version was injected
         * using the setter, it will return that, otherwise, it will require the one on the plugin
         * `package.json`.
         * @type {Function}
         */
        ,
        get: function get() {
            return this._esdocPublisher || this._getDependency('esdoc/out/src/Publisher/publish');
        }
        /**
         * Set a custom version of Jest-cli.
         * @type {Function}
         */

    }, {
        key: 'jest',
        set: function set(value) {
            this._jest = value;
        }
        /**
         * Get the Jest-cli instance the plugin it's using. If a custom version was injected
         * using the setter, it will return that, otherwise, it will require the one on the plugin
         * `package.json`.
         * @type {Function}
         */
        ,
        get: function get() {
            return this._jest || this._getDependency('jest-cli');
        }
        /**
         * Set a custom version of through.
         * @type {Function}
         */

    }, {
        key: 'through',
        set: function set(value) {
            this._through = value;
        }
        /**
         * Get the through instance the plugin it's using. If a custom version was injected
         * using the setter, it will return that, otherwise, it will require the one on the plugin
         * `package.json`.
         * @type {Function}
         */
        ,
        get: function get() {
            return this._through || this._getDependency('through2');
        }
    }]);

    return Bundlerify;
})();

exports.default = Bundlerify;