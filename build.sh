MINECRAFT_TAG=1.15.2-graalvm
npm run build && docker build --no-cache -t magikcraft/scriptcraft:$MINECRAFT_TAG .
