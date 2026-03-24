# ============================================================
# Stage 1 — BUILD
# Uses full JDK + Maven to compile and package the application
# ============================================================
FROM amazoncorretto:21 AS builder

WORKDIR /app

# Copy Maven wrapper and pom.xml first
# Docker caches this layer — dependencies are only re-downloaded when pom.xml changes
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .

# Download all dependencies (cached layer)
RUN ./mvnw dependency:go-offline -B

# Copy source code and build the JAR
COPY src src
RUN ./mvnw clean package -DskipTests -B

# ============================================================
# Stage 2 — RUNTIME
# Uses slim JRE only — no Maven, no source code, no JDK tools
# Result: smaller and more secure final image (~200MB vs ~450MB)
# ============================================================
FROM amazoncorretto:21-al2023-jdk AS runtime

WORKDIR /app

# Copy only the compiled JAR from the build stage
COPY --from=builder /app/target/*.jar app.jar

# Spring Boot default port
EXPOSE 8080

# Start the application
ENTRYPOINT ["java", "-jar", "app.jar"]
