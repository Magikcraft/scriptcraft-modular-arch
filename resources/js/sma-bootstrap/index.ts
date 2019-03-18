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

log('Loading SMA plugins...');

/**
 * SMA loader is alphabetically sorted
 */
const loader = require('./lib/loader');

const canonize = (file) => '' + file.getCanonicalPath().replaceAll('\\\\', '/');

const smaPluginsRootDir = new File(smaPath)
const smaPluginsRootDirName = canonize(smaPluginsRootDir);

log(`Searching for SMA plugins in ${smaPluginsRootDir}...`);

const smaPlugins = smaPluginsRootDir.list(function (file) { return file.getName().indexOf('.') != 0 });
const len = smaPlugins.length;
const pluginDirs: string[] = [];
for (let i = 0; i < len; i++) {
    const file = new File(`${smaPluginsRootDirName}/${smaPlugins[i]}/plugins`);
    if (file.isDirectory()) {
        log(`Found ${smaPlugins[i]}`)
        pluginDirs.push(('' + file.canonicalPath).replace(/\\\\/g, '/'));
    }
}

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

log('SMA plugin loading complete.');

/**
 * Replace the global require with our custom implementation.
 *
 * The custom require:
 * 0. Adds the `scriptcraft-plugins` directory to the search path.
 */
; (require as any) = require('./require/patch-require').patch();
