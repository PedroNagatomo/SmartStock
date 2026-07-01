# Estágio de build
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Estágio de produção com Nginx
FROM nginx:alpine
# Remove configuração padrão
RUN rm -rf /usr/share/nginx/html/*
# Copia os arquivos estáticos gerados
COPY --from=build /app/dist /usr/share/nginx/html

# Configuração customizada do Nginx para SPA (roteamento React)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]