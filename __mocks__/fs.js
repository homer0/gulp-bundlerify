'use strict';

// __mocks__/fs.js

// Get the real (not mocked) version of the 'path' module
const path = require.requireActual('path');

// Get the automatic mock for `fs`
const fsMock = jest.genMockFromModule('fs');

// Save the mocked references
let _mockFiles = {};

function __setMockFiles(newMockFiles) {
    _mockFiles = newMockFiles;
};

function readFileSync(path) {
    return _mockFiles[path];
}

// Override the default behavior of the `readFileSync` mock
fsMock.readFileSync.mockImplementation(readFileSync);

// Add a custom method to the mock
fsMock.__setMockFiles = __setMockFiles;

module.exports = fsMock;
