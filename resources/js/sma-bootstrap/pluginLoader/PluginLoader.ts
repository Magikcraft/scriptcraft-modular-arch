import { TestLoader } from './TestLoader'
const File = java.io.File

const log = msg => console.log(`[SMA] ${msg}`)

const loader = require(`../lib/loader`)
const canonize = file => '' + file.getCanonicalPath().replaceAll('\\\\', '/')

export class SMAPluginLoader {
    smaPluginsRootDirName: any
    smaPluginsRootDir: any
    testMode: boolean = false
    testLoaders: TestLoader[] = []
    constructor(smaPath: string) {
        this.smaPluginsRootDir = new File(smaPath)
        this.smaPluginsRootDirName = canonize(this.smaPluginsRootDir)
    }

    filterHiddenFiles = file => file.getName().indexOf('.') != 0
    absolutePluginPath = p => `${this.smaPluginsRootDirName}/${p}`

    async loadSMAPlugins(testMode) {
        this.testMode = testMode
        log(`Searching for SMA plugins in ${this.smaPluginsRootDir}`)

        const smaPlugins = this.smaPluginsRootDir.list(this.filterHiddenFiles)
        if (!smaPlugins) {
            log('No SMA plugins found.')
            return
        }

        // testLoader is populated in here
        const packages = this.getPackages(smaPlugins)

        // Do not run autoloading code if we are in test mode
        if (!testMode) {
            await this.autoLoad(packages)
        }

        log('SMA plugin loading complete.')
        return this.testLoaders
    }

    async autoLoad(packages) {
        const loadDirs = (await packages)
            .map(
                p =>
                    this.getLoadDirectoryFromPackageJson(p) ||
                    this.checkDefaultPluginsDir(p)
            )
            .filter(t => t)

        // Map, rather than forEach, for synchronisation
        return loadDirs.map(d => {
            try {
                log(`Loading ${d}...`)
                loader.autoloadAlphabetically(global, d)
                log(`Loaded ${d}.`)
            } catch (e) {
                log(`Error encountered while loading ${d}`)
                log(e)
            }
        })
    }

    async getPackages(smaPlugins: any) {
        const packages: { name: string; path: string }[] = []

        const addPackage = async (name: string) => {
            log(`Found plugin: ${name}`)
            const path = this.absolutePluginPath(`${name}`)
            packages.push({
                name,
                path,
            })
            if (this.testMode) {
                const testLoader = new TestLoader(path)
                testLoader.findTests()
                this.testLoaders.push(testLoader)
            }
        }

        const len = smaPlugins.length
        for (let i = 0; i < len; i++) {
            let name
            if (smaPlugins[i] === '__jasmine') {
                continue
            }
            // Check for package namespaces like @magikcraft or @scriptcraft
            const isNamespacedPackageDir = smaPlugins[i].indexOf('@') === 0
            if (isNamespacedPackageDir) {
                const namespace = smaPlugins[i]
                const namespacedDir = new File(
                    this.absolutePluginPath(`${namespace}`)
                )
                const namespacedPlugins = namespacedDir.list(
                    this.filterHiddenFiles
                )
                for (let n = 0; n < namespacedPlugins.length; n++) {
                    const pkgName = namespacedPlugins[n]
                    name = `${namespace}/${pkgName}`
                    addPackage(name)
                }
            } else {
                name = smaPlugins[i]
                addPackage(name)
            }
        }
        return packages
    }

    getLoadDirectoryFromPackageJson({ path, name }) {
        try {
            const pkgJson = require(`${path}/package.json`)
            log(`Found ${name}/package.json`)
            const loadDir =
                pkgJson.scriptcraft_load_dir ||
                (pkgJson.smaPluginConfig &&
                    pkgJson.smaPluginConfig.scriptcraft_load_dir)
            if (loadDir) {
                log(`package.json scriptcraft_load_dir: ${loadDir}`)
                log(`Scanning ${name}/${loadDir}`)
                const file = new File(`${path}/${loadDir}`)
                if (file.isDirectory()) {
                    log(`Found autoload directory ${name}/${loadDir}`)
                    return ('' + file.canonicalPath).replace(/\\\\/g, '/')
                }
            }
        } catch (e) {}
    }

    checkDefaultPluginsDir({ path, name }) {
        const file = new File(`${path}/plugins`)
        if (file.isDirectory()) {
            log(`Found autoload directory ${name}/plugins`)
            return ('' + file.canonicalPath).replace(/\\\\/g, '/')
        }
    }
}
