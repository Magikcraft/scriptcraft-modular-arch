const smaPath = 'scriptcraft-plugins'
const testMode = java.lang.System.getenv('TEST_MODE') === 'true'

/**
 * Cannot use require('magikcraft/*') until we patch require.
 */
const log = msg => console.log(`[SMA] ${msg}`)

log('============================')
log('=== Scriptcraft Modular Architecture Plugin')
log('== ©2019 www.magikcraft.io')
log('== portions ©2016 Walter Higgens')
log('============================')

if (testMode) {
    log('Test mode enabled.')
}
/**
 * Load ES6 polyfills globally.
 */
require('./polyfills').sync() // tslint:disable-line

/**
 * Replace the global require with our custom implementation.
 *
 * The custom require:
 * 0. Adds the `scriptcraft-plugins` directory to the search path.
 */
;(require as any) = require('./require/patch-require').patch()

/**
 * We use a path relative to the root,
 * because we lost our context when we patched require.
 */

log('Loading SMA plugins')
const {
    SMAPluginLoader,
} = require('./plugins/sma-bootstrap/pluginLoader/PluginLoader')
const pluginLoader = new SMAPluginLoader(smaPath)
pluginLoader.loadSMAPlugins(testMode).then(testLoaders => {
    if (testMode) {
        const { loadJasmine } = require('../scriptcraft-plugins/__jasmine')

        loadJasmine().then(env => {
            log('Loading test suites...')
            testLoaders.map(t => t && t.loadTests && t.loadTests())
            log('Waiting 5 seconds, then starting test suite...')
            setTimeout(() => env.execute(), 5000)
        })
    }
})
