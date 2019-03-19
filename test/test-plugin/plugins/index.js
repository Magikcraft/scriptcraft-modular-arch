// Automatically loaded at start-up, because it is in the `plugins` sub-directory
console.log("Test plugin loaded!");

// Plugins can require other plugins as peer-dependencies.
var fs = require('test-plugin-2/fs');
console.log(fs.read('test.txt'));