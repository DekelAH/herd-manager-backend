import supertest from 'supertest'
import app from '../src/app.js'

export const request = supertest(app)

export async function createTestUser(overrides = {}) {
  const userData = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123',
    farmName: 'Test Farm',
    ...overrides
  }

  const res = await request.post('/api/auth/signup').send(userData)
  return {
    user: res.body.data.user,
    accessToken: res.body.data.accessToken,
    refreshToken: res.body.data.refreshToken
  }
}

export async function createTestSheep(
  accessToken: string,
  overrides = {}
) {
  const sheepData = {
    tagNumber: 'SH001',
    gender: 'female',
    birthDate: '2022-03-15',
    weight: 65,
    breed: 'Assaf',
    fertility: 'BB',
    isPregnant: false,
    healthStatus: 'healthy',
    notes: 'Test sheep',
    ...overrides
  }

  const res = await request
    .post('/api/sheep')
    .set('Authorization', `Bearer ${accessToken}`)
    .send(sheepData)

  return res.body.data.sheep
}
