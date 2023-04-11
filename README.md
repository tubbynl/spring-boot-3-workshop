Spring 6 Workshop
=================

This is a demo project for the Spring 6 Workshop.
This is a simple Spring Boot 2 application with a REST API and a frontend.

The application is a simple TODO list built with maven.
There is some additional docker configuruation present to set up a local grafana dashboard.

Before getting started, it is suggested to test the application as-is using `mvn spring-boot:run`.

## Requirements
- Java 17
- Docker
  - loki logging plugin `docker plugin install grafana/loki-docker-driver:latest --alias loki --grant-all-permissions`
  - Required for grafana dashboard as per [this GitHub repository](https://github.com/blueswen/spring-boot-observability)

## Getting started
Please refer to the [Presentation](https://chilit-nl.github.io/reveal.js/2022.jfall.spring-6/) for an explanation of the new features.

## Challenges

### Challenge 1: Migrate to Spring Boot 3
The first challenge is to migrate the application to Spring Boot 3.  
Fortunately, the original application was already built with Java 17, so there is no need to upgrade the JDK.

There are however some breaking changes in Spring Boot 3 that need to be addressed.  
To make this easier, it is suggested to use [Spring Boot Migrator](https://github.com/spring-projects-experimental/spring-boot-migrator).  
This is a tool that automatically rewrites code to be compatible with Spring Boot 3. Powered by OpenRewrite.

Follow the instructions on the SBM (Spring Boot Migrator) GitHub, scan the project and apply the suggested changes.
Try to run the application again and troubleshoot from the [Spring Migration Guide](https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-3.0-Migration-Guide) if needed.

### Challenge 2: Running on GraalVM
The second challenge is to run the application on GraalVM.  
GraalVM is a Java Virtual Machine that can compile Java code to native binaries.
You can refer to the [Spring Boot GraalVM Documentation](https://docs.spring.io/spring-boot/docs/current/reference/htmlsingle/#native-image) for more information and examples.

Very few changes should be needed to run the application on GraalVM.
You do have to add the `native-image-maven-plugin` to the `pom.xml`.
```xml
<plugin>
    <groupId>org.graalvm.buildtools</groupId>
    <artifactId>native-maven-plugin</artifactId>
</plugin>
```
It is also important to make sure you are using the Spring Boot 3.0 parent POM.

Once ready, you can create a native image using docker and run it:
```shell
mvn -Pnative spring-boot:build-image
docker run -p 8080:8080 spring-6-workshop:0.0.1-SNAPSHOT
```
Notice that the startup time for the application is significantly lower.  
This is useful for auto-scaling applications or serverless workloads that need to start quickly.

It is also possible without docker, as described in the documentation. But it is more difficult to set up.

## Challenge 3: Problem Details
The third challenge is to add [Problem Details](https://datatracker.ietf.org/doc/html/rfc7807) to the application.
Problem details is a specification for returning error information in a standardized format in REST APIs.

The application already has some error handling, but it is not very consistent.  
The frontend doesn't understand this error handling and if you try to add an empty todo, you get a bad error dialog.  
The frontend is expecting problem details, so we need to make sure the backend returns problem details.

The spring documentation [has a section on error handling](https://docs.spring.io/spring-framework/docs/6.0.7/reference/html/web.html#mvc-ann-rest-exceptions)
that explains how to return problem details.

A new controller advice class should be created to handle exceptions.  
Make sure that the frontend works as expected when you add an empty todo.

### Challenge 3.1 (Bonus)
The `TodoController` uses a custom exception that is not handled properly.
This exception triggers when you try to add more than 10 todo items.

Define a custo error handler that maps the exception to a problem detail. Refer to the presentation for examples.

## Challenge 4: Observability
The fourth challenge is to add observability to the application.

The application has been configured to use [Micrometer](https://micrometer.io/) to collect metrics.
Metrics are exposed via a prometheus endpoint and tracing is transmitted via the [OpenTelemetry](https://opentelemetry.io/) protocol using an agent.

To set up a local dashboard, you can use the docker-compose via `docker-compose up`.
This will create a new grafana dashboard on `localhost:3000` that shows application metrics.

**Note:** The configuration for grafana is based on [A GitHub repository](https://github.com/blueswen/spring-boot-observability)
and it requires installing a Loki logging plugin for docker using `docker plugin install grafana/loki-docker-driver:latest --alias loki --grant-all-permissions`.

Spring Boot 3 introduces [a lot of extra metrics](https://docs.spring.io/spring-framework/docs/current/reference/html/integration.html#integration.observability) out of the box with its new Observability integration.
Each metric for `http.server.requests` now has a `exception`, `method`, `outcome`, `status, `uri` and `http.uri` key that can be used for making new graphs.

Try to use one of the new metrics to create a new graph in grafana.

### Challenge 4.1 (Bonus)

Add custom metrics to the application using the Observability API by following the [Spring Boot Documentation section on Observability](https://docs.spring.io/spring-boot/docs/current/reference/htmlsingle/#actuator.observability).
Think of a new action to "observe". Such as a recurring job that cleans up completed tasks?

## Challenge 5: RestClient
