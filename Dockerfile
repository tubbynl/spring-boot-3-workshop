FROM maven:3-eclipse-temurin-17 AS build
ADD . /build
RUN cd /build && mvn package

FROM eclipse-temurin:17-jre-jammy
COPY --from=build /build/target/*.jar /app.jar
ENTRYPOINT ["java", \
  "-Dspring.profiles.active=docker", \
  "-jar", "/app.jar" \
]