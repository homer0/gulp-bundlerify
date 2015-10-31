
class Bundlerify {

    constructor(gulp, config = {}, assigner = null) {
        this.gulp = gulp;
        assigner = assigner || require('object-assign-deep');
        if (typeof config === 'string') {
            config = {
                mainFile: config,
            };
        } else {
            config = this._expandShorthandSettings(assigner({}, config));
        }

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

        this._bundler = null;

        this._watchify = null;
        this._browserify = null;
        this._babelify = null;
        this._vinylSourceStream = null;
        this._browserSync = null;
        this._rimraf = null;
        this._gulpUtil = null;
        this._gulpIf = null;
        this._gulpStreamify = null;
        this._uglifier = null;

        this._watch = true;
        this._dependencies = {};
        this._tasksDependencies = {
            serve: ['build'],
            build: ['clean'],
        };

    }

    clean(callback) {
        this.rimraf(this.config.dist.dir, callback);
    }

    build() {
        this._watch = false;
        return this._bundle();
    }

    serve() {
        this._watch = true;
        this._bundler = null;
        this.browserSync(this.config.browserSyncOptions);
        return this._bundle();
    }

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

    _expandShorthandSettings(config) {
        const shortSettings = {
            watchifyDebug: 'watchifyOptions/debug',
            browserSyncBaseDir: 'browserSyncOptions/server/baseDir',
            browserSyncEnabled: 'browserSyncOptions/enabled',
        };
        Object.keys(shortSettings).forEach((setting) => {
            let shortValue = config[setting];
            if (typeof shortValue !== 'undefined') {
                this._setValueAtObjectPath(config, shortSettings[setting], shortValue);
                delete config[setting];
            }
        }, this);

        return config;
    }

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

    _bundle() {
        return this.bundler
        .transform(this.babelify.configure(this.config.babelifyOptions))
        .bundle()
        .on('error', this._logError.bind(this))
        .pipe(this.vinylSourceStream(this.config.dist.file))
        .pipe(this.gulpIf(this.config.uglify, this.gulpStreamify(this.uglifier())))
        .pipe(this.gulp.dest(this.config.dist.dir))
        .pipe(this.browserSync.reload({ stream: true }));
    }

    _getEntryFileSettings() {
        let result = [];
        if (this.config.polyfillsEnabled) {
            for (let i = 0; i < this.config.polyfills.length; i++) {
                let polyfill = this.config.polyfills[i];
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

    _getDependency(name) {
        if (!this._dependencies[name]) {
            this._dependencies[name] = require(name);
        }

        return this._dependencies[name];
    }

    _logError(error) {
        const gErr = new this.gulpUtil.PluginError('gulp-bundlerify', error.message);
        console.log(gErr.toString());
    }

    get bundler() {
        return this._createBundler();
    }

    set watchify(value) {
        this._watchify = value;
    }

    get watchify() {
        return this._watchify || this._getDependency('watchify');
    }

    set browserify(value) {
        this._browserify = value;
    }

    get browserify() {
        return this._browserify || this._getDependency('browserify');
    }

    set babelify(value) {
        this._babelify = value;
    }

    get babelify() {
        return this._babelify || this._getDependency('babelify');
    }

    set vinylSourceStream(value) {
        this._vinylSourceStream = value;
    }

    get vinylSourceStream() {
        return this._vinylSourceStream || this._getDependency('vinyl-source-stream');
    }

    set browserSync(value) {
        this._browserSync = value;
    }

    get browserSync() {
        return this._browserSync || this._getDependency('browser-sync');
    }

    set rimraf(value) {
        this._rimraf = value;
    }

    get rimraf() {
        return this._rimraf || this._getDependency('rimraf');
    }

    set gulpUtil(value) {
        this._gulpUtil = value;
    }

    get gulpUtil() {
        return this._gulpUtil || this._getDependency('gulp-util');
    }

    set gulpIf(value) {
        this._gulpIf = value;
    }

    get gulpIf() {
        return this._gulpIf || this._getDependency('gulp-if');
    }

    set gulpStreamify(value) {
        this._gulpStreamify = value;
    }

    get gulpStreamify() {
        return this._gulpStreamify || this._getDependency('gulp-streamify');
    }

    set uglifier(value) {
        this._uglifier = value;
    }

    get uglifier() {
        return this._uglifier || this._getDependency('gulp-uglify');
    }

}

export default Bundlerify;
