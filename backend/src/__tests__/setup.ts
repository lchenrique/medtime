import { prisma } from '../lib/prisma'

// Aumenta o timeout dos testes para 10 segundos
const originalTimeout = 10000
beforeAll(() => {
  jest.setTimeout(originalTimeout)
})

// Limpa o banco de dados antes de todos os testes
beforeAll(async () => {
  // Desativa as foreign key constraints temporariamente
  await prisma.$executeRaw`PRAGMA foreign_keys = OFF;`

  // Limpa todas as tabelas na ordem correta
  await prisma.memberGroup.deleteMany()
  await prisma.group.deleteMany()
  await prisma.member.deleteMany()
  await prisma.user.deleteMany()
  await prisma.church.deleteMany()

  // Reativa as foreign key constraints
  await prisma.$executeRaw`PRAGMA foreign_keys = ON;`
})
