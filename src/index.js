/**
 * Bundlerify it's something between a generator and a boilerplate for ES6 projects.
 * It uses Browserify, Babel, Watchify and BrowserSync, among others, to build your project with
 * just a couple of lines, but at the same time, it's also highly customizable: You can inject
 * your own dependencies and tasks.
 * @version 1.0.0
 */
export default class Bundlerify {
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
     * // Instantiate with a custom function to merge the config.
     * // The reason of this is that one of the main features of Bundlerify it's that all the
     * // dependencies can be injected, but the constructor needs to merge the custom
     * // configuration with the default values and `Object.assign()` doesn't go in deep.
     * const instanceThree = new Bundlerify(gulp, './myApp/index.js', require('_').extend);
     *
     * // Instantiate with shorthand settings
     * const instanceFour = new Bundlerify(gulp, {
     *     watchifyDebug: false, // alias for `.watchifyOptions.debug = false`
     *     browserSyncBaseDir: './', // alias for `.browserSyncOptions.server.baseDir = './'`
     *     browserSyncEnabled: false, // alias for `.browserSyncOptions.enabled = false`
     * });
     *
     * @param {Function}      gulp            - A reference to the main project's Gulp so the
     *                                          default tasks can be registered.
     * @param {Object|String} config          - If an object it's used, it will be merged with the
     *                                          default settings, but if a string it's used, it
     *                                          would be the same as using an Object with just the
     *                                          `mainFile` setting.
     * @param {Function}      [assigner=null] - A custom function to merge objects. Please check
     *                                          the example of this method to understand why this
     *                                          is needed.
     * @public
     */
    constructor(gulp, config = {}, assigner = null) {
        /**
         * A reference to the main project's Gulp.
         * @type {Function}
         */
        this.gulp = gulp;
        assigner = assigner || require('object-assign-deep');
        if (typeof config === 'string') {
            config = {
                mainFile: config,
            };
        } else {
            config = this._expandShorthandSettings(assigner({}, config));
        }
        /**
         * The Bundlerify main settings.
         * @type {Object}
         */
        this.config = assigner({
            mainFile: './index.js',
            dist: {
                file: 'build.js',
                dir: './dist/',
            },
            watchifyOptions: {
                debug: true,
                fullPaths: true,
            },
            browserSyncOptions: {
                enabled: true,
                server: {
                    baseDir: './',
                    directory: true,
                    index: 'index.html',
                    routes: {
                        '/src/': './src/',
                        '/dist/': './dist/',
                    },
                },
            },
            babelifyOptions: {
                presets: ['es2015'],
            },
            tasks: {
                build: 'build',
                serve: 'serve',
                clean: 'clean',
                lint: 'lint',
                docs: 'docs',
            },
            polyfillsEnabled: false,
            polyfills: [
                'whatwg-fetch/fetch',
                'core-js/fn/symbol',
                'core-js/fn/promise',
            ],
            uglify: false,
        }, config);

        let distRoutePath = this.config.dist.dir;
        if (distRoutePath.startsWith('.')) {
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
        };
    }
    /**
     * Clean the build (dist) directory. This method it's called by the `clean` task, which is a
     * dependency of the `build` task.
     * @param  {Function} [callback=null] - An optional callback sent by the Gulp task.
     */
    clean(callback = null) {
        this.rimraf(this.config.dist.dir, callback);
    }
    /**
     * Make a new build. This method it's called by the `build` task.
     * @return {Function} It returns the stream used to create and write the build.
     */
    build() {
        this._watch = false;
        return this._bundle();
    }
    /**
     * Start the BrowserSync server and the watch for any change in the build. This method it's
     * called by the `serve` task.
     * @return {Function} It returns the stream used to create and write the build.
     */
    serve() {
        this._watch = true;
        this._bundler = null;
        this.browserSync(this.config.browserSyncOptions);
        return this._bundle();
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
    tasks() {
        Object.keys(this.config.tasks).forEach((name) => {
            const task = this.config.tasks[name];
            if (task !== false) {
                const defaultTaskDeps = this._tasksDependencies[name] || [];
                if (typeof task === 'object') {
                    const taskName = task.name || name;
                    let taskDeps = task.deps || [];
                    if (defaultTaskDeps.length) {
                        taskDeps = taskDeps.concat(defaultTaskDeps);
                    }

                    this.gulp.task(taskName, taskDeps, (callback) => {
                        let result = null;
                        if (task.method) {
                            result = task.method(this[task].bind(this), callback);
                        } else {
                            result = this[task](callback);
                        }

                        return result;
                    }.bind(this));
                } else {
                    this.gulp.task(name, defaultTaskDeps, (callback) => {
                        return this[task](callback);
                    }.bind(this));
                }
            }

        }, this);

        return this;
    }
    /**
     * This method is called by the constructor and it's used to expand the shorthand settings.
     * @param  {Object} config - The original settings sent to the constructor.
     * @return {Object} The already parsed settings.
     * @private
     * @ignore
     */
    _expandShorthandSettings(config) {
        const shortSettings = {
            watchifyDebug: 'watchifyOptions/debug',
            browserSyncBaseDir: 'browserSyncOptions/server/baseDir',
            browserSyncEnabled: 'browserSyncOptions/enabled',
        };
        Object.keys(shortSettings).forEach((setting) => {
            const shortValue = config[setting];
            if (typeof shortValue !== 'undefined') {
                this._setValueAtObjectPath(config, shortSettings[setting], shortValue);
                delete config[setting];
            }
        }, this);

        return config;
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
    _setValueAtObjectPath(obj, path, value) {
        const pathParts = path.split('/');
        const limit = pathParts.length - 1;
        let currentObj = obj;
        for (let i = 0; i < limit; i++) {
            const part = pathParts[i];
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
    _bundle() {
        return this.bundler
        .transform(this.babelify.configure(this.config.babelifyOptions))
        .bundle()
        .on('error', this._logError.bind(this))
        .pipe(this.vinylSourceStream(this.config.dist.file))
        .pipe(this.gulpIf(this.config.uglify, this.gulpStreamify(this.gulpUglify())))
        .pipe(this.gulp.dest(this.config.dist.dir))
        .pipe(this.browserSync.reload({ stream: true }));
    }
    /**
     * When creating and instance of Browserify, instead of just sending the name of the main
     * file, this method will return an array with it and any other polyfill module required.
     * @return {Array} A list of the files to include in the Browserify initialization.
     * @private
     * @ignore
     */
    _getEntryFileSettings() {
        const result = [];
        if (this.config.polyfillsEnabled) {
            for (let i = 0; i < this.config.polyfills.length; i++) {
                const polyfill = this.config.polyfills[i];
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
    _createBundler() {
        if (this._bundler === null) {
            const watchifyOptions = Object.assign(
                this.config.watchifyOptions,
                this.watchify.args
            );
            const browserifyBuild = this.browserify(
                this._getEntryFileSettings(),
                watchifyOptions
            );
            this._bundler = this._watch ? this.watchify(browserifyBuild) : browserifyBuild;
            if (this._watch) {
                this._bundler.on('update', this._bundle.bind(this));
            }
        }

        return this._bundler;
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
    _getDependency(name) {
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
    _logError(error) {
        const gErr = new this.gulpUtil.PluginError('gulp-bundlerify', error.message);
        console.log(gErr.toString());
    }
    /**
     * Get the current bundler object from Browserify (or Watchify). If it doesn't exists, it will
     * create a new one.
     * @type {Function}
     */
    get bundler() {
        return this._createBundler();
    }
    /**
     * Set a custom version of Watchify.
     * @type {Function}
     */
    set watchify(value) {
        this._watchify = value;
    }
    /**
     * Get the Watchify instance the plugin it's using. If a custom version was injected using the
     * setter, it will return that, otherwise, it will require the one on the plugin
     * `package.json`.
     * @type {Function}
     */
    get watchify() {
        return this._watchify || this._getDependency('watchify');
    }
    /**
     * Set a custom version of Browserify.
     * @type {Function}
     */
    set browserify(value) {
        this._browserify = value;
    }
    /**
     * Get the Browserify instance the plugin it's using. If a custom version was injected using
     * the setter, it will return that, otherwise, it will require the one on the plugin
     * `package.json`.
     * @type {Function}
     */
    get browserify() {
        return this._browserify || this._getDependency('browserify');
    }
    /**
     * Set a custom version of Babelify.
     * @type {Function}
     */
    set babelify(value) {
        this._babelify = value;
    }
    /**
     * Get the Babelify instance the plugin it's using. If a custom version was injected using
     * the setter, it will return that, otherwise, it will require the one on the plugin
     * `package.json`.
     * @type {Function}
     */
    get babelify() {
        return this._babelify || this._getDependency('babelify');
    }
    /**
     * Set a custom version of vinyl-source-stream.
     * @type {Function}
     */
    set vinylSourceStream(value) {
        this._vinylSourceStream = value;
    }
    /**
     * Get the vinyl-source-stream instance the plugin it's using. If a custom version was
     * injected using the setter, it will return that, otherwise, it will require the one on
     * the plugin `package.json`.
     * @type {Function}
     */
    get vinylSourceStream() {
        return this._vinylSourceStream || this._getDependency('vinyl-source-stream');
    }
    /**
     * Set a custom version of BrowserSync.
     * @type {Function}
     */
    set browserSync(value) {
        this._browserSync = value;
    }
    /**
     * Get the BrowserSync instance the plugin it's using. If a custom version was
     * injected using the setter, it will return that, otherwise, it will require the one on
     * the plugin `package.json`.
     * @type {Function}
     */
    get browserSync() {
        return this._browserSync || this._getDependency('browser-sync');
    }
    /**
     * Set a custom version of rimraf.
     * @type {Function}
     */
    set rimraf(value) {
        this._rimraf = value;
    }
    /**
     * Get the rimraf instance the plugin it's using. If a custom version was injected using the
     * setter, it will return that, otherwise, it will require the one on the plugin
     * `package.json`.
     * @type {Function}
     */
    get rimraf() {
        return this._rimraf || this._getDependency('rimraf');
    }
    /**
     * Set a custom version of Gulp Util.
     * @type {Function}
     */
    set gulpUtil(value) {
        this._gulpUtil = value;
    }
    /**
     * Get the Gulp Util instance the plugin it's using. If a custom version was injected using
     * the setter, it will return that, otherwise, it will require the one on the plugin
     * `package.json`.
     * @type {Function}
     */
    get gulpUtil() {
        return this._gulpUtil || this._getDependency('gulp-util');
    }
    /**
     * Set a custom version of gulp-if.
     * @type {Function}
     */
    set gulpIf(value) {
        this._gulpIf = value;
    }
    /**
     * Get the gulp-if instance the plugin it's using. If a custom version was injected using
     * the setter, it will return that, otherwise, it will require the one on the plugin
     * `package.json`.
     * @type {Function}
     */
    get gulpIf() {
        return this._gulpIf || this._getDependency('gulp-if');
    }
    /**
     * Set a custom version of gulp-streamify.
     * @type {Function}
     */
    set gulpStreamify(value) {
        this._gulpStreamify = value;
    }
    /**
     * Get the gulp-streamify instance the plugin it's using. If a custom version was injected
     * using the setter, it will return that, otherwise, it will require the one on the plugin
     * `package.json`.
     * @type {Function}
     */
    get gulpStreamify() {
        return this._gulpStreamify || this._getDependency('gulp-streamify');
    }
    /**
     * Set a custom version of gulp-uglify.
     * @type {Function}
     */
    set gulpUglify(value) {
        this._gulpUglify = value;
    }
    /**
     * Get the gulp-uglify instance the plugin it's using. If a custom version was injected
     * using the setter, it will return that, otherwise, it will require the one on the plugin
     * `package.json`.
     * @type {Function}
     */
    get gulpUglify() {
        return this._gulpUglify || this._getDependency('gulp-uglify');
    }
}
