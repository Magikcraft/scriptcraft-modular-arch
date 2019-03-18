"use strict";
/*
Note: These polyfills are loaded asyncronously.
If you have code in `plugins`* that relies on these polyfills,
add this to the top of the file:

```
require('./polyfill').sync() // ensure polyfills finished loading.
```

This ensures that the polyfills are loaded before your code executes.

* code in `plugins` runs as soon as ScriptCraft boots, while the
ayncronously loaded polyfills take a couple of milliseconds to load.

By simply requiring these polyfills, they become avaiable to use.
The use of the `sync` array is to support the `sync` export, whose
purpose is described above.

*/
Object.defineProperty(exports, "__esModule", { value: true });
// tslint:disable
var log = function (msg) { return console.log("Polyfill " + msg); };
log('============================');
log('= Loading ES6 Polyfills...');
global.EventEmitter = require('./event-emitter');
var _sync = [
    global.EventEmitter,
    require('./array-from'),
    require('./object-assign'),
    require('./promise'),
    require('./string'),
    require('./array-filter'),
    require('./array-find'),
    require('./array-includes')
];
log('============================');
exports.sync = function () { return _sync; };
