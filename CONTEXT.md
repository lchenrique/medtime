# MedTime - Contexto do Projeto

## 🎯 Objetivo
Aplicativo multiplataforma para gerenciamento de medicamentos com sistema de lembretes multicanal.

## 🏗️ Arquitetura Atual

### Frontend
- **Framework**: React + TypeScript + Vite
- **UI**: 
  - TailwindCSS + Shadcn
  - Design System próprio inspirado em interfaces iOS
  - Animações e transições nativas
- **Estado**: 
  - Zustand para estado global
  - React Query para cache e sincronização
  - AuthGuard para proteção de rotas
- **Plataformas**:
  - PWA (principal/produção)
  - Desktop via Tauri (em produção)
  - Mobile via Capacitor (planejado)

### Backend
- **Framework**: Fastify + TypeScript
- **ORM**: Prisma
- **Banco**: PostgreSQL (Supabase)
- **Auth**: Supabase Auth
- **Endpoints**:
  - REST API com validação Zod
  - Server-Sent Events para notificações em tempo real

## 📱 Sistema de Notificações

### Canais Ativos
1. **Web Push** (PWA)
   - Firebase Cloud Messaging
   - Service Worker com background sync
   - Permissões gerenciadas pelo NotificationManager

2. **Desktop** (Tauri)
   - Notificações nativas do sistema
   - Server-Sent Events para atualizações em tempo real
   - Sincronização local de lembretes
   - Personalização da titlebar

### Sistema de Sincronização
1. **Fluxo de Dados**
   - Backend como fonte única da verdade
   - Sincronização bidirecional entre plataformas
   - Estado de notificações persistido por usuário

2. **Momentos de Sincronização**
   - Login/Logout
   - CRUD de medicamentos
   - Verificação periódica
   - Alteração de preferências

### Canais Planejados
- WhatsApp (iOS)
- Telegram (opcional)
- Push nativo Android/iOS via Capacitor

## 📊 Modelos de Dados

### User
```typescript
{
  id: string
  email: string
  name: string
  fcmToken?: string
  whatsappEnabled: boolean
  whatsappNumber?: string
  telegramEnabled: boolean
  telegramChatId?: string
  timezone: string
  tauriEnabled: boolean
  createdAt: Date
  updatedAt: Date
}
```

### Medication
```typescript
{
  id: string
  name: string
  description?: string
  startDate: Date
  duration: number
  interval: number
  totalQuantity: number
  remainingQuantity: number
  unit: string
  dosageQuantity: number
  userId: string
  reminders: Reminder[]
}
```

### Reminder
```typescript
{
  id: string
  medicationId: string
  scheduledFor: Date
  taken: boolean
  takenAt?: Date
  skipped: boolean
  skippedReason?: string
}
```

## 🔄 Status Atual
- PWA e Tauri em produção
- Sistema de notificações implementado
- Design System estabelecido
- Preparação para Capacitor

## 📝 Convenções
- Commits em português
- Código em inglês
- Documentação em português
- Testes obrigatórios para novas features 