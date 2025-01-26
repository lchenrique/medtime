export class AlarmService {
  private static instance: AlarmService;
  private audio: HTMLAudioElement | null = null;
  private isPlaying = false;

  private constructor() {
    console.log('🏗️ Criando nova instância do serviço de alarme')
    this.audio = new Audio('/sounds/notification-19-270138.mp3');
    this.audio.preload = 'auto';
    this.audio.loop = true;
    console.log('🔊 Inicializando serviço de alarme')
    console.log('✅ Áudio configurado:', this.audio)
  }

  static getInstance(): AlarmService {
    if (!AlarmService.instance) {
      console.log('🏗️ Criando nova instância do serviço de alarme')
      AlarmService.instance = new AlarmService();
    }
    return AlarmService.instance;
  }

  async start(medication: { name: string; dosage: string }) {
    console.log('🚀 Iniciando alarme para:', medication)
    
    if (this.isPlaying) {
      console.log('⚠️ Alarme já está tocando')
      return;
    }
    
    this.isPlaying = true;

    // Toca o som em loop
    if (this.audio) {
      console.log('🔊 Configurando volume e iniciando áudio')
      this.audio.volume = 1.0;
      try {
        await this.audio.play();
        console.log('✅ Áudio iniciado com sucesso')
      } catch (error) {
        console.error('❌ Erro ao tocar áudio:', error)
        this.isPlaying = false;
      }
    } else {
      console.error('❌ Objeto de áudio não inicializado')
    }
  }

  stop() {
    console.log('🛑 Parando alarme')
    this.isPlaying = false;

    // Para o som
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
      console.log('✅ Áudio parado com sucesso')
    }
  }

  isActive() {
    return this.isPlaying;
  }

  playSound() {
    this.audio?.play();
  }

  stopSound() {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
    }
  }
}

export const alarmService = AlarmService.getInstance(); 