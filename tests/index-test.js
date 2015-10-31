
jest.autoMockOff();

const Bundlerify = require('../src/index');
const BrowserifyMock = require(BrowserifyMockPath);
const gulp = require('gulp');

let instance = null;

describe('gulp-bundlerify', () => {

    afterEach(() => {
        instance = null;
    });

    it('should create a new instance and have public methods', () => {
        instance = new Bundlerify(gulp);
        expect(instance).toEqual(jasmine.any(Bundlerify));
        expect(instance.clean).toEqual(jasmine.any(Function));
        expect(instance.build).toEqual(jasmine.any(Function));
        expect(instance.serve).toEqual(jasmine.any(Function));
        expect(instance.tasks).toEqual(jasmine.any(Function));
    });

    it('should write the configuration correctly', () => {
        let dummyConfig = {
            mainFile: './test.js',
            dist: {
                file: 'app.js',
            },
            watchifyOptions: {
                fullPaths: false,
            },
            browserSyncOptions: {
                enabled: false,
                server: {
                    directory: false,
                    routes: {
                        '/test/': './test/',
                    },
                },
            },
            babelifyOptions: {
                presets: ['es25-10-2015'],
            },
        };

        instance = new Bundlerify(gulp, dummyConfig);
        let config = instance.config;
        expect(config.mainFile).toEqual(dummyConfig.mainFile);
        expect(config.dist.file).toEqual(dummyConfig.dist.file);
        expect(config.dist.dir).toEqual('./dist/');
        expect(config.watchifyOptions.debug).toBeTruthy();
        expect(config.watchifyOptions.fullPaths).toEqual(dummyConfig.watchifyOptions.fullPaths);
        expect(config.browserSyncOptions.enabled).toBeFalsy();
        expect(config.browserSyncOptions.server.directory).toBeFalsy();
        expect(config.browserSyncOptions.server.routes).toEqual(Object.assign(
            dummyConfig.browserSyncOptions.server.routes,
            {
                '/src/': './src/',
                '/dist/': './dist/',
            }
        ));
        let presetsValue = ['es2015'].concat(dummyConfig.babelifyOptions.presets);
        expect(config.babelifyOptions.presets).toEqual(presetsValue);
    });

    it('should expand shorthand settings', () => {
        let dummyConfig = {
            watchifyDebug: true,
            browserSyncBaseDir: './rosario/',
            browserSyncEnabled: false,
        };

        instance = new Bundlerify(gulp, dummyConfig);
        expect(instance.config.watchifyOptions.debug).toBeTruthy();
        expect(instance.config.browserSyncOptions.server.baseDir).toEqual(
            dummyConfig.browserSyncBaseDir
        );
        expect(instance.config.browserSyncOptions.enabled).toBeFalsy();
    });

    it('should be able to be instantiated just with a filepath', () => {
        let dummyFile = './Rosario.js';
        instance = new Bundlerify(gulp, dummyFile);
        expect(instance.config.mainFile).toEqual(dummyFile);
    });

    it('should create a Browser Sync router for the dist directory', () => {
        let dummyPath = '/charito/';
        instance = new Bundlerify(gulp, {
            dist: {
                dir: dummyPath,
            },
        });
        expect(instance.config.browserSyncOptions.server.routes[dummyPath]).toEqual(dummyPath);
    });

    it('should be able to overwrite and obtain the dependencies modules', () => {
        let dummyValues = {
            watchify: {
                name: 'My Custom Watchify',
                module: 'watchify',
            },
            browserify: {
                name: 'My Custom Browserify',
                module: 'browserify',
            },
            babelify: {
                name: 'My Custom Babelify',
                module: 'babelify',
            },
            vinylSourceStream: {
                name: 'My Custom VinylSourceStream',
                module: 'vinyl-source-stream',
            },
            browserSync: {
                name: 'My Custom BrowserSync',
                module: 'browser-sync',
            },
            rimraf: {
                name: 'My Custom Rimraf',
                module: 'rimraf',
            },
            gulpUtil: {
                name: 'My Custom GulpUtil',
                module: 'gulp-util',
            },
            gulpIf: {
                name: 'My Custom GulpIf',
                module: 'gulp-if',
            },
            gulpStreamify: {
                name: 'My Custom GulpStreamify',
                module: 'gulp-streamify',
            },
            uglifier: {
                name: 'My Custom Uglifier',
                module: 'gulp-uglify',
            },
        };

        instance = new Bundlerify(gulp, require('object-assign-deep'));

        instance.watchify = dummyValues.watchify.name;
        expect(instance.watchify).toEqual(dummyValues.watchify.name);
        instance.watchify = null;
        expect(instance.watchify).toEqual(require(dummyValues.watchify.module));

        instance.browserify = dummyValues.browserify.name;
        expect(instance.browserify).toEqual(dummyValues.browserify.name);
        instance.browserify = null;
        // For some reason, the reporter doesn't close the process when you require the
        // 'browserify' module.
        instance._dependencies['browserify'] = dummyValues.browserify.name;
        expect(instance.browserify).toEqual(dummyValues.browserify.name);

        instance.babelify = dummyValues.babelify.name;
        expect(instance.babelify).toEqual(dummyValues.babelify.name);
        instance.babelify = null;
        expect(instance.babelify).toEqual(require(dummyValues.babelify.module));

        instance.vinylSourceStream = dummyValues.vinylSourceStream.name;
        expect(instance.vinylSourceStream).toEqual(dummyValues.vinylSourceStream.name);
        instance.vinylSourceStream = null;
        expect(instance.vinylSourceStream).toEqual(require(dummyValues.vinylSourceStream.module));

        instance.browserSync = dummyValues.browserSync.name;
        expect(instance.browserSync).toEqual(dummyValues.browserSync.name);
        instance.browserSync = null;
        expect(instance.browserSync).toEqual(require(dummyValues.browserSync.module));

        instance.rimraf = dummyValues.rimraf.name;
        expect(instance.rimraf).toEqual(dummyValues.rimraf.name);
        instance.rimraf = null;
        expect(instance.rimraf).toEqual(require(dummyValues.rimraf.module));

        instance.gulpUtil = dummyValues.gulpUtil.name;
        expect(instance.gulpUtil).toEqual(dummyValues.gulpUtil.name);
        instance.gulpUtil = null;
        expect(instance.gulpUtil).toEqual(require(dummyValues.gulpUtil.module));

        instance.gulpIf = dummyValues.gulpIf.name;
        expect(instance.gulpIf).toEqual(dummyValues.gulpIf.name);
        instance.gulpIf = null;
        expect(instance.gulpIf).toEqual(require(dummyValues.gulpIf.module));

        instance.gulpStreamify = dummyValues.gulpStreamify.name;
        expect(instance.gulpStreamify).toEqual(dummyValues.gulpStreamify.name);
        instance.gulpStreamify = null;
        expect(instance.gulpStreamify).toEqual(require(dummyValues.gulpStreamify.module));

        instance.uglifier = dummyValues.uglifier.name;
        expect(instance.uglifier).toEqual(dummyValues.uglifier.name);
        instance.uglifier = null;
        expect(instance.uglifier).toEqual(require(dummyValues.uglifier.module));
    });

    it('should register the basic tasks', () => {
        let mockGulp = jest.genMockFromModule('gulp');
        let mockFunc = jest.genMockFunction();
        let mockRimRaf = jest.genMockFromModule('rimraf');
        instance = new Bundlerify(mockGulp, {
            tasks: {
                docs: false,
                lint: {
                    deps: ['dep1', 'dep2'],
                    method: () => {},
                }
            }
        });

        instance.rimraf = mockRimRaf;
        expect(instance.tasks()).toEqual(instance);
        const tasksCalls = mockGulp.task.mock.calls;
        const tasksNames = Object.keys(instance.config.tasks);
        for (let i = 0; i < (tasksNames - 1); i++) {
            expect(tasksCalls[i][0]).toEqual(tasksNames[i]);
        }

        expect(tasksCalls.length).toEqual(tasksNames.length - 1);
        const cleanTask = mockGulp.task.mock.calls[2];
        cleanTask[2](() => {});
        expect(mockRimRaf.mock.calls.length).toEqual(1);
        expect(mockRimRaf.mock.calls[0][0]).toEqual(instance.config.dist.dir);
        expect(mockRimRaf.mock.calls[0][1]).toEqual(jasmine.any(Function));
    });

    it('should overwrite the basic tasks settings', () => {
        let mockGulp = jest.genMockFromModule('gulp');
        let mockBuildFunc = jest.genMockFunction();
        let mockRimRaf = jest.genMockFromModule('rimraf');
        instance = new Bundlerify(mockGulp, {
            tasks: {
                build: {
                    deps: ['dep1', 'dep2'],
                    method: mockBuildFunc,
                },
                clean: {
                    name: 'removeEverything',
                },
            }
        });
        instance.rimraf = mockRimRaf;
        expect(instance.tasks()).toEqual(instance);
        const tasksLength = Object.keys(instance.config.tasks).length;
        expect(mockGulp.task.mock.calls.length).toEqual(tasksLength);
        const buildTask = mockGulp.task.mock.calls[0];
        buildTask[2](() => {});
        expect(mockBuildFunc.mock.calls.length).toEqual(1);
        expect(mockBuildFunc.mock.calls[0][0]).toEqual(jasmine.any(Function));
        expect(mockBuildFunc.mock.calls[0][1]).toEqual(jasmine.any(Function));
        const cleanTask = mockGulp.task.mock.calls[2];
        cleanTask[2](() => {});
        expect(mockRimRaf.mock.calls.length).toEqual(1);
        expect(mockRimRaf.mock.calls[0][0]).toEqual(instance.config.dist.dir);
        expect(mockRimRaf.mock.calls[0][1]).toEqual(jasmine.any(Function));
    });

    it('should run the clean task', () => {
        let mockRimRaf = jest.genMockFromModule('rimraf');
        instance = new Bundlerify(gulp);
        instance.rimraf = mockRimRaf;
        instance.clean(() => {});
        expect(mockRimRaf.mock.calls.length).toEqual(1);
        expect(mockRimRaf.mock.calls[0][0]).toEqual(instance.config.dist.dir);
        expect(mockRimRaf.mock.calls[0][1]).toEqual(jasmine.any(Function));
    });

    it('should run the build task', () => {
        let mockBrowserify = new BrowserifyMock();
        let mockGulp = jest.genMockFromModule('gulp');
        let mockBabelify = jest.genMockFromModule('babelify');
        let mockSource = jest.genMockFromModule('vinyl-source-stream');
        let mockGulpIf = jest.genMockFromModule('gulp-if');
        let mockBrowserSync = jest.genMockFromModule('browser-sync');
        let mockUglify = jest.genMockFromModule('gulp-uglify');
        let mockStreamify = jest.genMockFromModule('gulp-streamify');
        let mockGulpUtil = jest.genMockFromModule('gulp-util');
        let mockPolyfill = jest.genMockFunction();

        instance = new Bundlerify(mockGulp, {
            polyfillsEnabled: true,
            polyfills: [mockPolyfill],
        });

        instance.browserify = mockBrowserify.browserify.bind(mockBrowserify);
        instance.babelify = mockBabelify;
        instance.vinylSourceStream = mockSource;
        instance.gulpIf = mockGulpIf;
        instance.browserSync = mockBrowserSync;
        instance.ugflifier = mockUglify;
        instance.gulpStreamify = mockStreamify;
        instance.gulpUtil = mockGulpUtil;

        instance.build();

        const browserifyCall = mockBrowserify.mainMock.mock.calls[0];
        expect(browserifyCall[0].length).toEqual(5);
        expect(browserifyCall[0][4]).toEqual(instance.config.mainFile);
        expect(browserifyCall[1]).toEqual({
            debug: true,
            fullPaths: true,
            cache: {},
            packageCache: {},
        });

        expect(mockBrowserify.transformMock.mock.calls.length).toEqual(1);
        const babelifyCall = mockBabelify.configure.mock.calls[0];
        expect(babelifyCall[0]).toEqual(instance.config.babelifyOptions);

        expect(mockBrowserify.bundleMock.mock.calls.length).toEqual(1);

        const eventCall = mockBrowserify.eventsMock.mock.calls[0];
        expect(eventCall[0]).toEqual('error');
        expect(eventCall[1]).toEqual(jasmine.any(Function));

        console.log = jasmine.createSpy('log');
        eventCall[1](new Error('Random Error'));
        expect(mockGulpUtil.PluginError.mock.calls[0][0]).toEqual('gulp-bundlerify');
        expect(mockGulpUtil.PluginError.mock.calls[0][1]).toEqual('Random Error');
        expect(console.log).toHaveBeenCalled();

        expect(mockBrowserify.pipeMock.mock.calls.length).toEqual(4);

        expect(mockSource.mock.calls.length).toEqual(1);
        expect(mockSource.mock.calls[0][0]).toEqual(instance.config.dist.file);

        expect(mockGulpIf.mock.calls.length).toEqual(1);
        expect(mockGulpIf.mock.calls[0][0]).toEqual(instance.config.uglify);

        expect(mockStreamify.mock.calls.length).toEqual(1);

        expect(mockGulp.dest.mock.calls[0][0]).toEqual(instance.config.dist.dir);

        expect(mockBrowserSync.reload.mock.calls.length).toEqual(1);
        expect(mockBrowserSync.reload.mock.calls[0][0]).toEqual(jasmine.any(Object));

        instance.build();
    });

    it('should run the serve task', () => {
        let mockBrowserify = new BrowserifyMock();
        let mockGulp = jest.genMockFromModule('gulp');
        let mockBabelify = jest.genMockFromModule('babelify');
        let mockSource = jest.genMockFromModule('vinyl-source-stream');
        let mockGulpIf = jest.genMockFromModule('gulp-if');
        let mockBrowserSync = jest.genMockFromModule('browser-sync');
        let mockUglify = jest.genMockFromModule('gulp-uglify');
        let mockStreamify = jest.genMockFromModule('gulp-streamify');

        instance = new Bundlerify(mockGulp);
        instance.browserify = mockBrowserify.browserify.bind(mockBrowserify);
        instance.babelify = mockBabelify;
        instance.vinylSourceStream = mockSource;
        instance.gulpIf = mockGulpIf;
        instance.browserSync = mockBrowserSync;
        instance.ugflifier = mockUglify;
        instance.gulpStreamify = mockStreamify;
        instance.watchify = mockBrowserify.watchify.bind(mockBrowserify);

        instance.serve();

        expect(mockBrowserSync.mock.calls.length).toEqual(1);
        expect(mockBrowserSync.mock.calls[0][0]).toEqual(instance.config.browserSyncOptions);

        const browserifyCall = mockBrowserify.mainMock.mock.calls[0];
        expect(browserifyCall[0]).toEqual([instance.config.mainFile]);
        expect(browserifyCall[1]).toEqual({
            debug: true,
            fullPaths: true
        });

        expect(mockBrowserify.watchifyMock.mock.calls.length).toEqual(1);
        expect(mockBrowserify.watchifyMock.mock.calls[0][0]).toEqual(mockBrowserify);

        expect(mockBrowserify.transformMock.mock.calls.length).toEqual(1);
        const babelifyCall = mockBabelify.configure.mock.calls[0];
        expect(babelifyCall[0]).toEqual(instance.config.babelifyOptions);

        expect(mockBrowserify.bundleMock.mock.calls.length).toEqual(1);

        const eventCalls = mockBrowserify.eventsMock.mock.calls;
        expect(eventCalls[0][0]).toEqual('update');
        expect(eventCalls[0][1]).toEqual(jasmine.any(Function));
        expect(eventCalls[1][0]).toEqual('error');
        expect(eventCalls[1][1]).toEqual(jasmine.any(Function));

        expect(mockBrowserify.pipeMock.mock.calls.length).toEqual(4);

        expect(mockSource.mock.calls.length).toEqual(1);
        expect(mockSource.mock.calls[0][0]).toEqual(instance.config.dist.file);

        expect(mockGulpIf.mock.calls.length).toEqual(1);
        expect(mockGulpIf.mock.calls[0][0]).toEqual(instance.config.uglify);

        expect(mockStreamify.mock.calls.length).toEqual(1);

        expect(mockGulp.dest.mock.calls[0][0]).toEqual(instance.config.dist.dir);

        expect(mockBrowserSync.reload.mock.calls.length).toEqual(1);
        expect(mockBrowserSync.reload.mock.calls[0][0]).toEqual(jasmine.any(Object));
    });

});
