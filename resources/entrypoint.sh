#!/bin/ash
# shellcheck shell=dash

ROOT=/server

cd $ROOT || exit 1

java -Xmx2048m -Xms2048m -jar paperclip.jar nogui
