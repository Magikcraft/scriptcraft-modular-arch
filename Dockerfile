# FROM openjdk:8u171-jdk-alpine3.8
FROM oracle/graalvm-ce:19.3.1-java8
# Expose Minecraft server port
EXPOSE 25565

WORKDIR /_server_
COPY ./resources ./

RUN yum install unzip -y && \
    mkdir scriptcraft && \
    cd scriptcraft && \ 
    unzip ../ScriptCraft-3.4.0-patched.zip && \
    mv js/* . && \
    rm -rf js && \
    cd ..
RUN rm -rf ScriptCraft*
RUN mv js/sma-bootstrap scriptcraft/plugins/ 
RUN mkdir -p scriptcraft-plugins/__jasmine/* 
RUN mv js/__jasmine/* scriptcraft-plugins/__jasmine/

ENTRYPOINT /_server_/start.sh
