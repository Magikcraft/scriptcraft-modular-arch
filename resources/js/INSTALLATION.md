# Installing the ScriptCraft Modular Architecture Patch

```bash
# Add the Magikcraft bootstrap shim to ScriptCraft's normal startup
mv js/sma-bootstrap ${server}/scriptcraft/plugins/
# Add Jasmine as an SMA plugin
mkdir -p ${server}/scriptcraft-plugins/__jasmine/*
mv js/__jasmine/* ${server}/scriptcraft-plugins/__jasmine/
```
