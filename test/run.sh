#!/bin/bash
docker run -it -p 25665:25565 \
    --mount source=scriptcraft-worlds,target=/_server_/worlds \
    --mount source=scriptcraft-cache,target=/_server_/cache \
    --mount type=bind,src=$(pwd)/test-plugin,dst=/_server_/scriptcraft-plugins/test \
    --mount type=bind,src=$(pwd)/test-plugin-2,dst=/_server_/scriptcraft-plugins/test-plugin-2 \
    magikcraft/scriptcraft
