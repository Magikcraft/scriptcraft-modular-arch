"use strict";
var smaPath = 'scriptcraft-plugins';
var testMode = java.lang.System.getenv('TEST_MODE') === 'true';
var requireDebug = java.lang.System.getenv('DEBUG_REQUIRE') === 'true';
/**
 * Cannot use require('magikcraft/*') until we patch require.
 */
var log = function (msg) { return console.log("[SMA] " + msg); };
log('============================');
log('=== Scriptcraft Modular Architecture Plugin');
log('== ©2019 www.magikcraft.io');
log('== portions ©2016 Walter Higgens');
log('============================');
if (testMode) {
    log('Test mode enabled.');
}
/**
 * Load ES6 polyfills globally.
 */
require('./polyfills').sync(); // tslint:disable-line
global.__requireDebug = requireDebug;
require = require('./require/patch-require').patch();
/**
 * We use a path relative to the root,
 * because we lost our context when we patched require.
 */
log('Loading SMA plugins');
var SMAPluginLoader = require('./plugins/sma-bootstrap/pluginLoader/PluginLoader').SMAPluginLoader;
var pluginLoader = new SMAPluginLoader(smaPath);
pluginLoader.loadSMAPlugins(testMode).then(function (testLoaders) {
    if (testMode) {
        var loadJasmine = require('../scriptcraft-plugins/__jasmine').loadJasmine;
        loadJasmine().then(function (env) {
            log('Loading test suites...');
            testLoaders.map(function (t) { return t && t.loadTests && t.loadTests(); });
            log('Waiting 5 seconds, then starting test suite...');
            setTimeout(function () { return env.execute(); }, 5000);
        });
    }
});
