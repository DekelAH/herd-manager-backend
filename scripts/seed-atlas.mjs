import mongoose from 'mongoose'
import bcrypt from 'bcrypt'

const ATLAS_URI = process.env.MONGODB_ATLAS_URI
if (!ATLAS_URI) {
  console.error('Error: MONGODB_ATLAS_URI environment variable is not set')
  console.error('Usage: MONGODB_ATLAS_URI="mongodb+srv://..." node scripts/seed-atlas.mjs')
  process.exit(1)
}

await mongoose.connect(ATLAS_URI)
console.log('Connected to Atlas')

const db = mongoose.connection.db

// Clear existing data
await db.collection('users').deleteMany({})
await db.collection('sheep').deleteMany({})
console.log('Cleared existing data')

// Create demo user
const hashedPassword = await bcrypt.hash('demo123', 12)
const userResult = await db.collection('users').insertOne({
  username: 'demo',
  email: 'demo@sheeply.com',
  password: hashedPassword,
  farmName: 'Green Valley Farm',
  refreshTokens: [],
  createdAt: new Date(),
  updatedAt: new Date(),
})
const ownerId = userResult.insertedId
console.log(`Created user "demo" (password: demo123) -> ${ownerId}`)

function formatTag(num, gender) {
  const prefix = gender === 'female' ? 'F' : 'M'
  return `${prefix}${String(num).padStart(4, '0')}`
}

const sheepIds = {}
async function createSheep(data) {
  const tagNumber = formatTag(data.num, data.gender)
  const doc = {
    ...data,
    tagNumber,
    owner: ownerId,
    mother: data.mother ? sheepIds[data.mother] : null,
    father: data.father ? sheepIds[data.father] : null,
    isPregnant: data.isPregnant ?? false,
    pregnancyStartDate: data.pregnancyStartDate ? new Date(data.pregnancyStartDate) : null,
    birthDate: new Date(data.birthDate),
    notes: data.notes ?? '',
    createdAt: new Date(),
    updatedAt: new Date(),
  }
  delete doc.num
  delete doc.mother
  delete doc.father
  doc.mother = data.mother ? sheepIds[data.mother] : null
  doc.father = data.father ? sheepIds[data.father] : null
  const result = await db.collection('sheep').insertOne(doc)
  sheepIds[data.num] = result.insertedId
  console.log(`  ${tagNumber} (${data.gender}, ${data.breed}) -> ${result.insertedId}`)
}

console.log('\nCreating founders...')

await createSheep({ num: 1, gender: 'female', birthDate: '2022-03-15', weight: 65, breed: 'Assaf', fertility: 'BB', isPregnant: false, healthStatus: 'healthy', notes: 'Strong and healthy, excellent genetics' })
await createSheep({ num: 2, gender: 'male', birthDate: '2021-11-20', weight: 85, breed: 'French Dorset', fertility: 'BB', healthStatus: 'healthy', notes: 'Main breeding ram' })
await createSheep({ num: 5, gender: 'female', birthDate: '2022-05-08', weight: 60, breed: 'English Dorset', fertility: 'B+', isPregnant: false, healthStatus: 'healthy', notes: 'Got her from the market last spring' })
await createSheep({ num: 6, gender: 'male', birthDate: '2021-08-12', weight: 90, breed: 'Afek', fertility: 'BB', healthStatus: 'healthy', notes: 'Best ram I ever bought!' })
await createSheep({ num: 8, gender: 'female', birthDate: '2022-09-14', weight: 63, breed: 'French Slowfek', fertility: 'AA', isPregnant: false, healthStatus: 'needs attention', notes: 'Limping on right front leg' })
await createSheep({ num: 9, gender: 'male', birthDate: '2022-04-18', weight: 80, breed: 'English Slowfek', fertility: 'BB', healthStatus: 'healthy', notes: 'Calm temperament' })
await createSheep({ num: 12, gender: 'female', birthDate: '2022-12-10', weight: 58, breed: 'Assaf', fertility: 'BB', isPregnant: true, pregnancyStartDate: '2025-09-01', healthStatus: 'healthy', notes: 'Pregnant! Should lamb soon' })

console.log('\nCreating offspring...')

await createSheep({ num: 3, gender: 'female', birthDate: '2023-01-10', weight: 52, breed: 'Assaf', fertility: 'B+', isPregnant: true, pregnancyStartDate: '2025-10-15', healthStatus: 'healthy', notes: 'First baby from Bella and Max', mother: 1, father: 2 })
await createSheep({ num: 4, gender: 'male', birthDate: '2023-01-10', weight: 58, breed: 'Romano', fertility: 'B+', healthStatus: 'healthy', notes: "Luna's twin brother", mother: 1, father: 2 })
await createSheep({ num: 7, gender: 'female', birthDate: '2023-03-22', weight: 48, breed: 'Dropper', fertility: 'B+', isPregnant: false, healthStatus: 'healthy', notes: 'Young and energetic', mother: 5, father: 6 })
await createSheep({ num: 10, gender: 'female', birthDate: '2023-06-05', weight: 42, breed: 'Sherolle', fertility: 'AA', isPregnant: false, healthStatus: 'healthy', notes: 'Small but healthy', mother: 8, father: 9 })
await createSheep({ num: 11, gender: 'male', birthDate: '2023-02-28', weight: 55, breed: 'Romano', fertility: 'BB', healthStatus: 'healthy', notes: 'Dark wool', mother: 5, father: 2 })
await createSheep({ num: 13, gender: 'female', birthDate: '2025-12-20', weight: 15, breed: 'Assaf', fertility: 'AA', isPregnant: false, healthStatus: 'healthy', notes: 'Just born! Bottle feeding twice daily', mother: 1, father: 6 })
await createSheep({ num: 14, gender: 'male', birthDate: '2025-12-20', weight: 18, breed: 'Assaf', fertility: 'AA', healthStatus: 'healthy', notes: "Tiny's twin brother. Always jumping around!", mother: 1, father: 6 })
await createSheep({ num: 15, gender: 'female', birthDate: '2024-04-10', weight: 45, breed: 'English Dorset', fertility: 'B+', isPregnant: false, healthStatus: 'needs attention', notes: 'Not eating well last 2 days', mother: 5, father: 9 })

// Create indexes
await db.collection('sheep').createIndex({ owner: 1, tagNumber: 1 }, { unique: true })
await db.collection('sheep').createIndex({ owner: 1, gender: 1 })
await db.collection('sheep').createIndex({ owner: 1, healthStatus: 1 })

const sheepCount = await db.collection('sheep').countDocuments()
console.log(`\nDone! Seeded ${sheepCount} sheep for user "demo" on Atlas.`)
console.log('Login credentials: username=demo, password=demo123')

await mongoose.disconnect()
process.exit(0)
