FROM gradle:7.6.1-jdk17-alpine AS build

COPY --chown=gradle:gradle . /home/gradle/src/

WORKDIR /home/gradle/src

RUN gradle clean build --no-daemon

FROM openjdk:17-jdk-slim

EXPOSE 8080

RUN mkdir /app

COPY --from=build /home/gradle/src/build/libs/*.jar /app/java.jar

ENTRYPOINT ["java","-jar","/app/java.jar"]