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

    let failures = 0

    env.addReporter({
        jasmineStarted: function(suiteInfo) {
            log('Running suite with ' + suiteInfo.totalSpecsDefined + ' tests')
        },

        suiteStarted: function(suite) {
            log(' ')
            log('\u001b[35m' + suite.description + '...\u001b[0m')
        },

        specStarted: function(result) {
            // log('   ' + result.description)
        },

        specDone: function(result) {
            const status =
                result.status === 'passed'
                    ? '\u001b[32mpassed\u001b[0m'
                    : '\u001b[31mfailed\u001b[0m'
            log('   ' + result.description + ': ' + status)

            for (var i = 0; i < result.failedExpectations.length; i++) {
                failures++
                log(
                    '\u001b[31m      Failure: ' +
                        result.failedExpectations[i].message +
                        '\u001b[0m'
                )
                // log('      ' + result.failedExpectations[i].stack)
            }
        },
        suiteDone: function(result) {
            // log(JSON.stringify(result))
        },

        jasmineDone: function() {
            if (failures > 0) {
                log(`${failures} Jasmine tests have failed.`)
            } else {
                log('All Jasmine tests succeeded!')
            }
            log('All tests are now complete.') // Do not change this string - it is a signal to exit the container
        },
    })

    global.describe = jsm.describe
    global.it = jsm.it
    global.expect = jsm.expect

    // Load all tests
    return env
}
