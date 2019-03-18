# Magikcraft Bootstrap

Bootstrap sequence:

0. Load the ES6 polyfills into the global scope.
1. Patch `require` so that modules can be resolved from `magikcraft/modules/*` as `magikcraft/*`.
2. Load the boot tasks in `tasks` in alphabetical order.
3. Load everything in `autoload`.
