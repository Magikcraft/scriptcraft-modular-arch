#!/bin/bash
docker run -it -p 25665:25565 \
    --mount source=scriptcraft-worlds,target=/server/worlds \
    --mount source=scriptcraft-cache,target=/server/cache \
    --mount type=bind,src=$(pwd)/test-plugin,dst=/server/scriptcraft-plugins/test \
    --mount type=bind,src=$(pwd)/test-plugin-2,dst=/server/scriptcraft-plugins/test-plugin-2 \
    magikcraft/scriptcraft
