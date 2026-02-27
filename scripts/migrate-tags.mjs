import mongoose from 'mongoose'

const uri = process.argv[2]

if (!uri) {
  console.error('Usage: node scripts/migrate-tags.mjs <mongodb-uri>')
  console.error('  e.g. node scripts/migrate-tags.mjs mongodb://localhost:27017/herd-manager')
  process.exit(1)
}

await mongoose.connect(uri)
console.log(`Connected to ${mongoose.connection.host}`)

const db = mongoose.connection.db
const sheep = await db.collection('sheep').find({}).toArray()

let migrated = 0
let skipped = 0

for (const s of sheep) {
  const tag = s.tagNumber
  const gender = s.gender

  if (/^[FM]\d{4}$/.test(tag)) {
    skipped++
    continue
  }

  const numMatch = tag.match(/\d+/)
  const num = numMatch ? numMatch[0] : '0'
  const prefix = gender === 'female' ? 'F' : 'M'
  const newTag = `${prefix}${num.padStart(4, '0')}`

  await db.collection('sheep').updateOne(
    { _id: s._id },
    { $set: { tagNumber: newTag } }
  )

  console.log(`  ${tag} (${gender}) -> ${newTag}`)
  migrated++
}

console.log(`\nDone: ${migrated} migrated, ${skipped} already in new format`)

await mongoose.disconnect()
process.exit(0)
