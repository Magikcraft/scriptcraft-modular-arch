"use strict";
var File = java.io.File;
var smaPath = 'scriptcraft-plugins';
/**
 * Cannot use require('magikcraft/*') until we patch require.
 */
var log = function (msg) { return console.log(msg); };
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
log('Loading SMA plugins...');
var canonize = function (file) { return '' + file.getCanonicalPath().replaceAll('\\\\', '/'); };
var smaPluginsRootDir = new File(smaPath);
var smaPluginsRootDirName = canonize(smaPluginsRootDir);
log("Searching for SMA plugins in " + smaPluginsRootDir + "...");
var smaPlugins = smaPluginsRootDir.list(function (file) { return file.getName().indexOf('.') != 0; });
if (!smaPlugins) {
    log('No plugins found.');
}
else {
    var len = smaPlugins.length;
    var pluginDirs = [];
    for (var i = 0; i < len; i++) {
        log("Found " + smaPlugins[i]);
        var file = new File(smaPluginsRootDirName + "/" + smaPlugins[i] + "/plugins");
        if (file.isDirectory()) {
            pluginDirs.push(('' + file.canonicalPath).replace(/\\\\/g, '/'));
        }
    }
    // Map, rather than forEach, for synchronisation
    pluginDirs.map(function (d) {
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
}
log('SMA plugin loading complete.');
