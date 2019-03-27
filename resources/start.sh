#!/bin/ash
# shellcheck shell=dash

ROOT=/server

cd $ROOT || exit 1

if [ "x${SERVERMEM}" = "x" ]; then
    SERVERMEM=2048
fi

java -Xmx${SERVERMEM}m -Xms${SERVERMEM}m -jar paperclip.jar nogui
