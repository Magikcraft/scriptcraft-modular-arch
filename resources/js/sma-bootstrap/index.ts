const File = java.io.File
const smaPath = 'scriptcraft-plugins'
/**
 * Cannot use require('magikcraft/*') until we patch require.
 */
const log = msg => console.log(`[SMA] ${msg}`);

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

log('Loading SMA plugins');

const canonize = (file) => '' + file.getCanonicalPath().replaceAll('\\\\', '/');

const smaPluginsRootDir = new File(smaPath)
const smaPluginsRootDirName = canonize(smaPluginsRootDir);

const filterHiddenFiles = file => file.getName().indexOf('.') != 0;
const absolutePluginPath = p => `${smaPluginsRootDirName}/${p}`


loadSMAPlugins();

function loadSMAPlugins() {

    log(`Searching for SMA plugins in ${smaPluginsRootDir}`);

    const smaPlugins = smaPluginsRootDir.list(filterHiddenFiles);
    if (!smaPlugins) {
        log('No SMA plugins found.');
        return;
    }
    const packages = getPackages(smaPlugins);

    const loadDirs = packages
        .map(p => getLoadDirectoryFromPackageJson(p) || checkDefaultPluginsDir(p))
        .filter(t => t);

    // Map, rather than forEach, for synchronisation
    loadDirs.map(d => {
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

}

function getPackages(smaPlugins: any) {
    const packages: { name: string, path: string }[] = [];

    function addPackage(name: string) {
        log(`Found plugin: ${name}`);
        packages.push({
            name,
            path: absolutePluginPath(`${name}`)
        });
    }

    const len = smaPlugins.length;
    for (let i = 0; i < len; i++) {
        let name;
        // Check for package namespaces like @magikcraft or @scriptcraft
        const isNamespacedPackageDir = smaPlugins[i].indexOf('@') === 0
        if (isNamespacedPackageDir) {
            const namespace = smaPlugins[i];
            const namespacedDir = new File(absolutePluginPath(`${namespace}`));
            const namespacedPlugins = namespacedDir.list(filterHiddenFiles);
            for (let n = 0; n < namespacedPlugins.length; n++) {
                const pkgName = namespacedPlugins[n];
                name = `${namespace}/${pkgName}`;
                addPackage(name);
            }
        } else {
            name = smaPlugins[i];
            addPackage(name);
        }
    }
    return packages;
}

function getLoadDirectoryFromPackageJson({ path, name }) {
    try {
        const pkgJson = require(`${path}/package.json`);
        log(`Found ${name}/package.json`)
        const loadDir = pkgJson.scriptcraft_load_dir;
        if (loadDir) {
            log(`package.json scriptcraft_load_dir: ${loadDir}`);
            log(`Scanning ${name}/${loadDir}`)
            const file = new File(`${path}/${loadDir}`);
            if (file.isDirectory()) {
                log(`Found autoload directory ${name}/${loadDir}`)
                return ('' + file.canonicalPath).replace(/\\\\/g, '/');
            }
        }
    } catch (e) {

    }
}

function checkDefaultPluginsDir({ path, name }) {
    const file = new File(`${path}/plugins`);
    if (file.isDirectory()) {
        log(`Found autoload directory ${name}/plugins`);
        return ('' + file.canonicalPath).replace(/\\\\/g, '/');
    }
}