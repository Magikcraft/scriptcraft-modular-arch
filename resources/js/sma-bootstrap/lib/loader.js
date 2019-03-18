/*
 This file is modified MIT-licensed code from Scriptcraft
 See license-scriptcraft.txt
 */
'use strict';
/*global persist,exports,config,__plugin,require*/
var find = require('./find');
/*
  plugin management
*/
var _plugins = {};

var JFile = java.io.File;

// var PluginsRootDir = new JFile('scriptcraft');
// var PluginsRootDir = new JFile('scriptcraft-magikcraft');

function _plugin(
  /* String */ moduleName,
  /* Object */ moduleObject,
    isPersistent
) {
    //
    // don't load plugin more than once
    //
    if (typeof _plugins[moduleName] != 'undefined') {
        return _plugins[moduleName].module;
    }

    var pluginData = { persistent: isPersistent, module: moduleObject };
    if (typeof moduleObject.store == 'undefined') {
        moduleObject.store = {};
    }
    _plugins[moduleName] = pluginData;

    if (isPersistent) {
        moduleObject.store = persist(moduleName, moduleObject.store);
    }
    return moduleObject;
}

function _autoload(context, pluginDir, options) {
    /*
     Reload all of the .js files in the given directory
     */

    var sourceFiles = [],
        property,
        module,
        pluginPath;
    sourceFiles = find(new JFile(pluginDir));

    var len = sourceFiles.length;
    if (config && config.verbose) {
        console.info(len + ' scriptcraft plugins found in ' + pluginDir);
    }

    // Alphabetically sort files
    sourceFiles = sourceFiles.sort();

    for (var i = 0; i < len; i++) {
        pluginPath = sourceFiles[i];
        if (!pluginPath.match(/\.js$/)) {
            continue;
        }
        module = {};

        try {
            module = require(pluginPath, options);
            for (property in module) {
                /*
                 all exports in plugins become members of context object
                 */
                context[property] = module[property];
            }
        } catch (e) {
            var msg = 'Plugin ' + pluginPath + ' ' + e;
            console.error(msg);
        }
    }
}
exports.plugin = _plugin;
exports.autoloadAlphabetically = _autoload;
