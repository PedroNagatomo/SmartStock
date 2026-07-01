# SmartStock - Sistema Inteligente de Gestão de Estoque

<img width="1907" height="909" alt="Captura de tela 2026-06-25 182209" src="https://github.com/user-attachments/assets/99354ff6-747d-499d-b8f5-1629bb99e6b2" />


Sistema completo de gestão de estoque para pequenos e médios varejistas, com previsão de demanda, alertas, leitor de código de barras, exportação de relatórios e muito mais.

## 🚀 Funcionalidades

- 📊 **Dashboard** em tempo real com gráficos de vendas e estoque
- 📦 **CRUD de Produtos** com categorias, preços e controle de estoque mínimo/máximo
- 🤖 **Previsão de Demanda** usando médias móveis ponderadas e ajuste sazonal
- 🔔 **Alertas inteligentes** com notificações (e-mail/WhatsApp)
- 📷 **Leitor de código de barras** com câmera e entrada manual
- 📄 **Relatórios exportáveis** em PDF e Excel
- 👥 **Autenticação JWT** com múltiplos perfis de usuário
- 📱 **PWA** instalável e funcional offline
- 🐳 **Docker** e **Kubernetes** prontos para produção

## 🛠️ Tecnologias

### Backend (Spring Boot + Java 17)
- Spring Boot 3.2, Spring Security, JWT
- H2 Database (dev) / PostgreSQL (prod)
- API RESTful documentada com Swagger
- Previsão de demanda com estatística simples (MVP)

### Frontend (React + Vite + TypeScript)
- TailwindCSS para estilização moderna e responsiva
- React Query para gerenciamento de estado e cache
- Recharts para gráficos
- PWA com Workbox (offline-first)

### DevOps
- Docker Compose para desenvolvimento local
- Kubernetes (manifests prontos para deploy)
- CI/CD com GitHub Actions (opcional)

## 📦 Como rodar localmente

### Pré-requisitos
- Java 17+
- Maven (ou use o Maven Wrapper incluído)
- Node.js 18+ e npm

### Backend
```bash
cd backend
./mvnw spring-boot:run
