'use strict'
/* global describe, it */
const assert = require('assert')
const supertest = require('supertest')
const _ = require('lodash')

describe('Public UserController', () => {
  let request, publicUser, uploadID, userID

  before((done) => {
    request = supertest('http://localhost:3000')
    publicUser = supertest.agent(global.app.spools.express.server)

    done()
  })

  it('should exist', () => {
    assert(global.app.api.controllers['UserController'])
    assert(global.app.controllers['UserController'])
  })

  it('It should not update the user\'s name', (done) => {
    publicUser
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
    publicUser
      .post('/api/users/upload/csv')
      .attach('file', 'test/fixtures/user_upload.csv')
      .expect(403)
      .end((err, res) => {
        done(err)
      })
  })
  it('should not process upload', (done) => {
    // console.log('UPLOAD ID', uploadID)
    publicUser
      .post('/api/users/upload/process/1')
      .send({})
      .expect(403)
      .end((err, res) => {
        done(err)
      })
  })
  it('should not get all users', (done) => {
    publicUser
      .get('/api/users')
      .set('Accept', 'application/json') //set header for this test
      .expect(403)
      .end((err, res) => {
        done(err)
      })
  })
  it('should not get user by id', (done) => {
    publicUser
      .get(`/api/user/${ userID }`)
      .set('Accept', 'application/json') //set header for this test
      .expect(403)
      .end((err, res) => {
        done(err)
      })
  })
  it('should not add role to user by id', (done) => {
    publicUser
      .post(`/api/user/${ userID }/addRole/test`)
      .set('Accept', 'application/json') //set header for this test
      .expect(403)
      .end((err, res) => {
        done(err)
      })
  })
  it('should not remove role from user by id', (done) => {
    publicUser
      .post(`/api/user/${ userID }/removeRole/test`)
      .set('Accept', 'application/json') //set header for this test
      .expect(403)
      .end((err, res) => {
        done(err)
      })
  })
  it('should not get roles by user id', (done) => {
    publicUser
      .get(`/api/user/${ userID }/roles`)
      .set('Accept', 'application/json') //set header for this test
      .expect(403)
      .end((err, res) => {
        done(err)
      })
  })
  it('should not search a user', (done) => {
    publicUser
      .get('/api/users/search')
      .query({term: 'scott'})
      .set('Accept', 'application/json') //set header for this test
      .expect(403)
      .end((err, res) => {
        done(err)
      })
  })
})
