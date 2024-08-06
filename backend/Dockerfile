# Build stage

FROM maven:3.8.4-openjdk-17-slim AS build
WORKDIR /opt
COPY target/*.jar /opt/app.jar
ENTRYPOINT exec java $JAVA_OPTS -jar app.jar


#docker build -t chuthanh/dockerfile-backend:latest -f Dockerfile .
#docker push chuthanh/dockerfile-backend:latest
