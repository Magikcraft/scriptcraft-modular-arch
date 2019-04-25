/*
This file is modified MIT-licensed code from Scriptcraft
See license-scriptcraft.txt
*/

// DO NOT CONVERT TO TYPESCRIPT

// THIS FILE MUST BE JAVASCRIPT

(function (rootDir, modulePaths, hooks, evaluate) {

    var debug = function(message) {
        if (global.__requireDebug) {
            console.log(message)
        }
    }

    // make the old require available as __require
    global.__require = require;

    var File = java.io.File,
        FileReader = java.io.FileReader,
        BufferedReader = java.io.BufferedReader;

    function fileExists(file) {
        if (file.isDirectory()) {
            debug('File is directory: ' + file)  // @DEBUG
            return readModuleFromDirectory(file);
        } else {
            debug('File is NOT directory: ' + file)  // @DEBUG
            return file;
        }
    }

    function _canonize(file) {
        return '' + file.canonicalPath.replaceAll('\\\\', '/');
    }

    function readModuleFromDirectory(dir) {

        debug('Searching directory ' + dir)  // @DEBUG
        // look for a package.json file
        var pkgJsonFile = new File(dir, './package.json');
        if (pkgJsonFile.exists()) {
            debug('Found package.json')  // @DEBUG

            var pkg = scload(pkgJsonFile);
            var mainFile;
            if (pkg.main) {
                mainFile = new File(dir, pkg.main);
            } else {
                mainFile = new File(dir, './index.js');
            }
            debug('package.json specifies '+ mainFile)  // @DEBUG

            if (mainFile.exists()) {
                debug('Found ' + mainFile)  // @DEBUG

                return mainFile;
            } else {
                debug('NOT found  ' + mainFile)  // @DEBUG
                debug('Found ' + dir + '/package.json, but no entry point was specified or found for the module.')
                return null;
            }
        } else {
            // look for an index.js file
            var indexJsFile = new File(dir, './index.js');
            if (indexJsFile.exists()) {
                return indexJsFile;
            } else {
                debug(dir + './index.js does not exist') // @DEBUG
                return null;
            }
        }
    }


    /**********************************************************************
  ### module name resolution

  When resolving module names to file paths, ScriptCraft uses the following rules...

   1. if the module does not begin with './' or '/' then ...

      1.1 Look in the 'scriptcraft/lib' directory. If it's not there then...
      1.2 Look in the 'scriptcraft/modules' directory. If it's not there then
          Throw an Error.

   2. If the module begins with './' or '/' then ...

      2.1 if the module begins with './' then it's treated as a file path. File paths are
          always relative to the module from which the require() call is being made.

      2.2 If the module begins with '/' then it's treated as an absolute path.

      If the module does not have a '.js' suffix, and a file with the same name and a .js sufix exists,
      then the file will be loaded.

   3. If the module name resolves to a directory then...

      3.1 look for a package.json file in the directory and load the `main` property e.g.

      // package.json located in './some-library/'
      {
        "main": './some-lib.js',
        "name": 'some-library'
      }

      3.2 if no package.json file exists then look for an index.js file in the directory

  ***/

    function resolveModuleToFile(moduleName, parentDir) {
        debug('Resolving ' + moduleName) // @DEBUG
        var file = new File(moduleName),
            i = 0,
            resolvedFile;

        if (moduleName.indexOf('.') === 0) {
            // This is a relative path - we will make it absolute
            // This resolves paths like `../${dirname}
            // Without it, Scriptcraft can only do `../${dirname}/index
            // Will cause requiring hidden files to fail
            file = new File(parentDir, moduleName)
        }
        if (file.exists()) {
            return fileExists(file);
        }
        if (moduleName.indexOf('/') === 0) {
            // it's an absolute file path. We use this to include commando
            debug('Searching for absolute path')
            resolvedFile = new File(moduleName)
            if (resolvedFile.exists()) {
                debug('Resolved file: ' + resolvedFile)  // @DEBUG
                return fileExists(resolvedFile)
            }
            resolvedFile = new File(moduleName + '.js')
            if (resolvedFile.exists()) {
                debug('Resolved file: ' + resolvedFile)  // @DEBUG
                return fileExists(resolvedFile)
            }
            resolvedFile = new File(moduleName + '/index.js')
            if (resolvedFile.exists()) {
                debug('Resolved file: ' + resolvedFile)  // @DEBUG
                return fileExists(resolvedFile)
            }
            return null;
        }
        if (moduleName.match(/^[^\.\/]/)) {
            // it's a module named like so ... 'events' , 'net/http'
            debug('Searching for absolute module') // @DEBUG
            for (; i < modulePaths.length; i++) {
                resolvedFile = new File(
                    modulePaths[i] + moduleName
                )

                if (resolvedFile.exists()) {
                    debug('Resolved file: ' + resolvedFile)  // @DEBUG

                    return fileExists(resolvedFile)
                } else {
                    // try appending a .js to the end
                    resolvedFile = new File(
                        modulePaths[i] + moduleName + '.js'
                    )
                    if (resolvedFile.exists()) {
                        return resolvedFile
                    }
                    // try appending a .js to the end
                     resolvedFile = new File(
                        modulePaths[i] + moduleName + '/index.js'
                    )
                    debug('Resolved file: ' + resolvedFile)  // @DEBUG

                    if (resolvedFile.exists()) {
                        return resolvedFile
                    }
                }
            }

            // Now search node_modules resolution paths
            var nodeModulePaths = [
                '/node_modules/',
                '/../node_modules/',
                '/../../node_modules/',
                '/../../../node_modules/'
            ]
            debug('Searching node_module paths')
            for (i=0; i < nodeModulePaths.length; i++) {
                debug('Using path ' + nodeModulePaths[i]);
                resolvedFile = new File(parentDir + nodeModulePaths[i] + moduleName);
                debug('Searching ' + resolvedFile);
                if (resolvedFile.exists()) {
                    debug('Resolved:' + resolvedFile)  // @DEBUG
                    return fileExists(resolvedFile);
                }
            }
        } else {
            debug('Searching for relative module ' + moduleName + ' - looking in: ' + parentDir) // @DEBUG
            debug(parentDir + moduleName + ' exists: ' + (new File(parentDir, moduleName)).exists())
            if ((file = new File(parentDir, moduleName)).exists()) {
                return fileExists(file);
            } else if ((file = new File(parentDir, moduleName + '.js')).exists()) { // try .js extension
                return file;
            } else if ((file = new File(parentDir, moduleName + '.json')).exists()) { // try .json extension
                return file;
            } else if ((file = new File(parentDir, moduleName + '/index.js')).exists()) { // try index.js
                return file;
            }
        }
        return null;
    }

    function _require(parentFile, path, options) {
        var file,
            canonizedFilename,
            moduleInfo,
            buffered,
            head = '(function(exports,module,require,__filename,__dirname){ ',
            code = '',
            line = null;

        if (typeof options == 'undefined') {
            options = { cache: true };
        } else {
            if (typeof options.cache == 'undefined') {
                options.cache = true;
            }
        }
        debug('Requiring: parentFile: ' + parentFile) // @DEBUG
        debug('Requiring: path: ' + path) // @DEBUG
        file = resolveModuleToFile(path, parentFile);
        debug('Resolved file: ' + file) // @DEBUG
        if (!file) {

            var errMsg = '' + _format('require() failed to find matching file for module \'%s\'' +
                'in any of the following locations \n%s <-- ## working dir ##\n', [path, parentFile.canonicalPath]);
            /**
             * This find search is helpful, but very slow with node_modules
             */
            // if (!(('' + path).match(/^\./))) {
            //     errMsg = errMsg + modulePaths.join('\n');
            // }
            // var find = _require(parentFile, 'find').exports;
            // var allJS = [];
            // for (var i = 0; i < modulePaths.length; i++) {
            //     var js = find(modulePaths[i]);
            //     for (var j = 0; j < js.length; j++) {
            //         if (js[j].match(/\.js$/)) {
            //             allJS.push(js[j].replace(modulePaths[i], ''));
            //         }
            //     }
            // }
            // var pathL = path.toLowerCase();
            // var candidates = [];
            // for (i = 0; i < allJS.length; i++) {
            //     var filenameparts = allJS[i];
            //     var candidate = filenameparts.replace(/\.js/, '');
            //     var lastpart = candidate.toLowerCase();
            //     if (pathL.indexOf(lastpart) > -1 || lastpart.indexOf(pathL) > -1) {
            //         candidates.push(candidate);
            //     }
            // }
            // if (candidates.length > 0) {
            //     errMsg += '\nBut found module/s named: ' + candidates.join(',') + ' - is this what you meant?';
            // }
            throw new Error(errMsg);
        }
        canonizedFilename = _canonize(file);

        moduleInfo = _loadedModules[canonizedFilename];
        if (moduleInfo) {
            if (options.cache) {
                return moduleInfo;
            }
        }
        if (hooks) {
            hooks.loading(canonizedFilename);
        }
        buffered = new BufferedReader(new FileReader(file));
        while ((line = buffered.readLine()) !== null) {
            code += line + '\n';
        }
        buffered.close(); // close the stream so there's no file locks

        if (canonizedFilename.toLowerCase().substring(canonizedFilename.length - 5) === '.json') // patch code when it is json
            code = 'module.exports = (' + code + ');';

        moduleInfo = {
            loaded: false,
            id: canonizedFilename,
            exports: {},
            require: _requireClosure(file.parentFile)
        };
        var tail = '})';
        code = head + code + tail;

        if (options.cache) {
            _loadedModules[canonizedFilename] = moduleInfo;
        }
        var compiledWrapper = null;
        try {
            compiledWrapper = evaluate(code);
        } catch (e) {
            /*
             wph 20140313 JRE8 (nashorn) gives misleading linenumber of evaluating code not evaluated code.
             This can be fixed by instead using __engine.eval
             */
            throw new Error('Error evaluating module ' + path
                + ' line #' + e.lineNumber
                + ' : ' + e.message, canonizedFilename, e.lineNumber);
        }
        var __dirname = '' + file.parentFile.canonicalPath;
        var parameters = [
            moduleInfo.exports, /* exports */
            moduleInfo,         /* module */
            moduleInfo.require, /* require */
            canonizedFilename,  /* __filename */
            __dirname           /* __dirname */
        ];
        try {
            if (compiledWrapper)
                compiledWrapper
                    .apply(moduleInfo.exports,  /* this */
                        parameters);
        } catch (e) {
            var snippet = '';
            if (('' + e.lineNumber).match(/[0-9]/)) {
                var lines = code.split(/\n/);
                if (e.lineNumber > 1) {
                    snippet = ' ' + lines[e.lineNumber - 2] + '\n';
                }
                snippet += '> ' + lines[e.lineNumber - 1] + '\n';
                if (e.lineNumber < lines.length) {
                    snippet += ' ' + lines[e.lineNumber] + '\n';
                }
            }
            throw new Error('Error executing module ' + path
                + ' line #' + e.lineNumber
                + ' : ' + e.message + (snippet ? ('\n' + snippet) : ''), canonizedFilename, e.lineNumber);
        }
        if (hooks) {
            hooks.loaded(canonizedFilename);
        }
        moduleInfo.loaded = true;
        return moduleInfo;
    }

    function _requireClosure(parentFile) {
        var _boundRequire = function requireBoundToParentSMA(path, options) {
            var module = _require(parentFile, path, options);
            return module.exports;
        };

        _boundRequire.resolve = function resolveBoundToParent(path) {
            return resolveModuleToFile(path, parentFile);
        };
        _boundRequire.cache = _loadedModules;

        return _boundRequire;
    }
    var _loadedModules = {};
    var _format = java.lang.String.format;
    return _requireClosure(new java.io.File(rootDir));
    // last line deliberately has no semicolon!
    /* eslint semi: off*/
})
