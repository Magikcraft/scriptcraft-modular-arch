const File = java.io.File
const smaPath = 'scriptcraft-plugins'
/**
 * Cannot use require('magikcraft/*') until we patch require.
 */
const log = msg => console.log(msg);

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
; (require as any) = require('./require/patch-require').patch();

/**
 * We use a path relative to the root,
 * because we lost our context when we patched require.
 */
const loader = require(`./plugins/sma-bootstrap/lib/loader`);

log('Loading SMA plugins...');

const canonize = (file) => '' + file.getCanonicalPath().replaceAll('\\\\', '/');

const smaPluginsRootDir = new File(smaPath)
const smaPluginsRootDirName = canonize(smaPluginsRootDir);

log(`Searching for SMA plugins in ${smaPluginsRootDir}...`);

const smaPlugins = smaPluginsRootDir.list(function (file) { return file.getName().indexOf('.') != 0 });
if (!smaPlugins) {
    log('No plugins found.')
} else {
    const len = smaPlugins.length;
    const pluginDirs: string[] = [];
    for (let i = 0; i < len; i++) {
        log(`Found SMA Plugin: ${smaPlugins[i]}`)
        try {
            const pkgJson = require(`${smaPluginsRootDirName}/${smaPlugins[i]}/package.json`);
            console.log(`Found ${smaPlugins[i]}/package.json`)
            if (pkgJson.scriptcraft_load_dir) {
                console.log(`Scanning ${smaPlugins[i]}/${pkgJson.scriptcraft_load_dir}`)
                const file = new File(`${smaPluginsRootDirName}/${smaPlugins[i]}/${pkgJson.scriptcraft_load_dir}`);
                if (file.isDirectory()) {
                    console.log(`Found autoload directory ${smaPlugins[i]}/${pkgJson.scriptcraft_load_dir}`)
                    pluginDirs.push(('' + file.canonicalPath).replace(/\\\\/g, '/'));
                }
                pluginDirs.push();
            }
        } catch (e) {
            const file = new File(`${smaPluginsRootDirName}/${smaPlugins[i]}/plugins`);
            if (file.isDirectory()) {
                console.log(`Found autoload directory ${smaPlugins[i]}/plugins`);
                pluginDirs.push(('' + file.canonicalPath).replace(/\\\\/g, '/'));
            }
        }

    }

    // Map, rather than forEach, for synchronisation
    pluginDirs.map(d => {
        try {
            log(`Loading ${d}...`);
            loader.autoloadAlphabetically(global, d);
            log(`Loaded ${d}.`)
        } catch (e) {
            log(`Error encountered while loading ${d}`);
            log(e);
        }
    });
}
log('SMA plugin loading complete.');
