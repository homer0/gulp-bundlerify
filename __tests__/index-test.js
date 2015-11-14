
jest.autoMockOff();

const Bundlerify = require('../src/index').default;
const BrowserifyMock = require('./utils/browserify.js').default;

const {
    ESDocUploaderMock,
    ESDocUploaderMockObjs,
} = require('./utils/esdocUploader.js').default;

const gulp = require('gulp');
const originalFs = require('fs');
const originalPath = require('path');
const originalConsoleLog = console.log;

jest.mock('fs');
const mockFs = require('../__mocks__/fs');
jest.mock('path');
const mockPath = require('../__mocks__/path');

/**
 * @test {Bundlerify}
 */
describe('gulp-bundlerify', () => {

    beforeEach(() => {
        jest.setMock('fs', originalFs);
        jest.setMock('path', originalPath);
    });

    afterEach(() => {
        const instance = null;
    });
    /**
     * @test {Bundlerify#constructor}
     */
    it('should create a new instance and have public methods', () => {
        const instance = new Bundlerify(gulp);
        expect(instance).toEqual(jasmine.any(Bundlerify));
        expect(instance.clean).toEqual(jasmine.any(Function));
        expect(instance.build).toEqual(jasmine.any(Function));
        expect(instance.serve).toEqual(jasmine.any(Function));
        expect(instance.tasks).toEqual(jasmine.any(Function));
        expect(() => Bundlerify(gulp)).toThrow('Cannot call a class as a function');
    });
    /**
     * @test {Bundlerify#config}
     */
    it('should write the configuration correctly', () => {
        const dummyConfig = {
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

        const instance = new Bundlerify(gulp, dummyConfig);
        const config = instance.config;
        expect(config.mainFile).toEqual(dummyConfig.mainFile);
        expect(config.dist.file).toEqual(dummyConfig.dist.file);
        expect(config.dist.dir).toEqual('./dist/');
        expect(config.watchifyOptions.debug).toBeTruthy();
        expect(config.watchifyOptions.fullPaths).toEqual(dummyConfig.watchifyOptions.fullPaths);
        expect(config.browserSyncOptions.enabled).toBeFalsy();
        expect(config.browserSyncOptions.server.directory).toBeFalsy();
        expect(config.browserSyncOptions.server.routes).toEqual(instance._mergeObjects(
            dummyConfig.browserSyncOptions.server.routes,
            {
                '/src/': './src/',
                '/dist/': './dist/',
                '/es5/': './es5/',
            }
        ));
        expect(config.babelifyOptions.presets).toEqual(dummyConfig.babelifyOptions.presets);
    });
    /**
     * @test {Bundlerify#_expandShorthandSettings}
     */
    it('should expand shorthand settings', () => {
        const dummyConfig = {
            watchifyDebug: true,
            browserSyncBaseDir: './rosario/',
            browserSyncEnabled: false,
        };

        const instance = new Bundlerify(gulp, dummyConfig);
        expect(instance.config.watchifyOptions.debug).toBeTruthy();
        expect(instance.config.browserSyncOptions.server.baseDir).toEqual(
            dummyConfig.browserSyncBaseDir
        );
        expect(instance.config.browserSyncOptions.enabled).toBeFalsy();
    });
    /**
     * @test {Bundlerify#constructor}
     */
    it('should be able to be instantiated just with a filepath', () => {
        const dummyFile = './Rosario.js';
        const instance = new Bundlerify(gulp, dummyFile);
        expect(instance.config.mainFile).toEqual(dummyFile);
    });
    /**
     * @test {Bundlerify#constructor}
     */
    it('should create a Browser Sync router for the dist directory', () => {
        const dummyPath = '/charito/';
        const instance = new Bundlerify(gulp, {
            dist: {
                dir: dummyPath,
            },
        });
        expect(instance.config.browserSyncOptions.server.routes[dummyPath]).toEqual(dummyPath);
    });
    /**
     * @test {Bundlerify#constructor}
     */
    it('should read the ESDoc options from a file', () => {
        jest.setMock('fs', mockFs);

        // Try a valid file

        const dummyOptions = {
            name: 'docs',
            type: 'file',
        };

        mockFs.__setMockFiles({
            docFile: JSON.stringify(dummyOptions),
        });

        let instance = new Bundlerify(gulp, {
            esdocOptions: 'docFile',
        });

        Object.keys(dummyOptions).forEach((optionName) => {
            expect(instance.config.esdocOptions[optionName]).toEqual(dummyOptions[optionName]);
        });

        // Try an invalid file

        const originalOptions = {
            enabled: true,
            source: './src',
            destination: './docs',
            plugins: [
                {name: 'esdoc-es7-plugin'},
            ],
        };

        instance = new Bundlerify(gulp, {
            esdocOptions: 'invalidFile',
        });

        expect(instance.config.esdocOptions).toEqual(originalOptions);

    });
    /**
     * @test {Bundlerify#constructor}
     */
    it('should read the Jest options from a file', () => {
        // jest.mock('path');
        jest.setMock('fs', mockFs);
        jest.setMock('path', mockPath);

        // Try a valid file

        const dummyPackage = {
            jest: {
                collectCoverageOnlyFrom: {
                    'file.js': true,
                },
            },
        };
        mockFs.__setMockFiles({
            'package.json': JSON.stringify(dummyPackage),
            'jest.json': JSON.stringify(dummyPackage.jest),
        });

        let instance = new Bundlerify(gulp, {
            jestOptions: 'package.json',
        });

        expect(instance.config.jestOptions.collectCoverageOnlyFrom['ABSOLUTE/PATH/file.js'])
        .toBeTruthy();

        // Use a file that is not package.json

        instance = new Bundlerify(gulp, {
            jestOptions: 'jest.json',
        });

        expect(instance.config.jestOptions.collectCoverageOnlyFrom['ABSOLUTE/PATH/file.js'])
        .toBeTruthy();

        // Try an invalid file

        instance = new Bundlerify(gulp, {
            jestOptions: 'invalidFile',
        });

        expect(instance.config.jestOptions.collectCoverageOnlyFrom).toBeUndefined();

        // jest.setMock('path', originalPath);
    });
    /**
     * @test {Bundlerify#_getDependency}
     */
    it('should be able to overwrite and obtain the dependencies modules', () => {
        const dummyValues = {
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
            vinylTransform: {
                name: 'My Custom VinylTransform',
                module: 'vinyl-transform',
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
            gulpUglify: {
                name: 'My Custom Uglifier',
                module: 'gulp-uglify',
            },
            gulpJSCS: {
                name: 'My Custom JSCS',
                module: 'gulp-jscs',
            },
            gulpESLint: {
                name: 'My Custom ESLint',
                module: 'gulp-eslint',
            },
            esdoc: {
                name: 'My Custom ESDoc',
                module: 'esdoc',
            },
            esdocPublisher: {
                name: 'My Custom Publisher',
                module: 'esdoc/out/src/Publisher/publish',
            },
            esdocUploader: {
                name: 'My Custom ESDoc Uploader',
                module: 'esdoc-uploader',
            },
            jest: {
                name: 'My Custom Jest',
                module: 'jest-cli',
            },
            through: {
                name: 'My Custom Through',
                module: 'through2',
            },
        };

        const instance = new Bundlerify(gulp);

        instance.watchify = dummyValues.watchify.name;
        expect(instance.watchify).toEqual(dummyValues.watchify.name);
        instance.watchify = null;
        expect(instance.watchify).toEqual(require(dummyValues.watchify.module));

        instance.browserify = dummyValues.browserify.name;
        expect(instance.browserify).toEqual(dummyValues.browserify.name);
        instance.browserify = null;
        // For some reason, the reporter doesn't close the process when you require the
        // 'browserify' module, so this will inject it on the dependencies directory
        // so it doesn't have to require it.
        instance._dependencies.browserify = dummyValues.browserify.name;
        expect(instance.browserify).toEqual(dummyValues.browserify.name);

        instance.babelify = dummyValues.babelify.name;
        expect(instance.babelify).toEqual(dummyValues.babelify.name);
        instance.babelify = null;
        expect(instance.babelify).toEqual(require(dummyValues.babelify.module));

        instance.vinylSourceStream = dummyValues.vinylSourceStream.name;
        expect(instance.vinylSourceStream).toEqual(dummyValues.vinylSourceStream.name);
        instance.vinylSourceStream = null;
        expect(instance.vinylSourceStream).toEqual(require(dummyValues.vinylSourceStream.module));

        instance.vinylTransform = dummyValues.vinylTransform.name;
        expect(instance.vinylTransform).toEqual(dummyValues.vinylTransform.name);
        instance.vinylTransform = null;
        expect(instance.vinylTransform).toEqual(require(dummyValues.vinylTransform.module));

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

        instance.gulpUglify = dummyValues.gulpUglify.name;
        expect(instance.gulpUglify).toEqual(dummyValues.gulpUglify.name);
        instance.gulpUglify = null;
        expect(instance.gulpUglify).toEqual(require(dummyValues.gulpUglify.module));

        instance.gulpJSCS = dummyValues.gulpJSCS.name;
        expect(instance.gulpJSCS).toEqual(dummyValues.gulpJSCS.name);
        instance.gulpJSCS = null;
        expect(instance.gulpJSCS).toEqual(require(dummyValues.gulpJSCS.module));

        instance.gulpESLint = dummyValues.gulpESLint.name;
        expect(instance.gulpESLint).toEqual(dummyValues.gulpESLint.name);
        instance.gulpESLint = null;
        expect(instance.gulpESLint).toEqual(require(dummyValues.gulpESLint.module));

        instance.esdoc = dummyValues.esdoc.name;
        expect(instance.esdoc).toEqual(dummyValues.esdoc.name);
        instance.esdoc = null;
        expect(instance.esdoc).toEqual(require(dummyValues.esdoc.module));

        instance.esdocPublisher = dummyValues.esdocPublisher.name;
        expect(instance.esdocPublisher).toEqual(dummyValues.esdocPublisher.name);
        instance.esdocPublisher = null;
        expect(instance.esdocPublisher).toEqual(require(dummyValues.esdocPublisher.module));

        instance.esdocUploader = dummyValues.esdocUploader.name;
        expect(instance.esdocUploader).toEqual(dummyValues.esdocUploader.name);
        instance.esdocUploader = null;
        expect(instance.esdocUploader).toEqual(require(dummyValues.esdocUploader.module).default);

        instance.jest = dummyValues.jest.name;
        expect(instance.jest).toEqual(dummyValues.jest.name);
        instance.jest = null;
        expect(instance.jest).toEqual(require(dummyValues.jest.module));

        instance.through = dummyValues.through.name;
        expect(instance.through).toEqual(dummyValues.through.name);
        instance.through = null;
        expect(instance.through).toEqual(require(dummyValues.through.module));
    });
    /**
     * @test {Bundlerify#tasks}
     */
    it('should register the basic tasks', () => {
        const mockGulp = jest.genMockFromModule('gulp');
        const mockFunc = jest.genMockFunction();
        const mockRimRaf = jest.genMockFromModule('rimraf');
        const instance = new Bundlerify(mockGulp, {
            tasks: {
                docs: false,
                lint: {
                    deps: ['dep1', 'dep2'],
                    method: () => {},
                },
            },
        });

        instance.rimraf = mockRimRaf;
        expect(instance.tasks()).toEqual(instance);
        const tasksCalls = mockGulp.task.mock.calls;
        const tasksNames = Object.keys(instance.config.tasks);
        for (let i = 0; i < (tasksNames.length - 1); i++) {
            expect(tasksCalls[i][0]).toEqual(tasksNames[i]);
        }

        expect(tasksCalls.length).toEqual(tasksNames.length - 1);
        const cleanTask = mockGulp.task.mock.calls[3];
        cleanTask[2](() => {});

        expect(mockRimRaf.mock.calls.length).toEqual(1);
        expect(mockRimRaf.mock.calls[0][0]).toEqual(instance.config.dist.dir);
        expect(mockRimRaf.mock.calls[0][1]).toEqual(jasmine.any(Function));
    });
    /**
     * @test {Bundlerify#tasks}
     */
    it('should overwrite the basic tasks settings', () => {
        const mockGulp = jest.genMockFromModule('gulp');
        const mockBuildFunc = jest.genMockFunction();
        const mockRimRaf = jest.genMockFromModule('rimraf');
        const instance = new Bundlerify(mockGulp, {
            tasks: {
                build: {
                    deps: ['dep1', 'dep2'],
                    method: mockBuildFunc,
                },
                clean: {
                    name: 'removeEverything',
                },
            },
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
        const cleanTask = mockGulp.task.mock.calls[3];
        cleanTask[2](() => {});

        expect(mockRimRaf.mock.calls.length).toEqual(1);
        expect(mockRimRaf.mock.calls[0][0]).toEqual(instance.config.dist.dir);
        expect(mockRimRaf.mock.calls[0][1]).toEqual(jasmine.any(Function));
    });
    /**
     * @test {Bundlerify#clean}
     */
    it('should run the clean task', () => {
        const mockRimRaf = jest.genMockFromModule('rimraf');
        const mockBeforeTask = jest.genMockFunction();
        const instance = new Bundlerify(gulp, {
            beforeTask: mockBeforeTask,
            tasks: {
                clean: {
                    deps: ['randomDep'],
                },
            },
        });

        instance.rimraf = mockRimRaf;
        instance.clean(() => {});

        expect(mockRimRaf.mock.calls.length).toEqual(1);
        expect(mockRimRaf.mock.calls[0][0]).toEqual(instance.config.dist.dir);
        expect(mockRimRaf.mock.calls[0][1]).toEqual(jasmine.any(Function));

        expect(mockBeforeTask.mock.calls.length).toEqual(1);
        expect(mockBeforeTask.mock.calls[0][0]).toEqual('clean');
        expect(mockBeforeTask.mock.calls[0][1]).toEqual(instance);

    });
    /**
     * @test {Bundlerify#cleanEs5}
     */
    it('should run the cleanEs5 task', () => {
        const mockRimRaf = jest.genMockFromModule('rimraf');
        const mockBeforeTask = jest.genMockFunction();
        const instance = new Bundlerify(gulp, {
            beforeTask: mockBeforeTask,
            tasks: {
                cleanEs5: {
                    name: 'cleanEs5Directory',
                },
            },
        });
        instance.rimraf = mockRimRaf;
        instance.cleanEs5(() => {});

        expect(mockRimRaf.mock.calls.length).toEqual(1);
        expect(mockRimRaf.mock.calls[0][0]).toEqual(instance.config.es5.dir);
        expect(mockRimRaf.mock.calls[0][1]).toEqual(jasmine.any(Function));

        expect(mockBeforeTask.mock.calls.length).toEqual(1);
        expect(mockBeforeTask.mock.calls[0][0]).toEqual('cleanEs5Directory');
        expect(mockBeforeTask.mock.calls[0][1]).toEqual(instance);

    });
    /**
     * @test {Bundlerify#lint}
     */
    it('should run the lint task', () => {
        const mockGulp = new BrowserifyMock();
        const mockBeforeTask = jest.genMockFunction();
        const mockGulpIf = jest.genMockFromModule('gulp-if');
        const mockGulpESLint = jest.genMockFromModule('gulp-eslint');
        const mockGulpJSCS = jest.genMockFromModule('gulp-jscs');

        const instance = new Bundlerify(mockGulp, {
            beforeTask: mockBeforeTask,
            tasks: {
                lint: 'linter',
            },
        });

        instance.gulpIf = mockGulpIf;
        instance.gulpJSCS = mockGulpJSCS;
        instance.gulpESLint = mockGulpESLint;
        instance.lint();

        expect(mockGulp.srcMock.mock.calls.length).toEqual(1);
        expect(mockGulp.pipeMock.mock.calls.length).toEqual(3);
        expect(mockGulpIf.mock.calls.length).toEqual(3);
        expect(mockGulpESLint.mock.calls.length).toEqual(1);
        expect(mockGulpESLint.format.mock.calls.length).toEqual(1);
        expect(mockGulpJSCS.mock.calls.length).toEqual(1);

        expect(mockBeforeTask.mock.calls.length).toEqual(1);
        expect(mockBeforeTask.mock.calls[0][0]).toEqual('lint');
        expect(mockBeforeTask.mock.calls[0][1]).toEqual(instance);
    });
    /**
     * @test {Bundlerify#test}
     */
    it('should run the test task', () => {
        const mockGulp = new BrowserifyMock();
        const mockThrough = jest.genMockFromModule('through2');
        const mockJest = jest.genMockFromModule('jest-cli');
        const mockGulpUtil = jest.genMockFromModule('gulp-util');
        const mockSuccess = jest.genMockFunction();

        const instance = new Bundlerify(mockGulp);
        instance.through = mockThrough;
        instance.jest = mockJest;
        instance.gulpUtil = mockGulpUtil;

        console.log = jasmine.createSpy('log');

        instance.test();

        expect(mockGulp.srcMock.mock.calls.length).toEqual(1);
        expect(mockGulp.pipeMock.mock.calls.length).toEqual(1);

        mockThrough.obj.mock.calls[0][0]({
            path: 'abc',
        }, true, mockSuccess);

        mockJest.runCLI.mock.calls[0][2](false);
        expect(console.log).toHaveBeenCalled();
        mockJest.runCLI.mock.calls[0][2](true);
        console.log = originalConsoleLog;

    });
    /**
     * @test {Bundlerify#docs}
     */
    it('should run the docs task', () => {
        const mockESDoc = jest.genMockFromModule('esdoc');
        const mockBeforeTask = jest.genMockFunction();
        const instance = new Bundlerify(gulp, {
            beforeTask: mockBeforeTask,
            tasks: {
                docs: {
                    name: 'documentation',
                },
            },
        });
        instance.esdoc = mockESDoc;
        instance.docs();
        expect(mockESDoc.generate.mock.calls.length).toEqual(1);
        expect(mockESDoc.generate.mock.calls[0][0]).toEqual(instance.config.esdocOptions);
        expect(mockESDoc.generate.mock.calls[0][1]).toEqual(jasmine.any(Function));

        expect(mockBeforeTask.mock.calls.length).toEqual(1);
        expect(mockBeforeTask.mock.calls[0][0]).toEqual('documentation');
        expect(mockBeforeTask.mock.calls[0][1]).toEqual(instance);
    });
    /**
     * @test {Bundlerify#uploadDocs}
     */
    it('should run the uploadDocs task', () => {
        const mockBeforeTask = jest.genMockFunction();
        const mockCallback = jest.genMockFunction();
        const instance = new Bundlerify(gulp, {
            beforeTask: mockBeforeTask,
        });

        instance.esdocUploader = ESDocUploaderMock;
        const mockUploader =
        // Successful upload
        instance.uploadDocs(mockCallback);

        expect(ESDocUploaderMockObjs.uploadMock.mock.calls.length).toEqual(1);
        ESDocUploaderMockObjs.uploadMock.mock.calls[0][0]();
        expect(mockCallback.mock.calls.length).toEqual(1);

        // Failed upload
        ESDocUploaderMockObjs.canUploadReturn = false;
        instance.uploadDocs(mockCallback);
        expect(ESDocUploaderMockObjs.uploadMock.mock.calls.length).toEqual(1);

        // Successful upload without a callback
        ESDocUploaderMockObjs.canUploadReturn = true;
        instance.uploadDocs();
        expect(ESDocUploaderMockObjs.uploadMock.mock.calls.length).toEqual(2);
        expect(ESDocUploaderMockObjs.uploadMock.mock.calls[1][0]).toEqual(jasmine.any(Function));
        ESDocUploaderMockObjs.uploadMock.mock.calls[1][0]();

        expect(mockBeforeTask.mock.calls.length).toEqual(3);
        expect(mockBeforeTask.mock.calls[0][0]).toEqual('uploadDocs');
        expect(mockBeforeTask.mock.calls[0][1]).toEqual(instance);
    });
    /**
     * @test {Bundlerify#build}
     */
    it('should run the build task', () => {
        const mockBrowserify = new BrowserifyMock();
        const mockGulp = jest.genMockFromModule('gulp');
        const mockBabelify = jest.genMockFromModule('babelify');
        const mockSource = jest.genMockFromModule('vinyl-source-stream');
        const mockGulpIf = jest.genMockFromModule('gulp-if');
        const mockBrowserSync = jest.genMockFromModule('browser-sync');
        const mockUglify = jest.genMockFromModule('gulp-uglify');
        const mockStreamify = jest.genMockFromModule('gulp-streamify');
        const mockGulpUtil = jest.genMockFromModule('gulp-util');
        const mockPolyfill = jest.genMockFunction();

        const instance = new Bundlerify(mockGulp, {
            polyfillsEnabled: true,
            polyfills: [
                mockPolyfill,
                'whatwg-fetch/fetch',
                'core-js/fn/symbol',
                'core-js/fn/promise',
            ],
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
            fullPaths: false,
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
        console.log = originalConsoleLog;

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
    /**
     * @test {Bundlerify#es5}
     */
    it('should run the es5 task', () => {
        const mockGulp = new BrowserifyMock();
        const mockTransform = jest.genMockFromModule('vinyl-transform');
        const mockBabelify = jest.genMockFromModule('babelify');
        const mockSource = jest.genMockFromModule('vinyl-source-stream');
        const mockGulpIf = jest.genMockFromModule('gulp-if');
        const mockUglify = jest.genMockFromModule('gulp-uglify');
        const mockStreamify = jest.genMockFromModule('gulp-streamify');

        const instance = new Bundlerify(mockGulp, {
            uglify: true,
        });

        instance.babelify = mockBabelify;
        instance.vinylTransform = mockTransform;
        instance.vinylSourceStream = mockSource;
        instance.gulpIf = mockGulpIf;
        instance.ugflifier = mockUglify;
        instance.gulpStreamify = mockStreamify;

        instance.es5();

        expect(mockGulp.srcMock.mock.calls.length).toEqual(1);

        expect(mockGulp.pipeMock.mock.calls.length).toEqual(3);

        expect(mockGulpIf.mock.calls.length).toEqual(1);
        expect(mockGulpIf.mock.calls[0][0]).toEqual(instance.config.uglify);

        expect(mockStreamify.mock.calls.length).toEqual(1);

        expect(mockGulp.destMock.mock.calls[0][0]).toEqual(instance.config.es5.dir);
    });
    /**
     * @test {Bundlerify#serve}
     */
    it('should run the serve task', () => {
        const mockBrowserify = new BrowserifyMock();
        const mockGulp = jest.genMockFromModule('gulp');
        const mockBabelify = jest.genMockFromModule('babelify');
        const mockSource = jest.genMockFromModule('vinyl-source-stream');
        const mockGulpIf = jest.genMockFromModule('gulp-if');
        const mockBrowserSync = jest.genMockFromModule('browser-sync');
        const mockUglify = jest.genMockFromModule('gulp-uglify');
        const mockStreamify = jest.genMockFromModule('gulp-streamify');

        const instance = new Bundlerify(mockGulp);
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
            fullPaths: false,
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
