import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const ANDROID_ICON_SIZES = {
  mdpi: 48,
  hdpi: 72,
  xhdpi: 96,
  xxhdpi: 144,
  xxxhdpi: 192
}

const NOTIFICATION_ICON_SIZES = {
  mdpi: 24,
  hdpi: 36,
  xhdpi: 48,
  xxhdpi: 72,
  xxxhdpi: 96
}

async function generateIcons() {
  const sourceIcon = path.resolve(__dirname, '../public/icon.svg')
  const androidResPath = path.join(__dirname, '../android/app/src/main/res')

  // Gerar ícones do launcher
  for (const [density, size] of Object.entries(ANDROID_ICON_SIZES)) {
    const outputPath = path.join(androidResPath, `mipmap-${density}`)
    
    if (!fs.existsSync(outputPath)) {
      fs.mkdirSync(outputPath, { recursive: true })
    }

    await sharp(sourceIcon)
      .resize(size, size)
      .png()
      .toFile(path.join(outputPath, 'ic_launcher.png'))

    // Gerar ícone redondo
    await sharp(sourceIcon)
      .resize(size, size)
      .png()
      .toFile(path.join(outputPath, 'ic_launcher_round.png'))
  }

  // Gerar ícones de notificação
  for (const [density, size] of Object.entries(NOTIFICATION_ICON_SIZES)) {
    const outputPath = path.join(androidResPath, `drawable-${density}`)
    
    if (!fs.existsSync(outputPath)) {
      fs.mkdirSync(outputPath, { recursive: true })
    }

    // Para ícones de notificação, vamos usar branco sobre transparente
    await sharp(sourceIcon)
      .resize(size, size)
      .png()
      .toFile(path.join(outputPath, 'ic_stat_medtimelogo.png'))
  }

  console.log('✅ Ícones gerados com sucesso!')
}

generateIcons().catch(console.error)
