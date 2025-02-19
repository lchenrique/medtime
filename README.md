# MedTime - Aplicativo de Gerenciamento de Medicamentos

## 📱 Sobre o Projeto
MedTime é um aplicativo multiplataforma para gerenciamento de medicamentos e lembretes, desenvolvido usando PWA + Capacitor para garantir ampla compatibilidade e melhor experiência do usuário.

## 🏗️ Arquitetura

### Frontend
- **Base**: Vite + React + TypeScript
- **PWA**: Instalável via browser (principal)
- **Apps Nativos**: Capacitor (fases futuras)

### Backend
- **API**: Fastify + TypeScript
- **Notificações**: 
  - Web Push (PWA/Android)
  - WhatsApp API (iOS)
  - Firebase (apps nativos futuros)

## 🔄 Fases de Desenvolvimento

### Fase 1 - PWA
- Desenvolvimento do PWA base
- Instalável via browser em Android e iOS
- Sistema de notificações:
  - Android: Push notifications (via PWA)
  - iOS: WhatsApp (devido à limitação da Apple)
- Funcionalidades:
  - Cadastro/Login
  - Gerenciamento de medicamentos
  - Lembretes via Push (Android) e WhatsApp (iOS)

### Fase 2 - Android Nativo
- Integração com Capacitor
- Build para Android
- Publicação Play Store
- Push notifications nativas Android

### Fase 3 - iOS Nativo
- Build para iOS (requer Mac)
- Publicação App Store
- Push notifications nativas iOS

## 🛠️ Tecnologias Utilizadas

### Frontend
- Vite
- React + TypeScript
- TailwindCSS
- Service Workers (PWA)
- Capacitor (futuro)

### Backend
- Fastify
- Prisma
- WhatsApp Business API

## 📦 Instalação e Configuração

### Pré-requisitos
- Node.js >= 18
- pnpm >= 8
- PostgreSQL
- Conta WhatsApp Business

### Configuração do Projeto

1. **Clone o repositório**
   ```bash
   git clone [url-do-repositorio]
   cd medtime
   ```

2. **Instale as dependências**
   ```bash
   # Backend
   cd backend
   pnpm install

   # Frontend
   cd frontend
   pnpm install
   ```

3. **Configure as variáveis de ambiente**
   ```bash
   # Backend
   cp backend/.env.example backend/.env

   # Frontend
   cp frontend/.env.example frontend/.env
   ```

## 🚀 Rodando o Projeto

### Backend
```bash
cd backend
pnpm dev
```

### Frontend
```bash
cd frontend
pnpm dev
```

## 📱 Builds

### PWA (Fase 1)
```bash
cd frontend
pnpm build
```

### Android (Fase 2)
```bash
cd frontend
pnpm build
npx cap add android
npx cap sync android
```

### iOS (Fase 3)
```bash
cd frontend
pnpm build
npx cap add ios
npx cap sync ios
```

## 📝 Licença
Este projeto está sob a licença MIT. 



npx ngrok config add-authtoken 1tVtNB0ECnyvnyxyu90MAlL7baN_cycaXog67mcb22XWjXnZ
npx ngrok http --url=ewe-simple-polecat.ngrok-free.app 5173

npx ngrok config add-authtoken 2rbZ44Gn8AnwMW3p0GhQ07U1LWp_6eFqYvwTzCUoCjnnR6KMs
npx ngrok http --url=jaguar-full-monkfish.ngrok-free.app 3333