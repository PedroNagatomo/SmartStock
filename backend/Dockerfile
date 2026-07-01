# Estágio de build
FROM maven:3.9-eclipse-temurin-17-alpine AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn clean package -DskipTests

# Estágio de produção
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Instalar su-exec para trocar de usuário no entrypoint
RUN apk add --no-cache su-exec

COPY --from=build /app/target/*.jar app.jar

# Criar usuário não-root
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copiar entrypoint script
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 8080
ENTRYPOINT ["/docker-entrypoint.sh"]