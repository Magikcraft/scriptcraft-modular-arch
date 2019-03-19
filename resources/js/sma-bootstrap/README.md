# Magikcraft Bootstrap

Bootstrap sequence:

0. Load the ES6 polyfills into the global scope.
1. Patch `require` so that modules can be resolved from `scriptcraft-plugins`.
2. Scan the `scriptcraft-plugins` directory.
3. Autoload the contents of any `plugins` sub-directories in the SMA plugins.
