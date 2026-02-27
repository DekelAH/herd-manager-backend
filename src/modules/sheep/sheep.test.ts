import { describe, it, expect } from 'vitest'
import { request, createTestUser, createTestSheep } from '../../../tests/helpers.js'

describe('Sheep Module', () => {
  describe('POST /api/sheep', () => {
    it('should create a new sheep with auto-prefixed tag', async () => {
      const { accessToken } = await createTestUser()

      const res = await request
        .post('/api/sheep')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          tagNumber: '1',
          gender: 'female',
          birthDate: '2022-03-15',
          weight: 65,
          breed: 'Assaf',
          fertility: 'BB',
          healthStatus: 'healthy'
        })

      expect(res.status).toBe(201)
      expect(res.body.data.sheep.tagNumber).toBe('F0001')
    })

    it('should prefix male sheep with M', async () => {
      const { accessToken } = await createTestUser()

      const res = await request
        .post('/api/sheep')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          tagNumber: '42',
          gender: 'male',
          birthDate: '2021-06-01',
          weight: 85,
          breed: 'Assaf',
          fertility: 'BB',
          healthStatus: 'healthy'
        })

      expect(res.status).toBe(201)
      expect(res.body.data.sheep.tagNumber).toBe('M0042')
    })

    it('should reject duplicate tag number for same owner', async () => {
      const { accessToken } = await createTestUser()
      await createTestSheep(accessToken, { tagNumber: '2', gender: 'female' })

      const res = await request
        .post('/api/sheep')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          tagNumber: '2',
          gender: 'female',
          birthDate: '2022-01-01',
          weight: 80,
          breed: 'Assaf',
          fertility: 'BB',
          healthStatus: 'healthy'
        })

      expect(res.status).toBe(409)
    })

    it('should allow same number for different genders', async () => {
      const { accessToken } = await createTestUser()
      await createTestSheep(accessToken, { tagNumber: '3', gender: 'female' })

      const res = await request
        .post('/api/sheep')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          tagNumber: '3',
          gender: 'male',
          birthDate: '2022-01-01',
          weight: 80,
          breed: 'Assaf',
          fertility: 'BB',
          healthStatus: 'healthy'
        })

      expect(res.status).toBe(201)
      expect(res.body.data.sheep.tagNumber).toBe('M0003')
    })

    it('should allow same tag number for different owners', async () => {
      const user1 = await createTestUser({ username: 'owner1', email: 'o1@test.com' })
      const user2 = await createTestUser({ username: 'owner2', email: 'o2@test.com' })

      await createTestSheep(user1.accessToken, { tagNumber: '5' })

      const res = await request
        .post('/api/sheep')
        .set('Authorization', `Bearer ${user2.accessToken}`)
        .send({
          tagNumber: '5',
          gender: 'female',
          birthDate: '2022-03-15',
          weight: 65,
          breed: 'Assaf',
          fertility: 'BB',
          healthStatus: 'healthy'
        })

      expect(res.status).toBe(201)
    })
  })

  describe('GET /api/sheep', () => {
    it('should only return sheep owned by the user', async () => {
      const user1 = await createTestUser({ username: 'list1', email: 'l1@test.com' })
      const user2 = await createTestUser({ username: 'list2', email: 'l2@test.com' })

      await createTestSheep(user1.accessToken, { tagNumber: '10' })
      await createTestSheep(user1.accessToken, { tagNumber: '11' })
      await createTestSheep(user2.accessToken, { tagNumber: '12' })

      const res1 = await request
        .get('/api/sheep')
        .set('Authorization', `Bearer ${user1.accessToken}`)

      expect(res1.status).toBe(200)
      expect(res1.body.results).toBe(2)

      const res2 = await request
        .get('/api/sheep')
        .set('Authorization', `Bearer ${user2.accessToken}`)

      expect(res2.status).toBe(200)
      expect(res2.body.results).toBe(1)
    })

    it('should filter by gender', async () => {
      const { accessToken } = await createTestUser()

      await createTestSheep(accessToken, { tagNumber: '20', gender: 'female' })
      await createTestSheep(accessToken, { tagNumber: '21', gender: 'male' })

      const res = await request
        .get('/api/sheep?gender=female')
        .set('Authorization', `Bearer ${accessToken}`)

      expect(res.status).toBe(200)
      expect(res.body.results).toBe(1)
      expect(res.body.data.sheep[0].gender).toBe('female')
    })

    it('should search by tag number', async () => {
      const { accessToken } = await createTestUser()

      await createTestSheep(accessToken, { tagNumber: '100', gender: 'female' })
      await createTestSheep(accessToken, { tagNumber: '200', gender: 'female' })

      const res = await request
        .get('/api/sheep?search=0100')
        .set('Authorization', `Bearer ${accessToken}`)

      expect(res.status).toBe(200)
      expect(res.body.results).toBe(1)
    })
  })

  describe('GET /api/sheep/:id', () => {
    it('should return a single sheep', async () => {
      const { accessToken } = await createTestUser()
      const sheep = await createTestSheep(accessToken)

      const res = await request
        .get(`/api/sheep/${sheep._id}`)
        .set('Authorization', `Bearer ${accessToken}`)

      expect(res.status).toBe(200)
      expect(res.body.data.sheep.tagNumber).toBe(sheep.tagNumber)
    })

    it('should not return another user\'s sheep', async () => {
      const user1 = await createTestUser({ username: 'get1', email: 'g1@test.com' })
      const user2 = await createTestUser({ username: 'get2', email: 'g2@test.com' })

      const sheep = await createTestSheep(user1.accessToken)

      const res = await request
        .get(`/api/sheep/${sheep._id}`)
        .set('Authorization', `Bearer ${user2.accessToken}`)

      expect(res.status).toBe(404)
    })
  })

  describe('PUT /api/sheep/:id', () => {
    it('should update a sheep', async () => {
      const { accessToken } = await createTestUser()
      const sheep = await createTestSheep(accessToken)

      const res = await request
        .put(`/api/sheep/${sheep._id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ weight: 70, notes: 'Updated' })

      expect(res.status).toBe(200)
      expect(res.body.data.sheep.weight).toBe(70)
      expect(res.body.data.sheep.notes).toBe('Updated')
    })

    it('should update tag prefix when gender changes', async () => {
      const { accessToken } = await createTestUser()
      const sheep = await createTestSheep(accessToken, { tagNumber: '30', gender: 'female' })

      expect(sheep.tagNumber).toBe('F0030')

      const res = await request
        .put(`/api/sheep/${sheep._id}`)
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ gender: 'male' })

      expect(res.status).toBe(200)
      expect(res.body.data.sheep.tagNumber).toBe('M0030')
    })

    it('should not update another user\'s sheep', async () => {
      const user1 = await createTestUser({ username: 'upd1', email: 'u1@test.com' })
      const user2 = await createTestUser({ username: 'upd2', email: 'u2@test.com' })

      const sheep = await createTestSheep(user1.accessToken)

      const res = await request
        .put(`/api/sheep/${sheep._id}`)
        .set('Authorization', `Bearer ${user2.accessToken}`)
        .send({ weight: 85 })

      expect(res.status).toBe(404)
    })
  })

  describe('DELETE /api/sheep/:id', () => {
    it('should delete a sheep', async () => {
      const { accessToken } = await createTestUser()
      const sheep = await createTestSheep(accessToken)

      const res = await request
        .delete(`/api/sheep/${sheep._id}`)
        .set('Authorization', `Bearer ${accessToken}`)

      expect(res.status).toBe(200)

      const getRes = await request
        .get(`/api/sheep/${sheep._id}`)
        .set('Authorization', `Bearer ${accessToken}`)

      expect(getRes.status).toBe(404)
    })

    it('should not delete a sheep with offspring', async () => {
      const { accessToken } = await createTestUser()

      const mother = await createTestSheep(accessToken, {
        tagNumber: '40',
        gender: 'female',
        birthDate: '2020-01-01'
      })

      await createTestSheep(accessToken, {
        tagNumber: '41',
        gender: 'female',
        birthDate: '2023-01-01',
        mother: mother._id
      })

      const res = await request
        .delete(`/api/sheep/${mother._id}`)
        .set('Authorization', `Bearer ${accessToken}`)

      expect(res.status).toBe(400)
    })
  })

  describe('GET /api/sheep/:id/family', () => {
    it('should return family members', async () => {
      const { accessToken } = await createTestUser()

      const mother = await createTestSheep(accessToken, {
        tagNumber: '50',
        gender: 'female',
        birthDate: '2020-01-01'
      })

      const father = await createTestSheep(accessToken, {
        tagNumber: '51',
        gender: 'male',
        birthDate: '2019-06-01'
      })

      const child = await createTestSheep(accessToken, {
        tagNumber: '52',
        gender: 'female',
        birthDate: '2023-01-01',
        mother: mother._id,
        father: father._id
      })

      const res = await request
        .get(`/api/sheep/${child._id}/family`)
        .set('Authorization', `Bearer ${accessToken}`)

      expect(res.status).toBe(200)
      expect(res.body.data.mother.tagNumber).toBe('F0050')
      expect(res.body.data.father.tagNumber).toBe('M0051')
    })
  })
})
