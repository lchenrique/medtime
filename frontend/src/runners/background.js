addEventListener('reminderReceived', (resolve, reject, args) => {
  try {
    console.log('Reminder received in background:', args);
    
    // Tentar forçar o app a abrir e iniciar o alarme
    CapacitorApp.exitApp();
    
    resolve();
  } catch (err) {
    console.error('Erro no background runner:', err);
    reject(err);
  }
}); 