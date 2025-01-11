import { PrismaClient } from '@prisma/client'
import { faker } from '@faker-js/faker/locale/pt_BR'

const prisma = new PrismaClient()

async function main() {
  // Limpar dados existentes
  await prisma.member.deleteMany()

  // Criar 100 membros
  const members = Array.from({ length: 100 }).map(() => {
    const firstName = faker.person.firstName()
    const lastName = faker.person.lastName()
    const name = `${firstName} ${lastName}`
    const email = faker.internet.email({ firstName, lastName }).toLowerCase()
    const phone = faker.helpers.fromRegExp('\\([0-9]{2}\\) [0-9]{5}-[0-9]{4}')
    const birthDate = faker.date.between({ 
      from: new Date('1950-01-01'), 
      to: new Date('2005-12-31') 
    })
    const baptismDate = faker.helpers.maybe(() => 
      faker.date.between({ 
        from: birthDate, 
        to: new Date() 
      }), 
      { probability: 0.7 }
    )
    const status = faker.helpers.arrayElement(['ACTIVE', 'INACTIVE'] as const)
    const address = faker.location.streetAddress(true)
    const notes = faker.helpers.maybe(() => faker.lorem.paragraph(), { probability: 0.6 })
    const image = faker.helpers.maybe(() => faker.image.avatar(), { probability: 0.8 })

    return {
      name,
      email,
      phone,
      birthDate,
      baptismDate,
      status,
      address,
      notes,
      image,
      createdAt: faker.date.between({ 
        from: new Date('2023-01-01'), 
        to: new Date() 
      })
    }
  })

  // Inserir membros em lotes de 10 para melhor performance
  for (let i = 0; i < members.length; i += 10) {
    const batch = members.slice(i, i + 10)
    await prisma.member.createMany({
      data: batch
    })
  }

  console.log('Seed concluído! Foram criados 100 membros.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
