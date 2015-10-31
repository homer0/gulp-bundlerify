'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _typeof(obj) { return obj && obj.constructor === Symbol ? "symbol" : typeof obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Bundlerify = (function () {
    function Bundlerify(gulp) {
        var config = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
        var assigner = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];

        _classCallCheck(this, Bundlerify);

        this.gulp = gulp;
        if (typeof config === 'string') {
            config = {
                mainFile: config
            };
        } else {
            config = this._expandShorthandSettings(config);
        }

        assigner = assigner || require('object-assign-deep');

        this.config = assigner({
            mainFile: './index.js',
            dist: {
                file: 'build.js',
                dir: './dist/'
            },
            watchifyOptions: {
                debug: true,
                fullPaths: true
            },
            browserSyncOptions: {
                enabled: true,
                server: {
                    baseDir: './',
                    directory: true,
                    index: 'index.html',
                    routes: {
                        '/src/': './src/',
                        '/dist/': './dist/'
                    }
                }
            },
            babelifyOptions: {
                presets: ['es2015']
            },
            tasks: {
                build: 'build',
                serve: 'serve',
                clean: 'clean',
                lint: 'lint',
                docs: 'docs'
            },
            polyfillsEnabled: false,
            polyfills: ['whatwg-fetch/fetch', 'core-js/fn/symbol', 'core-js/fn/promise'],
            uglify: false
        }, config);

        var distRoutePath = this.config.dist.dir;
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
            build: ['clean']
        };
    }

    _createClass(Bundlerify, [{
        key: 'clean',
        value: function clean(callback) {
            this.rimraf(this.config.dist.dir, callback);
        }
    }, {
        key: 'build',
        value: function build() {
            this._watch = false;
            return this._bundle();
        }
    }, {
        key: 'serve',
        value: function serve() {
            this._watch = true;
            this._bundler = null;
            this.browserSync(this.config.browserSyncOptions);
            return this._bundle();
        }
    }, {
        key: 'tasks',
        value: function tasks() {
            var _this = this;

            Object.keys(this.config.tasks).forEach(function (name) {
                var task = _this.config.tasks[name];
                if (task !== false) {
                    var defaultTaskDeps = _this._tasksDependencies[name] || [];
                    if ((typeof task === 'undefined' ? 'undefined' : _typeof(task)) === 'object') {
                        var taskName = task.name || name;
                        var taskDeps = task.deps || [];
                        if (defaultTaskDeps.length) {
                            taskDeps = taskDeps.concat(defaultTaskDeps);
                        }
                        console.log(taskName, ' DEPS: ', taskDeps);
                        _this.gulp.task(taskName, taskDeps, (function (callback) {
                            var result = null;
                            if (task.method) {
                                result = task.method(_this[task].bind(_this), callback);
                            } else {
                                result = _this[task](callback);
                            }

                            return result;
                        }).bind(_this));
                    } else {
                        _this.gulp.task(name, defaultTaskDeps, (function (callback) {
                            return _this[task](callback);
                        }).bind(_this));
                    }
                }
            }, this);

            return this;
        }
    }, {
        key: '_expandShorthandSettings',
        value: function _expandShorthandSettings(config) {
            var _this2 = this;

            var shortSettings = {
                watchifyDebug: 'watchifyOptions/debug',
                browserSyncBaseDir: 'browserSyncOptions/server/baseDir',
                browserSyncEnabled: 'browserSyncOptions/enabled'
            };
            Object.keys(shortSettings).forEach(function (setting) {
                var shortValue = config[setting];
                if (typeof shortValue !== 'undefined') {
                    _this2._setValueAtObjectPath(config, shortSettings[setting], shortValue);
                    delete config[setting];
                }
            }, this);

            return config;
        }
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
    }, {
        key: '_bundle',
        value: function _bundle() {
            return this.bundler.transform(this.babelify.configure(this.config.babelifyOptions)).bundle().on('error', this._logError.bind(this)).pipe(this.vinylSourceStream(this.config.dist.file)).pipe(this.gulpIf(this.uglify, this.gulpStreamify(this.uglifier()))).pipe(this.gulp.dest(this.config.dist.dir)).pipe(this.browserSync.reload({ stream: true }));
        }
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
    }, {
        key: '_createBundler',
        value: function _createBundler() {
            if (this._bundler === null) {
                var watchifyOptions = Object.assign(this.config.watchifyOptions, this.watchify.args);
                var browserifyBuild = this.browserify(this._getEntryFileSettings(), watchifyOptions);
                this._bundler = this._watch ? this.watchify(browserifyBuild) : browserifyBuild;
                if (this._watch) {
                    this._bundler.on('update', this._bundle.bind(this));
                }
            }
        }
    }, {
        key: '_getDependency',
        value: function _getDependency(name) {
            if (!this._dependencies[name]) {
                this._dependencies[name] = require(name);
            }

            return this._dependencies[name];
        }
    }, {
        key: '_logError',
        value: function _logError(error) {
            var gErr = new this.gulpUtil.PluginError('gulp-bundlerify', error.message);
            console.log(gErr.toString());
        }
    }, {
        key: 'bundler',
        get: function get() {
            this._createBundler();
            return this._bundler;
        }
    }, {
        key: 'watchify',
        set: function set(value) {
            this._watchify = value;
        },
        get: function get() {
            return this._watchify || this._getDependency('watchify');
        }
    }, {
        key: 'browserify',
        set: function set(value) {
            this._browserify = value;
        },
        get: function get() {
            return this._browserify || this._getDependency('browserify');
        }
    }, {
        key: 'babelify',
        set: function set(value) {
            this._babelify = value;
        },
        get: function get() {
            return this._babelify || this._getDependency('babelify');
        }
    }, {
        key: 'vinylSourceStream',
        set: function set(value) {
            this._vinylSourceStream = value;
        },
        get: function get() {
            return this._vinylSourceStream || this._getDependency('vinyl-source-stream');
        }
    }, {
        key: 'browserSync',
        set: function set(value) {
            this._browserSync = value;
        },
        get: function get() {
            return this._browserSync || this._getDependency('browser-sync');
        }
    }, {
        key: 'rimraf',
        set: function set(value) {
            this._rimraf = value;
        },
        get: function get() {
            return this._rimraf || this._getDependency('rimraf');
        }
    }, {
        key: 'gulpUtil',
        set: function set(value) {
            this._gulpUtil = value;
        },
        get: function get() {
            return this._gulpUtil || this._getDependency('gulp-util');
        }
    }, {
        key: 'gulpIf',
        set: function set(value) {
            this._gulpIf = value;
        },
        get: function get() {
            return this._gulpIf || this._getDependency('gulp-if');
        }
    }, {
        key: 'gulpStreamify',
        set: function set(value) {
            this._gulpStreamify = value;
        },
        get: function get() {
            return this._gulpStreamify || this._getDependency('gulp-streamify');
        }
    }, {
        key: 'uglifier',
        set: function set(value) {
            this._uglifier = value;
        },
        get: function get() {
            return this._uglifier || this._getDependency('gulp-uglify');
        }
    }]);

    return Bundlerify;
})();

exports.default = Bundlerify;