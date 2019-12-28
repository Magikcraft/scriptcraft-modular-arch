FROM openjdk:8u171-jdk-alpine3.8

# Expose Minecraft server port
EXPOSE 25565

WORKDIR /_server_
COPY ./resources ./

RUN unzip ScriptCraft-3.4.0-patched.zip
RUN mv main/js/ scriptcraft/ && \
    rm -rf ScriptCraft* && \
    mv ./Scriptcraft-ME-3.0.jar plugins/scriptcraft.jar && \
    mv js/sma-bootstrap scriptcraft/plugins/ && \
    mkdir -p scriptcraft-plugins/__jasmine/* && \
    mv js/__jasmine/* scriptcraft-plugins/__jasmine/

ENTRYPOINT /_server_/start.sh
