FROM openjdk:8u171-jdk-alpine3.8

# Expose Minecraft server port
EXPOSE 25565

WORKDIR /server
COPY ./resources ./

RUN unzip ScriptCraft-3.4.0.zip
RUN mv ScriptCraft-3.4.0/src/main/js/ scriptcraft/ && \
    rm -rf ScriptCraft* && \
    mv ./scriptcraft.jar plugins/scriptcraft.jar && \
    mv js/sma-bootstrap scriptcraft/plugins/

ENTRYPOINT /server/start.sh
