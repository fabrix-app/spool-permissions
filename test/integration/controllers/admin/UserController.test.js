'use strict'
/* global describe, it */
const assert = require('assert')
const supertest = require('supertest')
const _ = require('lodash')

describe('Admin UserController', () => {
  let request, adminUser, uploadID, userID

  before((done) => {
    request = supertest('http://localhost:3000')
    adminUser = supertest.agent(global.app.spools.express.server)

    adminUser
      .post('/api/auth/local')
      .set('Accept', 'application/json') //set header for this test
      .send({username: 'admin', password: 'admin1234'})
      .expect(200)
      .end((err, res) => {
        // console.log('BROKE',err, res.body)
        userID = res.body.user.id
        console.log(res.body)
        done(err)
      })
  })

  it('should exist', () => {
    assert(global.app.api.controllers['UserController'])
  })

  it('It should update the user\'s name', (done) => {
    adminUser
      .put('/api/user')
      .set('Accept', 'application/json') //set header for this test
      .send({
        email: 'scott@scott.com'
      })
      .expect(200)
      .end((err, res) => {
        // console.log('THIS USER',res.body)
        assert.equal(res.body.id, userID)
        assert.equal(res.body.email, 'scott@scott.com')
        done(err)
      })
  })
  it('It should upload user_upload.csv', (done) => {
    adminUser
      .post('/api/user/uploadCSV')
      .attach('file', 'test/fixtures/user_upload.csv')
      .expect(200)
      .end((err, res) => {
        console.log('BROKE upload body', err, res.body)
        assert.ok(res.body.result.upload_id)
        uploadID = res.body.result.upload_id
        assert.equal(res.body.result.users, 1)
        done(err)
      })
  })
  it('It should process upload', (done) => {
    console.log('UPLOAD ID', uploadID)
    adminUser
      .post(`/api/user/processUpload/${ uploadID }`)
      .send({})
      .expect(200)
      .end((err, res) => {
        // console.log('process upload body', res.body)
        assert.equal(res.body.users, 1)
        done(err)
      })
  })
  it('It should get all users', (done) => {
    adminUser
      .get('/api/users')
      .set('Accept', 'application/json') //set header for this test
      .expect(200)
      .end((err, res) => {

        assert.ok(res.headers['x-pagination-total'])
        assert.ok(res.headers['x-pagination-pages'])
        assert.ok(res.headers['x-pagination-page'])
        assert.ok(res.headers['x-pagination-limit'])
        assert.ok(res.headers['x-pagination-offset'])

        assert.equal(_.isNumber(parseInt(res.headers['x-pagination-total'])), true)
        assert.equal(_.isNumber(parseInt(res.headers['x-pagination-offset'])), true)
        assert.equal(_.isNumber(parseInt(res.headers['x-pagination-limit'])), true)
        assert.equal(_.isNumber(parseInt(res.headers['x-pagination-page'])), true)
        assert.equal(_.isNumber(parseInt(res.headers['x-pagination-pages'])), true)

        // console.log('THIS USERs',res.body)
        assert.equal(res.body.length, 2)
        assert.equal(res.body[0].username, 'test')
        assert.equal(res.body[1].username, 'admin')
        done(err)
      })
  })
  it('It should get user by id', (done) => {
    adminUser
      .get(`/api/user/${ userID }`)
      .set('Accept', 'application/json') //set header for this test
      .expect(200)
      .end((err, res) => {
        // console.log('THIS USER',res.body)
        assert.equal(res.body.id, userID)
        assert.equal(res.body.username, 'admin')
        assert.equal(res.body.email, 'scott@scott.com')
        done(err)
      })
  })
  it('It should add role to user by id', (done) => {
    adminUser
      .post(`/api/user/${ userID }/addRole/test`)
      .set('Accept', 'application/json') //set header for this test
      .expect(200)
      .end((err, res) => {
        assert.equal(res.body.id, userID)
        assert.equal(res.body.roles.length, 2)
        assert.equal(res.body.roles[0].name, 'admin')
        assert.equal(res.body.roles[1].name, 'test')
        done(err)
      })
  })
  it('It should remove role from user by id', (done) => {
    adminUser
      .post(`/api/user/${ userID }/removeRole/test`)
      .set('Accept', 'application/json') //set header for this test
      .expect(200)
      .end((err, res) => {
        // console.log('THIS USER',res.body)
        assert.equal(res.body.id, userID)
        assert.equal(res.body.roles.length, 1)
        assert.equal(res.body.roles[0].name, 'admin')
        done(err)
      })
  })
  it('It should get roles by user id', (done) => {
    adminUser
      .get(`/api/user/${ userID }/roles`)
      .set('Accept', 'application/json') //set header for this test
      .expect(200)
      .end((err, res) => {
        // console.log('THIS USER', res.body)
        assert.ok(res.headers['x-pagination-total'])
        assert.ok(res.headers['x-pagination-pages'])
        assert.ok(res.headers['x-pagination-page'])
        assert.ok(res.headers['x-pagination-limit'])
        assert.ok(res.headers['x-pagination-offset'])

        assert.equal(_.isNumber(parseInt(res.headers['x-pagination-total'])), true)
        assert.equal(_.isNumber(parseInt(res.headers['x-pagination-offset'])), true)
        assert.equal(_.isNumber(parseInt(res.headers['x-pagination-limit'])), true)
        assert.equal(_.isNumber(parseInt(res.headers['x-pagination-page'])), true)
        assert.equal(_.isNumber(parseInt(res.headers['x-pagination-pages'])), true)

        assert.equal(res.headers['x-pagination-total'], '1')
        assert.equal(res.headers['x-pagination-offset'], '0')
        assert.equal(res.headers['x-pagination-limit'], '10')
        assert.equal(res.headers['x-pagination-page'], '1')
        assert.equal(res.headers['x-pagination-pages'], '1')
        assert.equal(res.body.length, 1)
        assert.equal(res.body[0].name, 'admin')
        done(err)
      })
  })
  it('It search a user', (done) => {
    adminUser
      .get('/api/users/search')
      .query({term: 'scott'})
      .set('Accept', 'application/json') //set header for this test
      .expect(200)
      .end((err, res) => {
        // console.log('THIS USER', res.body)
        assert.ok(res.headers['x-pagination-total'])
        assert.ok(res.headers['x-pagination-pages'])
        assert.ok(res.headers['x-pagination-page'])
        assert.ok(res.headers['x-pagination-limit'])
        assert.ok(res.headers['x-pagination-offset'])

        assert.equal(_.isNumber(parseInt(res.headers['x-pagination-total'])), true)
        assert.equal(_.isNumber(parseInt(res.headers['x-pagination-offset'])), true)
        assert.equal(_.isNumber(parseInt(res.headers['x-pagination-limit'])), true)
        assert.equal(_.isNumber(parseInt(res.headers['x-pagination-page'])), true)
        assert.equal(_.isNumber(parseInt(res.headers['x-pagination-pages'])), true)

        assert.equal(res.headers['x-pagination-total'], '1')
        assert.equal(res.headers['x-pagination-offset'], '0')
        assert.equal(res.headers['x-pagination-limit'], '10')
        assert.equal(res.headers['x-pagination-page'], '1')
        assert.equal(res.headers['x-pagination-pages'], '1')
        assert.equal(res.body.length, 1)
        done(err)
      })
  })
})
