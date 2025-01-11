import sharp from 'sharp'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const sizes = [72, 96, 128, 144, 152, 192, 384, 512]
const outputDir = path.join(__dirname, '../public/icons')

// SVG do ícone oficial do MedTime
const iconSvg = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#7C3AED;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#6D28D9;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Fundo -->
  <rect width="512" height="512" rx="128" fill="url(#grad)"/>
  
  <!-- Container branco -->
  <g transform="translate(76.8, 76.8) scale(0.7)">
    <!-- Pílula -->
    <g transform="translate(256, 256) rotate(45) translate(-256, -256)">
      <rect x="128" y="179.2" width="256" height="153.6" rx="76.8" fill="white"/>
    </g>

    <!-- Relógio -->
    <circle cx="256" cy="256" r="102.4" fill="white" stroke="#7C3AED" stroke-width="12"/>
    
    <!-- Marcadores de hora -->
    <rect x="250.88" y="153.6" width="10.24" height="20.48" fill="#7C3AED"/>
    <rect x="250.88" y="338.56" width="10.24" height="20.48" fill="#7C3AED"/>
    <rect x="153.6" y="250.88" width="20.48" height="10.24" fill="#7C3AED"/>
    <rect x="338.56" y="250.88" width="20.48" height="10.24" fill="#7C3AED"/>
    
    <!-- Ponteiros -->
    <rect x="254.464" y="204.8" width="5.12" height="51.2" transform="rotate(45, 256, 256)" fill="#7C3AED"/>
    <rect x="254.464" y="179.2" width="3.072" height="76.8" transform="rotate(-45, 256, 256)" fill="#7C3AED"/>
    
    <!-- Ponto central -->
    <circle cx="256" cy="256" r="7.68" fill="#7C3AED"/>
  </g>
</svg>
`

async function generateIcons() {
  // Criar diretório de ícones se não existir
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  // Gerar ícones para cada tamanho
  for (const size of sizes) {
    const outputFile = path.join(outputDir, `icon-${size}x${size}.png`)
    await sharp(Buffer.from(iconSvg))
      .resize(size, size)
      .png()
      .toFile(outputFile)
    console.log(`✓ Gerado ícone ${size}x${size}`)
  }

  // Gerar ícones principais
  await sharp(Buffer.from(iconSvg))
    .resize(192, 192)
    .png()
    .toFile(path.join(__dirname, '../public/android-chrome-192x192.png'))

  await sharp(Buffer.from(iconSvg))
    .resize(512, 512)
    .png()
    .toFile(path.join(__dirname, '../public/android-chrome-512x512.png'))

  await sharp(Buffer.from(iconSvg))
    .resize(180, 180)
    .png()
    .toFile(path.join(__dirname, '../public/apple-touch-icon.png'))

  await sharp(Buffer.from(iconSvg))
    .resize(32, 32)
    .png()
    .toFile(path.join(__dirname, '../public/favicon-32x32.png'))

  await sharp(Buffer.from(iconSvg))
    .resize(16, 16)
    .png()
    .toFile(path.join(__dirname, '../public/favicon-16x16.png'))

  console.log('\n✨ Todos os ícones foram gerados com sucesso!')
}

generateIcons().catch(console.error) 