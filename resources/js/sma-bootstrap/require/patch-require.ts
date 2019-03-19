const smaDirectory = '../scriptcraft-plugins'; // relative to scriptcraft dir

const log = msg => console.log(`[sma-patch-require] ${msg}`);

export function patch() {
    /*
        We're going to replace the global require function. This allows us to modify code
        as it is loaded.

        This file preps and loads it, replacing the existing global.require, and renaming
        it to __require.
    */

    const path = 'scriptcraft/lib/scriptcraft.js'


    const File = java.io.File
    const FileReader = java.io.FileReader
    const BufferedReader = java.io.BufferedReader

    const canonize = (file) => '' + file.getCanonicalPath().replaceAll('\\\\', '/')

    function _load(filename, warnOnFileNotFound) {
        let result: any = null
        let file = filename
        let r
        let reader
        let br
        let code
        let wrappedCode

        if (!(filename instanceof File)) {
            file = new File(filename)
        }
        const canonizedFilename = canonize(file)

        if (file.exists()) {
            reader = new FileReader(file)
            br = new BufferedReader(reader)
            code = ''
            try {
                r = br.readLine()
                while (r !== null) {
                    code += r + '\n'
                    r = br.readLine()
                }
                wrappedCode = `(${code})`
                result = eval(wrappedCode) // tslint:disable-line
                // issue #103 avoid side-effects of || operator on Mac Rhino
            } catch (e) {
                log(`Error evaluating ${canonizedFilename}, ${e}`)
            } finally {
                try {
                    reader.close()
                } catch (re) {
                    // fail silently on reader close error
                }
            }
        } else {
            if (warnOnFileNotFound) {
                log(canonizedFilename + ' not found')
            }
        }
        return result
    } // end _load()

    const jsPluginsRootDir = new File(path).parentFile.parentFile
    const jsPluginsRootDirName = canonize(jsPluginsRootDir);
    const configRequire = _load(
        `${jsPluginsRootDirName}/plugins/sma-bootstrap/require/require.js`,
        true,
    )

    /*
    setup paths to search for modules
    */

    const modulePaths = [
        `${jsPluginsRootDirName}/modules/`,
        `${jsPluginsRootDirName}/lib/`,
        `${jsPluginsRootDirName}/${smaDirectory}/`
    ]

    if (config.verbose) {
        log(
            'Setting up CommonJS-style module system. Root Directory: ' +
            jsPluginsRootDirName,
        )
        log('Module paths: ' + JSON.stringify(modulePaths))
    }
    const requireHooks = {
        loaded: loadedpath => {
            if (config.verbose) {
                log(`loaded ${loadedpath}`)
            }
        },
        loading: loadingpath => {
            if (config.verbose) {
                log(`loading ${loadingpath}`)
            }
        },
    }

    if (configRequire) {
        global.require = configRequire(
            jsPluginsRootDirName,
            modulePaths,
            requireHooks,
            code => eval(code) // tslint:disable-line
        );
        (require as any) = global.require;
        log('Patched global.require');
    } else {
        log(`There was a problem patching global.require!`);
    }
    return require;
}