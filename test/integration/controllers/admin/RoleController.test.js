'use strict'
/* global describe, it */
const assert = require('assert')
const supertest = require('supertest')
const _ = require('lodash')

describe('RoleController', () => {
  let request, adminUser, userID

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
    assert(global.app.api.controllers['RoleController'])
  })
  it('should get all roles', (done) => {
    adminUser
      .get('/api/roles')
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

        done(err)
      })
  })
})
