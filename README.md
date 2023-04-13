Spring Boot 3 Workshop
=================

This is a demo project for the Spring Boot 3 (Spring Framework 6) Workshop.
This is a simple Spring Boot 2 application with a REST API and a frontend.

The application is a simple TODO list built with maven.
There is some additional docker configuruation present to set up a local grafana dashboard.

Before getting started, it is suggested to test the application as-is using `mvn spring-boot:run`.

## Requirements
- Java 17
- Docker (required to create native image and run grafana)

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

One thing you will notice if you run the application is that the "Add defaults" button no longer works.  
If you check the console you will find an error warning of unexpected use of reflection.  
This is because the applicaiton is mapping from a custom `TodoDefault` class which is not auto-detected in the controller.

When you use reflection for mappers, libraries or rest clients outside of a controller you have to "hint" spring AOT.
You can do this by adding the annotation `@RegisterReflectionForBinding(TodoDefault.class)` to `DefaultsService.getDefaults`.

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
Metrics are exposed via a prometheus endpoint on `/actuator/prometheus` which is scraped by a prometheus installation.

To set up a local dashboard, you can build the application with `mvn spring-boot:build-image` use the docker-compose file via `docker-compose up`.  
This will create a new grafana dashboard on `localhost:3000` that shows application metrics.  
This also sets up a Loki logging server and Tempo tracing server which integrate well with grafana.  
Some example dashboards are already configured, but the data is incomplete.

**Note:** The configuration for grafana is based on [A GitHub repository](https://github.com/blueswen/spring-boot-observability)
and adapted to work with the loki log appender and spring boot 3.

Spring Boot 3 introduces support for Micrometer Observability which is an API for adding custom metrics.
The unique thing about this API is that it treats events as "observable" and derives metrics, tracing and logging from
the observation of these events.

This means that you can get metrics, tracing and log-correlation using a single API, and spring already has
many pre-defined events that you can observe. Such as http client and server requests, schedulers, etc.

To get this to work though, you have to add support for Spring Boot 3's new
[tracing implementation for OpenTelemetry](https://docs.spring.io/spring-boot/docs/current/reference/html/actuator.html#actuator.metrics.export.otlp).  
You will have to configure the `management.otlp.metrics.export.url` property to point to the tempo tracing server.
Note: The url should be `http://tempo:4317`

You will also have to add opentelemetry dependencies to the `pom.xml`:
```xml
<dependency>
    <groupId>io.micrometer</groupId>
    <artifactId>micrometer-tracing-bridge-otel</artifactId>
</dependency>
<dependency>
<groupId>io.opentelemetry</groupId>
<artifactId>opentelemetry-exporter-otlp</artifactId>
</dependency>
```

Now you can view your application logs to find a tracing ID and go to the grafana environment to view the related logs and metrics.

### Challenge 4.1 (Bonus)

Add custom metrics to the application using the Observability API by following the [Spring Boot Documentation section on Observability](https://docs.spring.io/spring-boot/docs/current/reference/htmlsingle/#actuator.observability).
Think of a new action to "observe". Such as a recurring job that cleans up completed tasks?

## Challenge 5: HTTP Interface

In order to help quickstart your to-do list, a set of default items can be generated.  
This generation is super high-tech and complex, and is therefor delegated to an external API.  
This API however does not support CORS, so our backend communicates with this API to add default tasks.

This is implemented in the `DefaultsService` which uses a RestTemplate.  
Replace RestTemplate with the new HTTP Interface API that allows you to use an interface that spring
implements for you using the new `HttpServiceProxyFactory`.

This new API is currently only supported with `WebClient` from `WebFlux`.  
You will need to add webflux as a dependency and use it as an adapter for the proxy factory.

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-webflux</artifactId>
</dependency>
```
