# Scriptcraft Modular Architecture

Scriptcraft Modular Architecture (SMA) adds support for modular plugins that live outside the `scriptcraft` root directory.

This provides isolation of custom plugin files, allowing plugins to live in their own repositories and be loaded via configuration - for example by mounting them in a docker container.

It also means that you can update the Scriptcraft version without impacting your own code.

## Scriptcraft Version

This uses [Scriptcraft 3.4.0](https://github.com/Magikcraft/ScriptCraft/tree/3.4.0-patched) patched to fix issue [#410](https://github.com/walterhiggins/ScriptCraft/issues/410).

Uses the [Scriptcraft Multi-engine plugin](https://github.com/Magikcraft/scriptcraft-multi-engine).

## Versions

-   Paperclip [build #60](https://papermc.io/downloads).
-   H2 1.4.200

## To Run

```bash
docker run -it -p 25665:25565 magikcraft/scriptcraft
```

For an example on starting the docker container with SMA plugins, refer to the example in the `test` directory.

## Note on getting op

When the server starts, you need to give yourself `op`. At the server console, type this:

```
op {your-minecraft-name-goes-here}
```

Make sure that you put your minecraft username in there. So, for example, if your Minecraft name is Rob123, you would type:

```
op Rob123
```

## Included plugins

-   Minecraft REST console
-   Holographic Displays
-   Essentials
-   Motd Manager Reloaded
-   Multiverse Core
-   ProtocolLib
-   World Edit
-   Boss Bar
-   Durable Map

## Run with Modular Plugins

See the `run.sh` file for an example of how to mount modular scriptcraft plugins in the Docker image.

## Building

To build the image, run:

```bash
docker build -t magikcraft/scriptcraft .
```

## Scriptcraft Modular Architecture

## Rationale

We initially developed our plugins for Magikcraft and MCT1 (Minecraft for Type 1 Diabetes) inside Scriptcraft. This meant we had code spread between Scriptcraft's `lib`, `module`, and `plugins` folders. Upgrading Scriptcraft was a complex undertaking with multiple touch points.

Also, when we wanted to open source parts of our code base, we had to either get it accepted into Scriptcraft upstream, or make it available as a patch on top of Scriptcraft, or a fork of Scriptcraft.

We developed the Scriptcraft Modular Architecture to allow us to easily integrate code with Scriptcraft at run-time, while keeping it in a separate repository.

## Implementation

1. We put a directory outside scriptcraft and load additional modules in there. So the directory structure looks like this:

```
   minecraft
       - scriptcraft-plugins
           - magikcraft
           - mct1
       - scriptcraft
```

2. We mount a custom bootstrap into `scriptcraft/plugins` via docker. This bootstrap is loaded by Scriptcraft's standard plugin loading.

3. The bootstrap:

-   Replaces the standard scriptcraft implementation of `require` at run-time. This custom require adds the `scriptcraft-plugins` to the require resolution search paths.

-   Scans each SMA plugin for a `package.json` file. If found, checks for a `scriptcraft_load_dir` key. If present, the contents of the directory specified in this key are autoloaded.

-   If no `package.json` is found in an SMA plugin, or if it does not specify a `scriptcraft_load_dir`, then the bootstrap looks for a `plugin` folder in the SMA plugin, and loads everything in there if it is present.

## Module Resolution

The SMA `require` searches the standard Scriptcraft locations first, then checks the scriptcraft-plugins directory. As an example, here is how `magikcraft/fs` gets resolved:

```
scriptcraft/lib/magicraft/fs
scriptcraft/modules/magikcraft/fs
scriptcraft/../scriptcraft-plugins/magikcraft/fs
```

**Note:** in SMA plugins you do not get the magic of searching `lib` and `module` subdirectories in your SMA plugin. The path is literal. So `magikcraft/fs` will resolve `scriptcraft-plugins/magikcraft/fs`, but not:

`scriptcraft-plugins/magikcraft/lib/fs`, or

`scriptcraft-plugins/magikcraft/modules/fs`.

## Polyfills

The Scriptcraft Modular Architecture environment includes a number of ES6 polyfills. Our code at Magikcraft is written in TypeScript, and we missed a number of modern features while coding, so we added polyfills to the runtime to support the following:

-   `Array.prototype.find`
-   `Array.prototype.from`
-   `Array.prototype.includes`
-   `EventEmitter`
-   `Object.assign`
-   `Promise`
-   `String.prototype.includes`
-   `String.prototype.repeat`
-   `String.prototype.padStart`
-   `String.prototype.padEnd`

## Making a SMA Plugin

The easiest way to make an SMA Plugin is using the [Scriptcraft-SMA Yeoman generator](https://www.npmjs.com/package/generator-sma-plugin).

For an example of a Scriptcraft SMA plugin, refer to [MCT1](https://github.com/Magikcraft/mct1).
