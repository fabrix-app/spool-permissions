'use strict'
/* global describe, it */
const assert = require('assert')
const supertest = require('supertest')
const _ = require('lodash')

describe('Registered UserController', () => {
  let request, registeredUser, uploadID, userID

  before((done) => {
    request = supertest('http://localhost:3000')
    registeredUser = supertest.agent(global.app.spools.express.server)

    registeredUser.post('/api/auth/local/register')
      .send({
        email: 'usercontroller@example.com',
        password: 'admin1234'
      })
      .set('Accept', 'application/json')
      .expect(200)
      .end((err, res) => {
        assert.ok(res.body.user.id)
        done(err)
      })
  })

  it('should exist', () => {
    assert(global.app.api.controllers['UserController'])
    assert(global.app.controllers['UserController'])
  })

  it('It should update the user\'s name', (done) => {
    registeredUser
      .post('/api/user')
      .set('Accept', 'application/json') //set header for this test
      .send({
        email: 'scott@scott.com'
      })
      .expect(403)
      .end((err, res) => {
        done(err)
      })
  })
  it.skip('should not upload user_upload.csv', (done) => {
    registeredUser
      .post('/api/users/upload/csv')
      .attach('file', 'test/fixtures/user_upload.csv')
      .expect(403)
      .end((err, res) => {
        done(err)
      })
  })
  it('should not process upload', (done) => {
    // console.log('UPLOAD ID', uploadID)
    registeredUser
      .post('/api/users/upload/process/1')
      .send({})
      .expect(403)
      .end((err, res) => {
        done(err)
      })
  })
  it('should not get all users', (done) => {
    registeredUser
      .get('/api/users')
      .set('Accept', 'application/json') //set header for this test
      .expect(403)
      .end((err, res) => {
        done(err)
      })
  })
  it('should not get user by id', (done) => {
    registeredUser
      .get(`/api/user/${ userID }`)
      .set('Accept', 'application/json') //set header for this test
      .expect(403)
      .end((err, res) => {
        done(err)
      })
  })
  it('should not add role to user by id', (done) => {
    registeredUser
      .post(`/api/user/${ userID }/addRole/test`)
      .set('Accept', 'application/json') //set header for this test
      .expect(403)
      .end((err, res) => {
        done(err)
      })
  })
  it('should not remove role from user by id', (done) => {
    registeredUser
      .post(`/api/user/${ userID }/removeRole/test`)
      .set('Accept', 'application/json') //set header for this test
      .expect(403)
      .end((err, res) => {
        done(err)
      })
  })
  it('should not get roles by user id', (done) => {
    registeredUser
      .get(`/api/user/${ userID }/roles`)
      .set('Accept', 'application/json') //set header for this test
      .expect(403)
      .end((err, res) => {
        done(err)
      })
  })
  it('should not search a user', (done) => {
    registeredUser
      .get('/api/users/search')
      .query({term: 'scott'})
      .set('Accept', 'application/json') //set header for this test
      .expect(403)
      .end((err, res) => {
        done(err)
      })
  })
})
