"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var File = java.io.File;
var log = function (msg) { return console.log("[SMA: Test] " + msg); };
var canonize = function (file) { return '' + file.getCanonicalPath().replaceAll('\\\\', '/'); };
var filterTestDirs = function (dir, file) { return file.indexOf('__test') == 0; };
var filterTestFiles = function (dir, file) { return file.indexOf('.spec.js') != -1; };
var TestLoader = /** @class */ (function () {
    function TestLoader(path) {
        this.tests = [];
        this.path = new File(path);
    }
    TestLoader.prototype.findTests = function () {
        var _this = this;
        log("Looking for tests in " + this.path);
        return Java.from(this.path.list(filterTestDirs))
            .map(function (n) {
            var testDirPath = _this.path + "/" + n;
            log("Looking for tests in " + testDirPath);
            var fileInTestDir = new File(testDirPath);
            if (fileInTestDir.isDirectory()) {
                Java.from(fileInTestDir.list(filterTestFiles)).map(function (t) {
                    var specPath = testDirPath + "/" + t;
                    log("Loading " + specPath);
                    _this.tests.push(specPath); // canonize(`${t}`))
                    return specPath;
                });
            }
        })
            .filter(function (l) { return l && l.length > 0; });
    };
    TestLoader.prototype.loadTests = function () {
        return this.tests.map(function (t) { return require(t); });
    };
    return TestLoader;
}());
exports.TestLoader = TestLoader;
