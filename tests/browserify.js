
class BrowserifyMock {

    constructor() {

        this.mainMock = jest.genMockFunction();
        this.bundleMock = jest.genMockFunction();
        this.transformMock = jest.genMockFunction();
        this.eventsMock = jest.genMockFunction();
        this.pipeMock = jest.genMockFunction();
        this.watchifyMock = jest.genMockFunction();

    }

    browserify(entries, options) {
        this.mainMock(entries, options);
        return this;
    }

    bundle() {
        this.bundleMock();
        return this;
    }

    transform(callback) {
        this.transformMock(callback);
        return this;
    }

    on(eventName, callback) {
        this.eventsMock(eventName, callback);
        return this;
    }

    pipe(action) {
        this.pipeMock(action);
        return this;
    }

    watchify(browserifyInstance) {
        this.watchifyMock(browserifyInstance);
        return this;
    }
}

export default BrowserifyMock;
