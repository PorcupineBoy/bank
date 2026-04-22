# Spring Boot Backend Dockerfile
# Multi-stage build: compile with Maven, then run with lightweight JDK
# Usage:
#   docker build -t bank-backend .
#   docker run -d --name bank-backend -p 8080:8080 bank-backend

# Stage 1: Build
FROM maven:3.8.6-openjdk-8-slim AS builder

WORKDIR /build
COPY pom.xml .
COPY src ./src

# Build the application JAR (skip tests for faster build)
RUN mvn clean package -DskipTests

# Stage 2: Run
FROM openjdk:8-jre-slim

LABEL maintainer="bank-project"
LABEL description="Mobile Banking Spring Boot Backend"

WORKDIR /app

# Copy the built JAR from builder stage
COPY --from=builder /build/target/bank-backend-1.0.0.jar app.jar

# Expose backend port
EXPOSE 8080

# JVM options for container environment
ENV JAVA_OPTS="-Xms256m -Xmx512m -Djava.security.egd=file:/dev/./urandom"

# Run the application
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
