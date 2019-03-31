const File = java.io.File
const log = msg => console.log(`[SMA: Test] ${msg}`)

const canonize = file => '' + file.getCanonicalPath().replaceAll('\\\\', '/')
const filterTestDirs = (dir, file) => file.indexOf('__test') == 0
const filterTestFiles = (dir, file) => file.indexOf('.spec.js') != -1

export class TestLoader {
    path: any
    tests: string[] = []

    constructor(path: string) {
        this.path = new File(path)
    }

    findTests() {
        log(`Looking for tests in ${this.path}`)
        return Java.from(this.path.list(filterTestDirs))
            .map(n => {
                const testDirPath = `${this.path}/${n}`
                log(`Looking for tests in ${testDirPath}`)

                const fileInTestDir = new File(testDirPath)
                if (fileInTestDir.isDirectory()) {
                    Java.from(fileInTestDir.list(filterTestFiles)).map(t => {
                        const specPath = `${testDirPath}/${t}`
                        log(`Loading ${specPath}`)
                        this.tests.push(specPath) // canonize(`${t}`))
                        return specPath
                    })
                }
            })
            .filter(l => l && l.length > 0)
    }

    loadTests() {
        return this.tests.map(t => require(t))
    }
}
