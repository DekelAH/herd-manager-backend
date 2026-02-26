import { describe, it, expect } from 'vitest'
import { request, createTestUser, createTestSheep } from '../../../tests/helpers.js'

describe('Matching Module', () => {
  describe('GET /api/matching/:sheepId', () => {
    it('should return compatible matches', async () => {
      const { accessToken } = await createTestUser()

      const male = await createTestSheep(accessToken, {
        tagNumber: 'MATCH-M1',
        gender: 'male',
        birthDate: '2021-01-01',
        fertility: 'BB'
      })

      await createTestSheep(accessToken, {
        tagNumber: 'MATCH-F1',
        gender: 'female',
        birthDate: '2021-06-01',
        fertility: 'BB'
      })

      const res = await request
        .get(`/api/matching/${male._id}`)
        .set('Authorization', `Bearer ${accessToken}`)

      expect(res.status).toBe(200)
      expect(res.body.data.matches.length).toBeGreaterThan(0)
      expect(res.body.data.matches[0].isCompatible).toBe(true)
    })

    it('should block parent-child matching', async () => {
      const { accessToken } = await createTestUser()

      const mother = await createTestSheep(accessToken, {
        tagNumber: 'BLK-MOM',
        gender: 'female',
        birthDate: '2020-01-01',
        fertility: 'BB'
      })

      const son = await createTestSheep(accessToken, {
        tagNumber: 'BLK-SON',
        gender: 'male',
        birthDate: '2022-06-01',
        fertility: 'BB',
        mother: mother._id
      })

      const res = await request
        .get(`/api/matching/${son._id}`)
        .set('Authorization', `Bearer ${accessToken}`)

      expect(res.status).toBe(200)
      const motherMatch = res.body.data.matches.find(
        (m: { sheep: { tagNumber: string } }) => m.sheep.tagNumber === 'BLK-MOM'
      )
      expect(motherMatch.isCompatible).toBe(false)
    })

    it('should block sibling matching', async () => {
      const { accessToken } = await createTestUser()

      const mother = await createTestSheep(accessToken, {
        tagNumber: 'SIB-MOM',
        gender: 'female',
        birthDate: '2019-01-01'
      })

      const sister = await createTestSheep(accessToken, {
        tagNumber: 'SIB-SIS',
        gender: 'female',
        birthDate: '2022-03-01',
        fertility: 'BB',
        mother: mother._id
      })

      const brother = await createTestSheep(accessToken, {
        tagNumber: 'SIB-BRO',
        gender: 'male',
        birthDate: '2022-03-01',
        fertility: 'BB',
        mother: mother._id
      })

      const res = await request
        .get(`/api/matching/${brother._id}`)
        .set('Authorization', `Bearer ${accessToken}`)

      expect(res.status).toBe(200)
      const sisterMatch = res.body.data.matches.find(
        (m: { sheep: { tagNumber: string } }) => m.sheep.tagNumber === 'SIB-SIS'
      )
      expect(sisterMatch.isCompatible).toBe(false)
    })

    it('should exclude pregnant females', async () => {
      const { accessToken } = await createTestUser()

      const male = await createTestSheep(accessToken, {
        tagNumber: 'PREG-M1',
        gender: 'male',
        birthDate: '2021-01-01'
      })

      await createTestSheep(accessToken, {
        tagNumber: 'PREG-F1',
        gender: 'female',
        birthDate: '2021-06-01',
        isPregnant: true,
        pregnancyStartDate: '2025-10-01'
      })

      const res = await request
        .get(`/api/matching/${male._id}`)
        .set('Authorization', `Bearer ${accessToken}`)

      expect(res.status).toBe(200)
      const pregnantMatch = res.body.data.matches.find(
        (m: { sheep: { tagNumber: string } }) => m.sheep.tagNumber === 'PREG-F1'
      )
      expect(pregnantMatch).toBeUndefined()
    })
  })

  describe('GET /api/matching/stats', () => {
    it('should return breeding statistics', async () => {
      const { accessToken } = await createTestUser()

      await createTestSheep(accessToken, {
        tagNumber: 'STAT-M1',
        gender: 'male',
        birthDate: '2021-01-01'
      })

      await createTestSheep(accessToken, {
        tagNumber: 'STAT-F1',
        gender: 'female',
        birthDate: '2021-06-01'
      })

      const res = await request
        .get('/api/matching/stats')
        .set('Authorization', `Bearer ${accessToken}`)

      expect(res.status).toBe(200)
      expect(res.body.data.stats.totalMales).toBe(1)
      expect(res.body.data.stats.totalFemales).toBe(1)
      expect(res.body.data.stats.breedingAgeMales).toBeGreaterThanOrEqual(0)
    })

    it('should only include current user\'s sheep in stats', async () => {
      const user1 = await createTestUser({ username: 'stat1', email: 's1@test.com' })
      const user2 = await createTestUser({ username: 'stat2', email: 's2@test.com' })

      await createTestSheep(user1.accessToken, { tagNumber: 'S1-M1', gender: 'male' })
      await createTestSheep(user1.accessToken, { tagNumber: 'S1-F1', gender: 'female' })
      await createTestSheep(user2.accessToken, { tagNumber: 'S2-M1', gender: 'male' })

      const res = await request
        .get('/api/matching/stats')
        .set('Authorization', `Bearer ${user2.accessToken}`)

      expect(res.status).toBe(200)
      expect(res.body.data.stats.totalMales).toBe(1)
      expect(res.body.data.stats.totalFemales).toBe(0)
    })
  })
})
