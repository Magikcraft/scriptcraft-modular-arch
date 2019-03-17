#!/bin/bash
docker run -it -p 25665:25565 --mount source=scriptcraft-worlds,target=/server/worlds --mount source=scriptcraft-cache,target=/server/cache magikcraft/scriptcraft
