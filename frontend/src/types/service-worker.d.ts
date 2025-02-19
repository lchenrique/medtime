interface ServiceWorkerClient {
  url: string;
  focus(): Promise<ServiceWorkerClient>;
}

interface ServiceWorkerClients {
  matchAll(options?: { type: 'window' }): Promise<ServiceWorkerClient[]>;
  openWindow(url: string): Promise<ServiceWorkerClient | null>;
}

interface ServiceWorkerGlobalScope {
  clients: ServiceWorkerClients;
}

interface NotificationEventInit extends EventInit {
  notification: Notification;
}

interface NotificationEvent extends Event {
  readonly notification: Notification;
  waitUntil(f: Promise<any>): void;
}

declare global {
  interface WindowEventMap {
    'notificationclick': NotificationEvent;
  }

  interface ServiceWorkerGlobalScopeEventMap {
    'notificationclick': NotificationEvent;
  }

  var clients: ServiceWorkerClients;
} 