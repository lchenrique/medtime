const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputFile = path.resolve(__dirname, '../public/icon.png');
const outputFile = path.resolve(__dirname, '../../android/app/src/main/res/drawable/ic_stat_medtimelogo.png');
const outputDir = path.dirname(outputFile);

// Cria diretório se não existir
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Converte e salva o ícone
sharp(inputFile)
  .resize(512, 512)
  .png()
  .toFile(outputFile)
  .then(() => console.log('Ícone gerado com sucesso!'))
  .catch(err => console.error('Erro ao gerar ícone:', err));
