"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("util");
Object.assign(global, {
    TextEncoder: util_1.TextEncoder,
    TextDecoder: util_1.TextDecoder
});
process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/destination-kolkata-test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.NODE_ENV = 'test';
const originalError = console.error;
const originalWarn = console.warn;
beforeAll(() => {
    console.error = jest.fn();
    console.warn = jest.fn();
});
afterAll(() => {
    console.error = originalError;
    console.warn = originalWarn;
});
jest.setTimeout(10000);
//# sourceMappingURL=setup.js.map