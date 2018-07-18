'use strict'
/* global describe, it */
const assert = require('assert')
const supertest = require('supertest')
const _ = require('lodash')

describe('Public RoleController', () => {
  let request, publicUser

  before((done) => {
    request = supertest('http://localhost:3000')
    publicUser = supertest.agent(global.app.spools.express.server)

    done()
  })

  it('should exist', () => {
    assert(global.app.api.controllers['RoleController'])
    assert(global.app.controllers['RoleController'])
  })

  it('should not get all roles', (done) => {
    publicUser
      .get('/api/roles')
      .set('Accept', 'application/json') //set header for this test
      .expect(403)
      .end((err, res) => {
        done(err)
      })
  })
})
