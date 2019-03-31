declare const jasmineRequire
declare const load
// Load Jasmine test libraries
const log = msg => console.log(`[Test] ${msg}`)

export async function loadJasmine() {
    global.window = this
    log('Loading Jasmine')
    load(`./scriptcraft-plugins/__jasmine/jasmine.js`)

    const jasmine = jasmineRequire.core(jasmineRequire)
    const env = jasmine.getEnv()
    const jsm = jasmineRequire.interface(jasmine, env)

    jsm.describe('Bootloader', () => {
        jsm.it('loads Jasmine', () => {
            jsm.expect(true).toBe(true)
        })
    })

    env.addReporter({
        jasmineStarted: function(suiteInfo) {
            log('Running suite with ' + suiteInfo.totalSpecsDefined + ' tests')
        },

        suiteStarted: function(suite) {
            log(suite.description + '...')
        },

        specStarted: function(result) {
            log('   ' + result.description)
        },

        specDone: function(result) {
            log('   ' + result.description + ': ' + result.status)

            for (var i = 0; i < result.failedExpectations.length; i++) {
                log('Failure: ' + result.failedExpectations[i].message)
                log(result.failedExpectations[i].stack)
            }
        },
        suiteDone: function(result) {},

        jasmineDone: function() {
            console.log('Finished tests')
        },
    })

    global.describe = jsm.describe
    global.it = jsm.it
    global.expect = jsm.expect

    // Load all tests
    return env
}
