import { describe, it, expect } from 'vitest'
import { request, createTestUser } from '../../../tests/helpers.js'

describe('Auth Module', () => {
  describe('POST /api/auth/signup', () => {
    it('should register a new user', async () => {
      const res = await request.post('/api/auth/signup').send({
        username: 'newuser',
        email: 'new@example.com',
        password: 'password123',
        farmName: 'New Farm'
      })

      expect(res.status).toBe(201)
      expect(res.body.status).toBe('success')
      expect(res.body.data.user.username).toBe('newuser')
      expect(res.body.data.accessToken).toBeDefined()
      expect(res.body.data.refreshToken).toBeDefined()
      expect(res.body.data.user.password).toBeUndefined()
    })

    it('should reject duplicate username', async () => {
      await createTestUser({ username: 'duplicate' })

      const res = await request.post('/api/auth/signup').send({
        username: 'duplicate',
        email: 'other@example.com',
        password: 'password123'
      })

      expect(res.status).toBe(409)
    })

    it('should reject invalid email', async () => {
      const res = await request.post('/api/auth/signup').send({
        username: 'user1',
        email: 'not-an-email',
        password: 'password123'
      })

      expect(res.status).toBe(400)
    })

    it('should reject short password', async () => {
      const res = await request.post('/api/auth/signup').send({
        username: 'user1',
        email: 'valid@example.com',
        password: '123'
      })

      expect(res.status).toBe(400)
    })
  })

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      await createTestUser({ username: 'logintest', email: 'login@example.com' })

      const res = await request.post('/api/auth/login').send({
        username: 'logintest',
        password: 'password123'
      })

      expect(res.status).toBe(200)
      expect(res.body.data.accessToken).toBeDefined()
      expect(res.body.data.refreshToken).toBeDefined()
    })

    it('should reject wrong password', async () => {
      await createTestUser({ username: 'wrongpw', email: 'wrongpw@example.com' })

      const res = await request.post('/api/auth/login').send({
        username: 'wrongpw',
        password: 'wrongpassword'
      })

      expect(res.status).toBe(401)
    })

    it('should reject non-existent user', async () => {
      const res = await request.post('/api/auth/login').send({
        username: 'nonexistent',
        password: 'password123'
      })

      expect(res.status).toBe(401)
    })
  })

  describe('POST /api/auth/refresh', () => {
    it('should issue new token pair', async () => {
      const { refreshToken } = await createTestUser({
        username: 'refreshtest',
        email: 'refresh@example.com'
      })

      const res = await request.post('/api/auth/refresh').send({ refreshToken })

      expect(res.status).toBe(200)
      expect(res.body.data.accessToken).toBeDefined()
      expect(res.body.data.refreshToken).toBeDefined()
      expect(res.body.data.refreshToken).not.toBe(refreshToken)
    })

    it('should reject reused refresh token', async () => {
      const { refreshToken } = await createTestUser({
        username: 'reusetest',
        email: 'reuse@example.com'
      })

      await request.post('/api/auth/refresh').send({ refreshToken })

      const res = await request.post('/api/auth/refresh').send({ refreshToken })
      expect(res.status).toBe(401)
    })
  })

  describe('GET /api/auth/me', () => {
    it('should return current user', async () => {
      const { accessToken } = await createTestUser({
        username: 'metest',
        email: 'me@example.com'
      })

      const res = await request
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)

      expect(res.status).toBe(200)
      expect(res.body.data.user.username).toBe('metest')
    })

    it('should reject without token', async () => {
      const res = await request.get('/api/auth/me')
      expect(res.status).toBe(401)
    })
  })

  describe('POST /api/auth/logout', () => {
    it('should invalidate refresh token', async () => {
      const { accessToken, refreshToken } = await createTestUser({
        username: 'logouttest',
        email: 'logout@example.com'
      })

      const logoutRes = await request
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ refreshToken })

      expect(logoutRes.status).toBe(200)

      const refreshRes = await request
        .post('/api/auth/refresh')
        .send({ refreshToken })

      expect(refreshRes.status).toBe(401)
    })
  })
})
