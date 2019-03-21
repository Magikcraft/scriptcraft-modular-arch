"use strict";
var File = java.io.File;
var smaPath = 'scriptcraft-plugins';
/**
 * Cannot use require('magikcraft/*') until we patch require.
 */
var log = function (msg) { return console.log("[SMA] " + msg); };
log('============================');
log('=== Scriptcraft Modular Architecture Plugin');
log('== ©2019 www.magikcraft.io');
log('== portions ©2016 Walter Higgens');
log('============================');
/**
 * Load ES6 polyfills globally.
 */
require('./polyfills').sync(); // tslint:disable-line
/**
 * Replace the global require with our custom implementation.
 *
 * The custom require:
 * 0. Adds the `scriptcraft-plugins` directory to the search path.
 */
;
require = require('./require/patch-require').patch();
/**
 * We use a path relative to the root,
 * because we lost our context when we patched require.
 */
var loader = require("./plugins/sma-bootstrap/lib/loader");
log('Loading SMA plugins');
var canonize = function (file) { return '' + file.getCanonicalPath().replaceAll('\\\\', '/'); };
var smaPluginsRootDir = new File(smaPath);
var smaPluginsRootDirName = canonize(smaPluginsRootDir);
var filterHiddenFiles = function (file) { return file.getName().indexOf('.') != 0; };
var absolutePluginPath = function (p) { return smaPluginsRootDirName + "/" + p; };
loadSMAPlugins();
function loadSMAPlugins() {
    log("Searching for SMA plugins in " + smaPluginsRootDir);
    var smaPlugins = smaPluginsRootDir.list(filterHiddenFiles);
    if (!smaPlugins) {
        log('No SMA plugins found.');
        return;
    }
    var packages = getPackages(smaPlugins);
    var loadDirs = packages
        .map(function (p) { return getLoadDirectoryFromPackageJson(p) || checkDefaultPluginsDir(p); })
        .filter(function (t) { return t; });
    // Map, rather than forEach, for synchronisation
    loadDirs.map(function (d) {
        try {
            log("Loading " + d + "...");
            loader.autoloadAlphabetically(global, d);
            log("Loaded " + d + ".");
        }
        catch (e) {
            log("Error encountered while loading " + d);
            log(e);
        }
    });
    log('SMA plugin loading complete.');
}
function getPackages(smaPlugins) {
    var packages = [];
    function addPackage(name) {
        log("Found plugin: " + name);
        packages.push({
            name: name,
            path: absolutePluginPath("" + name)
        });
    }
    var len = smaPlugins.length;
    for (var i = 0; i < len; i++) {
        var name = void 0;
        // Check for package namespaces like @magikcraft or @scriptcraft
        var isNamespacedPackageDir = smaPlugins[i].indexOf('@') === 0;
        if (isNamespacedPackageDir) {
            var namespace = smaPlugins[i];
            var namespacedDir = new File(absolutePluginPath("" + namespace));
            var namespacedPlugins = namespacedDir.list(filterHiddenFiles);
            for (var n = 0; n < namespacedPlugins.length; n++) {
                var pkgName = namespacedPlugins[n];
                name = namespace + "/" + pkgName;
                addPackage(name);
            }
        }
        else {
            name = smaPlugins[i];
            addPackage(name);
        }
    }
    return packages;
}
function getLoadDirectoryFromPackageJson(_a) {
    var path = _a.path, name = _a.name;
    try {
        var pkgJson = require(path + "/package.json");
        log("Found " + name + "/package.json");
        var loadDir = pkgJson.scriptcraft_load_dir;
        if (loadDir) {
            log("package.json scriptcraft_load_dir: " + loadDir);
            log("Scanning " + name + "/" + loadDir);
            var file = new File(path + "/" + loadDir);
            if (file.isDirectory()) {
                log("Found autoload directory " + name + "/" + loadDir);
                return ('' + file.canonicalPath).replace(/\\\\/g, '/');
            }
        }
    }
    catch (e) {
    }
}
function checkDefaultPluginsDir(_a) {
    var path = _a.path, name = _a.name;
    var file = new File(path + "/plugins");
    if (file.isDirectory()) {
        log("Found autoload directory " + name + "/plugins");
        return ('' + file.canonicalPath).replace(/\\\\/g, '/');
    }
}
