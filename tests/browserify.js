/**
 * For some reason, if you require browserify in Jest, the reporter hangs the process and it never
 * exists, so I made this mock class to test the functionality of both Browserify, and Browserify
 * with Watchify.
 * This class also mocks the methods from a file stream.
 * @version 1.0.0
 */
class BrowserifyMock {
    /**
     * It creates all the mocks functions for the methods to call.
     */
    constructor() {
        this.mainMock = jest.genMockFunction();
        this.bundleMock = jest.genMockFunction();
        this.transformMock = jest.genMockFunction();
        this.eventsMock = jest.genMockFunction();
        this.pipeMock = jest.genMockFunction();
        this.watchifyMock = jest.genMockFunction();
    }
    /**
     * The mock method Browserify itself.
     * @param  {Array}  entries - The files for Browserify to build.
     * @param  {Object} options - The Browserify settings.
     * @return {BrowserifyMock} It returns the current instance, so it can be chained.
     */
    browserify(entries, options) {
        this.mainMock(entries, options);
        return this;
    }
    /**
     * It mocks the Browserify `bundle` method.
     * @return {BrowserifyMock} It returns the current instance, so it can be chained.
     */
    bundle() {
        this.bundleMock();
        return this;
    }
    /**
     * It mocks the Browserify `transform` method.
     * @param  {Function} callback - The actual function that transforms the stream.
     * @return {BrowserifyMock} It returns the current instance, so it can be chained.
     */
    transform(callback) {
        this.transformMock(callback);
        return this;
    }
    /**
     * It mocks the stream `on` method.
     * @param  {String}   eventName - The event name.
     * @param  {Function} callback  - The callback function to be called when the event is
     *                                triggered.
     * @return {BrowserifyMock} It returns the current instance, so it can be chained.
     */
    on(eventName, callback) {
        this.eventsMock(eventName, callback);
        return this;
    }
    /**
     * It mocks the stream `pipe` method.
     * @param  {Function} action - The function to be executed on the pipe step.
     * @return {BrowserifyMock} It returns the current instance, so it can be chained.
     */
    pipe(action) {
        this.pipeMock(action);
        return this;
    }
    /**
     * It mocks the Watchify module call.
     * @param  {Function} browserifyInstance - The Browserify bundle.
     * @return {BrowserifyMock} It returns the current instance, so it can be chained.
     */
    watchify(browserifyInstance) {
        this.watchifyMock(browserifyInstance);
        return this;
    }
}
/**
 * @type {BrowserifyMock}
 * @module BrowserifyMock
 */
export default BrowserifyMock;
