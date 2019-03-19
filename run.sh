#!/bin/bash
docker run -it -p 25665:25565 \
    --mount source=scriptcraft-worlds,target=/server/worlds \
    --mount source=scriptcraft-cache,target=/server/cache \
# The following mount demonstrates how to mount an SMA plugin in the image
#    --mount type=bind,src=$(pwd)/test-plugin,dst=/server/scriptcraft-plugins/test \
# Uncomment the line below to test changes to sma-bootstrap without rebuilding the image - for sma-bootstrap dev only    
#    --mount type=bind,src=$(pwd)/resources/js/sma-bootstrap,dst=/server/scriptcraft/plugins/sma-bootstrap \
    magikcraft/scriptcraft
