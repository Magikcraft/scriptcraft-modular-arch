#!/bin/bash
MINECRAFT_TAG=1.15.2
docker run -it -p 25665:25565 \
    --mount source=scriptcraft-worlds,target=/_server_/worlds \
    --mount source=scriptcraft-cache,target=/_server_/cache \
    --mount type=bind,src=$(pwd)/resources/js/sma-bootstrap,dst=/_server_/scriptcraft/plugins/sma-bootstrap \
    --mount type=bind,src=$(pwd)/test/test-plugin,dst=/_server_/scriptcraft-plugins/test \
    --mount type=bind,src=$(pwd)/test/test-plugin-2,dst=/_server_/scriptcraft-plugins/test-plugin-2 \
    magikcraft/scriptcraft:$MINECRAFT_TAG

# The following mount demonstrates how to mount an SMA plugin in the image
#    --mount type=bind,src=$(pwd)/test-plugin,dst=/_server_/scriptcraft-plugins/test \
# The folllowing mount allows you to test changes to sma-bootstrap without rebuilding the image - for sma-bootstrap dev only
#    --mount type=bind,src=$(pwd)/resources/js/sma-bootstrap,dst=/_server_/scriptcraft/plugins/sma-bootstrap \
