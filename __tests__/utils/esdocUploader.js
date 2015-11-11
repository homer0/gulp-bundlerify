/**
 * A reference to the mock objects the class it's going to use.
 * @type {Object}
 */
const ESDocUploaderMockObjs = {
    canUploadReturn: true,
    constructorMock: jest.genMockFunction(),
    canUploadMock: jest.genMockFunction(),
    uploadMock: jest.genMockFunction(),
};
/**
 * A special class to mock `esdoc-upload`, because I can't modify the return value of `canUpload`
 * if it's being instantiated inside Bundlerify.
 * @version 1.0.0
 */
class ESDocUploaderMock {
    /**
     * It creates all the mocks and call the one for the constructor.
     */
    constructor() {

        ESDocUploaderMockObjs.constructorMock();
    }
    /**
     * Mock the `.canUpload()` method and return the value from  the `.canUploadReturn` property.
     * @return {Boolean} Whether it can upload the documentation or not.
     */
    canUpload() {
        ESDocUploaderMockObjs.canUploadMock();
        return ESDocUploaderMockObjs.canUploadReturn;
    }
    /**
     * Mock the `.upload(callback)` method.
     * @param {Function} callback A callback to be called when the upload process finishes.
     */
    upload(callback) {
        ESDocUploaderMockObjs.uploadMock(callback);
    }
}

export default {
    ESDocUploaderMock: ESDocUploaderMock,
    ESDocUploaderMockObjs: ESDocUploaderMockObjs,
};
