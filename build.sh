MINECRAFT_TAG=1.15
npm run build && docker build -t magikcraft/scriptcraft:$MINECRAFT_TAG .
