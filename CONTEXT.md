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
  - Layout responsivo e adaptativo
  - Tema violeta consistente
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
1. **Desktop** (Tauri)
   - Notificações nativas do sistema via Tauri
   - WebSocket para notificações em tempo real
   - Agendamento local de notificações
   - Personalização da titlebar

2. **Web Push** (PWA)
   - Firebase Cloud Messaging
   - Service Worker com background sync
   - Permissões gerenciadas pelo NotificationManager

3. **WhatsApp**
   - Integração via WhatsApp Business API
   - Webhook para receber interações
   - Botão de "Medicamento tomado"
   - Mensagens de confirmação
   - Validação de medicamento já tomado
   - Atualização automática de estoque

4. **Telegram**
   - Bot oficial com comandos personalizados
   - Botão inline para marcar como tomado
   - Mensagens de confirmação
   - Validação de medicamento já tomado
   - Atualização automática de estoque

### Sistema de Sincronização
1. **Fluxo de Dados**
   - Backend como fonte única da verdade
   - WebSocket para atualizações em tempo real
   - Verificação periódica via ReminderWorker

2. **ReminderWorker**
   - Verifica lembretes a cada 10 segundos
   - Janela de 1 minuto para notificações passadas
   - Janela de 5 minutos para notificações futuras
   - Verifica estoque antes de notificar
   - Envia por canais configurados
   - Marca lembretes como notificados após envio
   - Sistema de retry (3 tentativas) para usuários offline

3. **WebSocket**
   - Conexão persistente com o backend
   - Autenticação via token Supabase
   - Reconexão automática em caso de falha
   - Não reconecta se Tauri não estiver habilitado
   - Agendamento local de notificações
   - Tratamento de timezone consistente (America/Sao_Paulo)

### Formato das Notificações
1. **Notificação Inicial**
   ```
   🔔 Hora do seu medicamento!

   💊 [Nome do Medicamento]
   📝 Dose: [Quantidade] unidade(s)
   🕐 Horário: [HH:mm do dia DD/MM]

   ⚠️ Atenção: Estoque baixo! (se aplicável)
   ```

2. **Confirmação**
   ```
   ✅ [Nome do Medicamento] marcado como tomado às [HH:mm]
   ```

### Canais Planejados
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
  notified: boolean
}
```

## 🔄 Status Atual
- PWA e Tauri em produção
- Sistema de notificações implementado e otimizado
- WhatsApp e Telegram totalmente funcionais
- Design System estabelecido e refinado
- Interface dividida em:
  - Home: Visão geral dos medicamentos do dia
  - Medicamentos: Lista completa com busca
  - Configurações: Preferências do usuário
- Funcionalidades implementadas:
  - Listagem de medicamentos por horário
  - Separação entre medicamentos atrasados e no horário
  - Sistema de busca em tempo real
  - Detalhes do medicamento em drawer
  - Marcação de medicamentos como tomados
  - Cálculo preciso de tempo restante
  - Timezone handling consistente
  - Sistema de retry para notificações
  - Validação de medicamentos já tomados
  - Controle automático de estoque
- Preparação para Capacitor em andamento

## 📝 Convenções
- Commits em português
- Código em inglês
- Documentação em português
- Testes obrigatórios para novas features 