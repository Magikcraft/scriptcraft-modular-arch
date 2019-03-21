"use strict";
/*
This file is modified MIT-licensed code from Scriptcraft
See license-scriptcraft.txt
*/
Object.defineProperty(exports, "__esModule", { value: true });
var smaDirectory = '../scriptcraft-plugins'; // relative to scriptcraft dir
var log = function (msg) { return console.log("[SMA] " + msg); };
function patch() {
    /*
        We're going to replace the global require function. This allows us to modify the search path for module resolution

        This file preps and loads it, replacing the existing global.require, and renaming
        it to __require.
    */
    var path = 'scriptcraft/lib/scriptcraft.js';
    var File = java.io.File;
    var FileReader = java.io.FileReader;
    var BufferedReader = java.io.BufferedReader;
    var canonize = function (file) { return '' + file.getCanonicalPath().replaceAll('\\\\', '/'); };
    function _load(filename, warnOnFileNotFound) {
        var result = null;
        var file = filename;
        var r;
        var reader;
        var br;
        var code;
        var wrappedCode;
        if (!(filename instanceof File)) {
            file = new File(filename);
        }
        var canonizedFilename = canonize(file);
        if (file.exists()) {
            reader = new FileReader(file);
            br = new BufferedReader(reader);
            code = '';
            try {
                r = br.readLine();
                while (r !== null) {
                    code += r + '\n';
                    r = br.readLine();
                }
                wrappedCode = "(" + code + ")";
                result = eval(wrappedCode); // tslint:disable-line
                // issue #103 avoid side-effects of || operator on Mac Rhino
            }
            catch (e) {
                log("Error evaluating " + canonizedFilename + ", " + e);
            }
            finally {
                try {
                    reader.close();
                }
                catch (re) {
                    // fail silently on reader close error
                }
            }
        }
        else {
            if (warnOnFileNotFound) {
                log(canonizedFilename + ' not found');
            }
        }
        return result;
    } // end _load()
    var jsPluginsRootDir = new File(path).parentFile.parentFile;
    var jsPluginsRootDirName = canonize(jsPluginsRootDir);
    var configRequire = _load(jsPluginsRootDirName + "/plugins/sma-bootstrap/require/require.js", true);
    /*
    setup paths to search for modules
    */
    var modulePaths = [
        jsPluginsRootDirName + "/modules/",
        jsPluginsRootDirName + "/lib/",
        jsPluginsRootDirName + "/" + smaDirectory + "/"
    ];
    if (config.verbose) {
        log('Setting up CommonJS-style module system. Root Directory: ' +
            jsPluginsRootDirName);
        log('Module paths: ' + JSON.stringify(modulePaths));
    }
    var requireHooks = {
        loaded: function (loadedpath) {
            if (config.verbose) {
                log("loaded " + loadedpath);
            }
        },
        loading: function (loadingpath) {
            if (config.verbose) {
                log("loading " + loadingpath);
            }
        },
    };
    if (configRequire) {
        global.require = configRequire(jsPluginsRootDirName, modulePaths, requireHooks, function (code) { return eval(code); } // tslint:disable-line
        );
        require = global.require;
        log('Patched global.require');
    }
    else {
        log("There was a problem patching global.require!");
    }
    return require;
}
exports.patch = patch;
