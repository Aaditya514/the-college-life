# ==============================================================================
# Multi-Stage Dockerfile for Spring Boot Backend
# ==============================================================================

# Stage 1: Build JAR
FROM maven:3.9-eclipse-temurin-21-alpine AS builder
WORKDIR /app

# Cache dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source and package
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Minimal Secure Runtime
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Non-root security best practice (OWASP Container Security)
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser:appgroup

COPY --from=builder /app/target/the-college-life-backend-1.0.0-SNAPSHOT.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
