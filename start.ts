import { exec } from 'child_process';

// Função para iniciar o servidor backend
function startBackend() {
  exec('cd backend && pnpm run dev', (error, stdout, stderr) => {
    if (error) {
      console.error(`Erro ao iniciar o backend: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`Erro no backend: ${stderr}`);
      return;
    }
    console.log(`Backend: ${stdout}`);
  });
}

// Função para iniciar o servidor frontend
function startFrontend() {
  exec('cd frontend && pnpm start', (error, stdout, stderr) => {
    if (error) {
      console.error(`Erro ao iniciar o frontend: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`Erro no frontend: ${stderr}`);
      return;
    }
    console.log(`Frontend: ${stdout}`);
  });
}

// Iniciar ambos os servidores
startBackend();
startFrontend(); 