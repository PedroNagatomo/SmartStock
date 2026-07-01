# SmartStock - Sistema Inteligente de Gestão de Estoque

<img width="1907" height="909" alt="Captura de tela 2026-06-25 182209" src="https://github.com/user-attachments/assets/99354ff6-747d-499d-b8f5-1629bb99e6b2" />


![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Java](https://img.shields.io/badge/Java-17-orange)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2-brightgreen)
![React](https://img.shields.io/badge/React-18-61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![License](https://img.shields.io/badge/license-MIT-green)

**SmartStock** é um sistema completo de gestão de estoque voltado para pequenos e médios varejistas. Ele ajuda a reduzir rupturas e excesso de estoque com previsão de demanda, alertas inteligentes, leitor de código de barras, dashboards em tempo real e muito mais.

<p align="center">
  <img src="docs/dashboard.png" alt="SmartStock Dashboard" width="800">
</p>

## ✨ Funcionalidades

- 📊 **Dashboard interativo** com gráficos de vendas, estoque por categoria e tendências.
- 📦 **Gerenciamento de produtos** (CRUD) com categorias, estoque mínimo/máximo e preços.
- 🤖 **Previsão de demanda** usando médias móveis ponderadas e ajuste sazonal.
- 🔔 **Alertas automáticos** com envio de notificações (e-mail/WhatsApp via Twilio).
- 📷 **Leitor de código de barras** com câmera e entrada manual.
- 📄 **Relatórios exportáveis** em PDF e Excel.
- 👥 **Autenticação JWT** com múltiplos níveis de acesso (admin, gerente, usuário).
- 📱 **PWA** instalável e funcional offline (cache de dados e fila de sincronização).
- 🐳 **Docker** e **Kubernetes** prontos para desenvolvimento e produção.

## 🛠️ Stack Tecnológica

### Backend
- **Java 17** + **Spring Boot 3.2**
- Spring Security + JWT (autenticação e autorização)
- Spring Data JPA + H2 (dev) / PostgreSQL (prod)
- API REST documentada com Swagger/OpenAPI
- Algoritmo de previsão de demanda customizado (média móvel + estoque de segurança)

### Frontend
- **React 18** + **Vite** + **TypeScript**
- **TailwindCSS** para estilização moderna e responsiva
- **React Query** para gerenciamento de estado e cache
- **Recharts** para gráficos
- **PWA** com Workbox (service worker, cache de API, offline)

### DevOps
- **Docker Compose** para ambiente local
- **Kubernetes** (manifests para deploy em cluster)
- CI/CD com **GitHub Actions** (workflows de build, teste e deploy)

## 🚀 Como executar localmente

### Pré‑requisitos
- Java 17+
- Maven 3.9+ (ou use o Maven Wrapper incluído)
- Node.js 18+ e npm

### Backend (API)
```bash
cd backend
./mvnw spring-boot:run
```

### Frontend (React)
```bash
cd frontend
npm install
npm run dev
Acesse http://localhost:3000 e faça login com admin / admin123 (usuário padrão).
```

### Docker Compose
```bash
docker-compose up --build
Frontend: http://localhost
Backend: http://localhost:8080/api
````

### Kubernetes (Kind)
```bash
# Criar cluster local
kind create cluster --name smartstock

# Construir imagens
docker build -t smartstock-backend:latest ./backend
docker build -t smartstock-frontend:latest ./frontend

# Carregar imagens no Kind
kind load docker-image smartstock-backend:latest --name smartstock
kind load docker-image smartstock-frontend:latest --name smartstock

# Aplicar manifestos
kubectl apply -f k8s/

# Acessar a aplicação
kubectl port-forward -n smartstock svc/frontend-svc 8081:80
Acesse http://localhost:8081.
```
cd backend
./mvnw spring-boot:run
