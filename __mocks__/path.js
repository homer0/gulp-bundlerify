'use strict';

// __mocks__/path.js

// Get the automatic mock for `path`
const pathMock = jest.genMockFromModule('path');

function resolve(path) {
    return 'ABSOLUTE/PATH/' + path;
}

// Override the default behavior of the `resolve` mock
pathMock.resolve.mockImplementation(resolve);

module.exports = pathMock;
