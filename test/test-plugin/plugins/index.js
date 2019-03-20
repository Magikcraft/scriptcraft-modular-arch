// Automatically loaded at start-up, because it is in the `plugins` sub-directory
console.log("Hello! Test plugin autoloaded! About to require something from a peer plugin...");

// Plugins can require other plugins as peer-dependencies.
var fs = require('test-plugin-2/fs');
console.log(fs.read('test.txt'));