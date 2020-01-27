"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var TestLoader_1 = require("./TestLoader");
var File = java.io.File;
var log = function (msg) { return console.log("[SMA] " + msg); };
var loader = require("../lib/loader");
var canonize = function (file) { return '' + file.getCanonicalPath().replaceAll('\\\\', '/'); };
var SMAPluginLoader = /** @class */ (function () {
    function SMAPluginLoader(smaPath) {
        var _this = this;
        this.testMode = false;
        this.testLoaders = [];
        this.filterHiddenFiles = function (file) { return file.getName().indexOf('.') != 0; };
        this.absolutePluginPath = function (p) { return _this.smaPluginsRootDirName + "/" + p; };
        this.smaPluginsRootDir = new File(smaPath);
        this.smaPluginsRootDirName = canonize(this.smaPluginsRootDir);
    }
    SMAPluginLoader.prototype.loadSMAPlugins = function (testMode) {
        return __awaiter(this, void 0, void 0, function () {
            var smaPlugins, packages;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (__disableSMAPluginLoading) {
                            log('SMA Plugin loading disabled');
                            return [2 /*return*/];
                        }
                        this.testMode = testMode;
                        log("Searching for SMA plugins in " + this.smaPluginsRootDir);
                        smaPlugins = this.smaPluginsRootDir.list(this.filterHiddenFiles);
                        if (!smaPlugins) {
                            log('No SMA plugins found.');
                            return [2 /*return*/];
                        }
                        packages = this.getPackages(smaPlugins);
                        if (!!testMode) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.autoLoad(packages)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        log('SMA plugin loading complete.');
                        return [2 /*return*/, this.testLoaders];
                }
            });
        });
    };
    SMAPluginLoader.prototype.autoLoad = function (packages) {
        return __awaiter(this, void 0, void 0, function () {
            var loadDirs;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, packages];
                    case 1:
                        loadDirs = (_a.sent())
                            .map(function (p) {
                            return _this.getLoadDirectoryFromPackageJson(p) ||
                                _this.checkDefaultPluginsDir(p);
                        })
                            .filter(function (t) { return t; });
                        // Map, rather than forEach, for synchronisation
                        return [2 /*return*/, loadDirs.map(function (d) {
                                try {
                                    log("Loading " + d + "...");
                                    loader.autoloadAlphabetically(global, d);
                                    log("Loaded " + d + ".");
                                }
                                catch (e) {
                                    log("Error encountered while loading " + d);
                                    log(e);
                                }
                            })];
                }
            });
        });
    };
    SMAPluginLoader.prototype.getPackages = function (smaPlugins) {
        return __awaiter(this, void 0, void 0, function () {
            var packages, addPackage, len, i, name, isNamespacedPackageDir, namespace, namespacedDir, namespacedPlugins, n, pkgName;
            var _this = this;
            return __generator(this, function (_a) {
                packages = [];
                addPackage = function (name) { return __awaiter(_this, void 0, void 0, function () {
                    var path, testLoader;
                    return __generator(this, function (_a) {
                        log("Found plugin: " + name);
                        path = this.absolutePluginPath("" + name);
                        packages.push({
                            name: name,
                            path: path,
                        });
                        if (this.testMode) {
                            testLoader = new TestLoader_1.TestLoader(path);
                            testLoader.findTests();
                            this.testLoaders.push(testLoader);
                        }
                        return [2 /*return*/];
                    });
                }); };
                len = smaPlugins.length;
                for (i = 0; i < len; i++) {
                    name = void 0;
                    if (smaPlugins[i] === '__jasmine' ||
                        smaPlugins[i] === 'node_modules') {
                        continue;
                    }
                    isNamespacedPackageDir = smaPlugins[i].indexOf('@') === 0;
                    if (isNamespacedPackageDir) {
                        namespace = smaPlugins[i];
                        namespacedDir = new File(this.absolutePluginPath("" + namespace));
                        namespacedPlugins = namespacedDir.list(this.filterHiddenFiles);
                        for (n = 0; n < namespacedPlugins.length; n++) {
                            pkgName = namespacedPlugins[n];
                            name = namespace + "/" + pkgName;
                            addPackage(name);
                        }
                    }
                    else {
                        name = smaPlugins[i];
                        addPackage(name);
                    }
                }
                return [2 /*return*/, packages];
            });
        });
    };
    SMAPluginLoader.prototype.getLoadDirectoryFromPackageJson = function (_a) {
        var path = _a.path, name = _a.name;
        try {
            var pkgJson = require(path + "/package.json");
            log("Found " + name + "/package.json");
            var loadDir = pkgJson.scriptcraft_load_dir ||
                (pkgJson.smaPluginConfig &&
                    pkgJson.smaPluginConfig.scriptcraft_load_dir);
            if (loadDir) {
                log(name + " package.json scriptcraft_load_dir: " + loadDir);
                log("Scanning " + name + "/" + loadDir);
                var file = new File(path + "/" + loadDir);
                if (file.isDirectory()) {
                    log("Found autoload directory " + name + "/" + loadDir);
                    return ('' + file.canonicalPath).replace(/\\\\/g, '/');
                }
            }
        }
        catch (e) { }
    };
    SMAPluginLoader.prototype.checkDefaultPluginsDir = function (_a) {
        var path = _a.path, name = _a.name;
        var file = new File(path + "/plugins");
        if (file.isDirectory()) {
            log("Found autoload directory " + name + "/plugins");
            return ('' + file.canonicalPath).replace(/\\\\/g, '/');
        }
    };
    return SMAPluginLoader;
}());
exports.SMAPluginLoader = SMAPluginLoader;
