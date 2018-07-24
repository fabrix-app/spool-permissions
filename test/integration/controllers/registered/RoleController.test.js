'use strict'
/* global describe, it */
const assert = require('assert')
const supertest = require('supertest')
const _ = require('lodash')

describe('Registered RoleController', () => {
  let request, registeredUser, uploadID, userID

  before((done) => {
    request = supertest('http://localhost:3000')
    registeredUser = supertest.agent(global.app.spools.express.server)

    registeredUser.post('/api/auth/local/register')
      .send({
        email: 'rolecontroller@example.com',
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
    assert(global.app.api.controllers['RoleController'])
    assert(global.app.controllers['RoleController'])
  })

  it('should not get all roles', (done) => {
    registeredUser
      .get('/api/roles')
      .set('Accept', 'application/json') //set header for this test
      .expect(403)
      .end((err, res) => {
        done(err)
      })
  })
})
